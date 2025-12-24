// Congestion Control
export class CongestionController {
  private cwnd = 1; private ssthresh = 64; private mode: "slow-start" | "congestion-avoidance" = "slow-start";
  onAck(): void { if (this.mode === "slow-start") { this.cwnd *= 2; if (this.cwnd >= this.ssthresh) this.mode = "congestion-avoidance"; } else { this.cwnd += 1 / this.cwnd; } }
  onLoss(): void { this.ssthresh = Math.max(2, this.cwnd / 2); this.cwnd = 1; this.mode = "slow-start"; }
  getWindow(): number { return Math.floor(this.cwnd); }
  getStats() { return { cwnd: this.cwnd, ssthresh: this.ssthresh, mode: this.mode }; }
}
