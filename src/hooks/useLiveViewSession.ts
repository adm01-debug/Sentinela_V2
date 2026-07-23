import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type LiveViewStatus =
  | 'idle'
  | 'authorizing'
  | 'waiting_consent'
  | 'waiting_agent'
  | 'connecting'
  | 'live'
  | 'ended'
  | 'error';

export type ConsentState = 'pending' | 'granted' | 'denied' | 'not_required' | 'timeout';

export interface ConsentInfo {
  state: ConsentState;
  reason: string | null;
  decidedAt: string | null;
}

export interface LiveViewMetrics {
  fps: number;
  bitrateKbps: number;
  latencyMs: number;
  bytesReceived: number;
}

interface AuthorizeResponse {
  session_id: string;
  channel: string;
  ice_servers: RTCIceServer[];
  expires_at: string;
}

export interface UseLiveViewSession {
  status: LiveViewStatus;
  sessionId: string | null;
  error: string | null;
  metrics: LiveViewMetrics;
  consent: ConsentInfo;
  videoRef: React.RefObject<HTMLVideoElement>;
  start: () => Promise<void>;
  stop: (reason?: string) => Promise<void>;
  snapshot: () => string | null;
}


const DEFAULT_METRICS: LiveViewMetrics = {
  fps: 0,
  bitrateKbps: 0,
  latencyMs: 0,
  bytesReceived: 0,
};

export function useLiveViewSession(agentId: string | undefined): UseLiveViewSession {
  const [status, setStatus] = useState<LiveViewStatus>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<LiveViewMetrics>(DEFAULT_METRICS);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const metricsTimerRef = useRef<number | null>(null);
  const lastStatsRef = useRef<{ bytes: number; ts: number; frames: number }>({
    bytes: 0,
    ts: 0,
    frames: 0,
  });

  const cleanup = useCallback(() => {
    if (metricsTimerRef.current) {
      window.clearInterval(metricsTimerRef.current);
      metricsTimerRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((s) => s.track?.stop());
      pcRef.current.close();
      pcRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const stop = useCallback(
    async (reason = 'user_stopped') => {
      cleanup();
      setStatus('ended');
      if (sessionId) {
        await supabase
          .from('live_view_sessions')
          .update({ status: 'ended', ended_at: new Date().toISOString(), end_reason: reason })
          .eq('id', sessionId);
        await supabase.from('live_view_audit').insert({
          session_id: sessionId,
          company_id: (await supabase.from('live_view_sessions').select('company_id').eq('id', sessionId).maybeSingle()).data?.company_id,
          event: 'session.ended',
          payload: { reason },
        } as never);
      }
    },
    [cleanup, sessionId],
  );

  const start = useCallback(async () => {
    if (!agentId) {
      setError('agent_id ausente');
      setStatus('error');
      return;
    }
    setError(null);
    setStatus('authorizing');

    const { data, error: fnErr } = await supabase.functions.invoke<AuthorizeResponse>(
      'live-view-authorize',
      { body: { agent_id: agentId } },
    );
    if (fnErr || !data) {
      setError(fnErr?.message ?? 'authorize_failed');
      setStatus('error');
      return;
    }

    setSessionId(data.session_id);

    const pc = new RTCPeerConnection({ iceServers: data.ice_servers });
    pcRef.current = pc;

    pc.ontrack = (ev) => {
      if (videoRef.current) {
        videoRef.current.srcObject = ev.streams[0];
      }
      setStatus('live');
    };

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === 'failed' || s === 'closed') {
        void stop(`peer_${s}`);
      }
    };

    const channel = supabase.channel(data.channel, { config: { broadcast: { self: false } } });
    channelRef.current = channel;

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        channel.send({ type: 'broadcast', event: 'ice', payload: { from: 'viewer', candidate: ev.candidate } });
      }
    };

    channel
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          setStatus('connecting');
        } catch (e) {
          setError((e as Error).message);
          setStatus('error');
        }
      })
      .on('broadcast', { event: 'ice' }, async ({ payload }) => {
        if (payload?.from === 'agent' && payload.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch { /* ignore */ }
        }
      })
      .on('broadcast', { event: 'declined' }, ({ payload }) => {
        setError(payload?.reason ?? 'agent_declined');
        setStatus('ended');
        cleanup();
      })
      .subscribe(async (sub) => {
        if (sub !== 'SUBSCRIBED') return;
        setStatus('waiting_agent');
        // Create offer as recvonly
        pc.addTransceiver('video', { direction: 'recvonly' });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await channel.send({
          type: 'broadcast',
          event: 'offer',
          payload: { session_id: data.session_id, sdp: offer },
        });
      });

    // Metrics loop
    metricsTimerRef.current = window.setInterval(async () => {
      if (!pcRef.current) return;
      const stats = await pcRef.current.getStats();
      let bytes = 0;
      let frames = 0;
      let rtt = 0;
      stats.forEach((r) => {
        if (r.type === 'inbound-rtp' && (r as RTCInboundRtpStreamStats).kind === 'video') {
          const rr = r as RTCInboundRtpStreamStats;
          bytes = rr.bytesReceived ?? 0;
          frames = rr.framesDecoded ?? 0;
        }
        if (r.type === 'candidate-pair' && (r as RTCIceCandidatePairStats).state === 'succeeded') {
          rtt = ((r as RTCIceCandidatePairStats).currentRoundTripTime ?? 0) * 1000;
        }
      });
      const now = performance.now();
      const last = lastStatsRef.current;
      const dt = last.ts ? (now - last.ts) / 1000 : 1;
      const bps = ((bytes - last.bytes) * 8) / dt;
      const fps = (frames - last.frames) / dt;
      lastStatsRef.current = { bytes, ts: now, frames };
      setMetrics({
        fps: Math.max(0, Math.round(fps)),
        bitrateKbps: Math.max(0, Math.round(bps / 1000)),
        latencyMs: Math.round(rtt),
        bytesReceived: bytes,
      });
    }, 1500);
  }, [agentId, cleanup, stop]);

  const snapshot = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.readyState < 2) return null;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0);
    return canvas.toDataURL('image/png');
  }, []);

  return { status, sessionId, error, metrics, videoRef, start, stop, snapshot };
}
