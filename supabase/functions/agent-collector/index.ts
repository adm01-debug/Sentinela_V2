import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare global {
  interface EdgeRuntime {
    waitUntil(promise: Promise<unknown>): void;
  }
  const EdgeRuntime: EdgeRuntime;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-agent-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const agentKey = req.headers.get("x-agent-key");
    
    // Validate agent key from database
    if (!agentKey) {
      console.log("Missing agent key");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing agent key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the key exists and is active
    const { data: keyData, error: keyError } = await supabase
      .from("agent_keys")
      .select("id, is_active, employee_name, device_name")
      .eq("agent_key", agentKey)
      .maybeSingle();

    if (keyError || !keyData) {
      console.log("Invalid agent key:", agentKey.substring(0, 8) + "...");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid agent key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!keyData.is_active) {
      console.log("Inactive agent key:", keyData.id);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Agent key is inactive" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last_seen_at timestamp
    await supabase
      .from("agent_keys")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", keyData.id);

    const body = await req.json();
    const { type, data } = body;

    // Use employee_name and device_name from key if not provided in data
    const employeeName = data.employee_name || keyData.employee_name || "Unknown";
    const deviceName = data.device || keyData.device_name || "Unknown";

    console.log(`Received ${type} data from agent (key: ${keyData.id}):`, JSON.stringify(data).slice(0, 200));

    switch (type) {
      // NEW: Get violation rules for agent
      case "get_rules": {
        const { data: rules, error: rulesError } = await supabase
          .from("violation_rules")
          .select("id, rule_type, rule_value, description, severity, is_active, notify_employee, notify_admin")
          .eq("is_active", true);

        if (rulesError) {
          console.error("Error fetching rules:", rulesError);
          throw rulesError;
        }

        console.log(`Returning ${rules?.length || 0} active violation rules`);
        
        return new Response(
          JSON.stringify({ success: true, rules: rules || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "keystroke": {
        const { error } = await supabase.from("keystroke_logs").insert({
          employee_name: employeeName,
          device: deviceName,
          app_name: data.app_name,
          keystrokes_count: data.keystrokes_count,
          active_time_seconds: data.active_time_seconds,
          idle_time_seconds: data.idle_time_seconds,
          recorded_at: data.recorded_at || new Date().toISOString(),
        });
        if (error) throw error;
        break;
      }

      // Complete keystroke details (individual keys)
      case "keystroke_detail": {
        const { error } = await supabase.from("keystroke_details").insert({
          employee_name: employeeName,
          device: deviceName,
          app_name: data.app_name,
          window_title: data.window_title,
          key_pressed: data.key_pressed,
          key_code: data.key_code,
          modifiers: data.modifiers || [],
          is_sensitive: data.is_sensitive || false,
          recorded_at: data.recorded_at || new Date().toISOString(),
        });
        if (error) throw error;
        break;
      }

      // Batch keystroke details (array of keys)
      case "keystroke_details_batch": {
        const keys = data.keys || [];
        if (keys.length > 0) {
          const records = keys.map((k: any) => ({
            employee_name: employeeName,
            device: deviceName,
            app_name: k.app_name || data.app_name,
            window_title: k.window_title || data.window_title,
            key_pressed: k.key_pressed,
            key_code: k.key_code,
            modifiers: k.modifiers || [],
            is_sensitive: k.is_sensitive || false,
            recorded_at: k.recorded_at || new Date().toISOString(),
          }));
          const { error } = await supabase.from("keystroke_details").insert(records);
          if (error) throw error;
        }
        break;
      }

      // Click tracking
      case "click": {
        const { error } = await supabase.from("click_logs").insert({
          employee_name: employeeName,
          device: deviceName,
          app_name: data.app_name,
          window_title: data.window_title,
          click_type: data.click_type || 'left',
          x_position: data.x_position,
          y_position: data.y_position,
          target_element: data.target_element,
          url: data.url,
          recorded_at: data.recorded_at || new Date().toISOString(),
        });
        if (error) throw error;
        break;
      }

      // Batch click tracking
      case "clicks_batch": {
        const clicks = data.clicks || [];
        if (clicks.length > 0) {
          const records = clicks.map((c: any) => ({
            employee_name: employeeName,
            device: deviceName,
            app_name: c.app_name || data.app_name,
            window_title: c.window_title || data.window_title,
            click_type: c.click_type || 'left',
            x_position: c.x_position,
            y_position: c.y_position,
            target_element: c.target_element,
            url: c.url,
            recorded_at: c.recorded_at || new Date().toISOString(),
          }));
          const { error } = await supabase.from("click_logs").insert(records);
          if (error) throw error;
        }
        break;
      }

      case "productivity": {
        const { error } = await supabase.from("productivity_logs").insert({
          employee_name: employeeName,
          device: deviceName,
          productive_time_seconds: data.productive_time_seconds,
          unproductive_time_seconds: data.unproductive_time_seconds,
          neutral_time_seconds: data.neutral_time_seconds,
          apps_used: data.apps_used || [],
          recorded_date: data.recorded_date || new Date().toISOString().split('T')[0],
        });
        if (error) throw error;
        break;
      }

      case "screenshot": {
        const { data: insertedCapture, error } = await supabase.from("screen_captures").insert({
          employee_name: employeeName,
          device: deviceName,
          capture_url: data.capture_url,
          app_name: data.app_name,
          window_title: data.window_title,
          captured_at: data.captured_at || new Date().toISOString(),
        }).select('id, capture_url').single();
        if (error) throw error;
        
        // Trigger automatic OCR processing in background
        if (insertedCapture?.id && insertedCapture?.capture_url) {
          const ocrTask = async () => {
            try {
              const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
              if (!LOVABLE_API_KEY) {
                console.log("OCR skipped: LOVABLE_API_KEY not configured");
                return;
              }

              console.log(`Starting automatic OCR for screenshot ${insertedCapture.id}`);
              
              const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${LOVABLE_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  messages: [
                    {
                      role: "user",
                      content: [
                        {
                          type: "text",
                          text: "Extract ALL text visible in this screenshot. Return ONLY the extracted text, nothing else. If no text is visible, return 'NO_TEXT_FOUND'.",
                        },
                        {
                          type: "image_url",
                          image_url: { url: insertedCapture.capture_url },
                        },
                      ],
                    },
                  ],
                }),
              });

              if (!aiResponse.ok) {
                console.error(`OCR AI request failed: ${aiResponse.status}`);
                return;
              }

              const aiData = await aiResponse.json();
              const extractedText = aiData.choices?.[0]?.message?.content?.trim();

              if (extractedText && extractedText !== "NO_TEXT_FOUND") {
                await supabase
                  .from("screen_captures")
                  .update({
                    extracted_text: extractedText,
                    ocr_processed_at: new Date().toISOString(),
                  })
                  .eq("id", insertedCapture.id);
                console.log(`OCR completed for screenshot ${insertedCapture.id}`);

                // Check for sensitive keywords in extracted text
                const { data: keywordRules } = await supabase
                  .from("violation_rules")
                  .select("id, rule_value, description, severity, notify_admin, notify_employee")
                  .eq("rule_type", "blocked_keyword")
                  .eq("is_active", true);

                if (keywordRules && keywordRules.length > 0) {
                  const textLower = extractedText.toLowerCase();
                  const matchedKeywords: typeof keywordRules = [];

                  for (const rule of keywordRules) {
                    const keyword = rule.rule_value.toLowerCase();
                    if (textLower.includes(keyword)) {
                      matchedKeywords.push(rule);
                    }
                  }

                  // Create violations for matched keywords
                  if (matchedKeywords.length > 0) {
                    console.log(`Found ${matchedKeywords.length} sensitive keyword(s) in screenshot ${insertedCapture.id}`);
                    
                    for (const rule of matchedKeywords) {
                      const { error: violationError } = await supabase.from("security_violations").insert({
                        employee_name: employeeName,
                        device: deviceName,
                        policy_name: `Palavra Sensível: ${rule.rule_value}`,
                        violation_type: "blocked_keyword",
                        severity: rule.severity || "medium",
                        description: `Palavra sensível "${rule.rule_value}" detectada via OCR na captura de tela. ${rule.description || ''}`.trim(),
                        screenshot_url: insertedCapture.capture_url,
                        notified_admin: rule.notify_admin,
                        notified_employee: rule.notify_employee,
                      });

                      if (violationError) {
                        console.error("Error creating keyword violation:", violationError);
                      } else {
                        console.log(`VIOLATION created: blocked_keyword - ${rule.rule_value}`);
                      }
                    }
                  }
                }
              } else {
                await supabase
                  .from("screen_captures")
                  .update({
                    ocr_processed_at: new Date().toISOString(),
                  })
                  .eq("id", insertedCapture.id);
                console.log(`OCR completed (no text found) for screenshot ${insertedCapture.id}`);
              }
            } catch (ocrError) {
              console.error("OCR background task error:", ocrError);
            }
          };
          
          // Run OCR in background without blocking response
          EdgeRuntime.waitUntil(ocrTask());
        }
        break;
      }

      case "violation": {
        const severity = data.severity || "medium";
        const { data: violationRecord, error } = await supabase.from("security_violations").insert({
          employee_name: employeeName,
          policy_name: data.policy_name,
          violation_type: data.violation_type,
          severity: severity,
          description: data.description,
          device: deviceName,
          ip_address: data.ip_address,
          screenshot_url: data.screenshot_url,
          location: data.location,
          notified_admin: false,
          notified_employee: false,
        }).select('id').single();
        if (error) throw error;
        
        console.log(`VIOLATION recorded: ${data.violation_type} - ${data.description}`);
        
        // Trigger real-time notification for critical/high severity
        if ((severity === 'critical' || severity === 'high') && violationRecord?.id) {
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          
          const notifyTask = async () => {
            try {
              await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  title: `Violação ${severity === 'critical' ? 'Crítica' : 'Alta'} Detectada`,
                  body: `${employeeName}: ${data.description || data.policy_name}`,
                  severity: severity,
                  violation_id: violationRecord.id,
                  data: {
                    employee_name: employeeName,
                    device: deviceName,
                    violation_type: data.violation_type,
                    timestamp: new Date().toISOString()
                  }
                }),
              });
              console.log(`Push notification sent for violation ${violationRecord.id}`);
            } catch (notifyError) {
              console.error('Error sending push notification:', notifyError);
            }
          };
          
          EdgeRuntime.waitUntil(notifyTask());
        }
        break;
      }

      case "heartbeat": {
        console.log(`Heartbeat from ${employeeName} on ${deviceName}`);
        break;
      }

      // Session recording for Live View and Session Playback
      case "session_recording": {
        const { error } = await supabase.from("session_recordings").insert({
          employee_name: employeeName,
          device: deviceName,
          screenshot_url: data.screenshot_url,
          app_name: data.app_name,
          window_title: data.window_title,
          events: data.events || [],
          session_date: new Date().toISOString().split('T')[0],
          recorded_at: data.recorded_at || new Date().toISOString(),
        });
        if (error) throw error;
        console.log(`Session recording saved for ${employeeName}`);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown data type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing agent data:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
