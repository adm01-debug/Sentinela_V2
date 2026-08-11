/**
 * Half-Space Trees (HST) — streaming variant of Isolation Forest.
 *
 * Anomaly score in [0,1]: higher = more anomalous.
 * No external dependencies; works in Deno edge runtime.
 *
 * Reference: Tan, Ting, Liu (2011) "Fast Anomaly Detection for Streaming Data"
 */

export interface HSTConfig {
  numTrees: number;
  maxDepth: number;
  windowSize: number;
}

interface HSTNode {
  feature?: number;
  splitValue?: number;
  left?: HSTNode;
  right?: HSTNode;
  rMass: number; // reference mass (training window)
  lMass: number; // latest mass (current window)
  depth: number;
  isLeaf: boolean;
}

const DEFAULT_CONFIG: HSTConfig = {
  numTrees: 50,
  maxDepth: 8,
  windowSize: 250,
};

function buildTree(numFeatures: number, maxDepth: number, depth = 0): HSTNode {
  if (depth >= maxDepth) {
    return { rMass: 0, lMass: 0, depth, isLeaf: true };
  }
  const feature = Math.floor(Math.random() * numFeatures);
  const splitValue = Math.random();
  return {
    feature,
    splitValue,
    left: buildTree(numFeatures, maxDepth, depth + 1),
    right: buildTree(numFeatures, maxDepth, depth + 1),
    rMass: 0,
    lMass: 0,
    depth,
    isLeaf: false,
  };
}

function updateNode(node: HSTNode, vec: number[], useReference: boolean): void {
  if (useReference) node.rMass++;
  else node.lMass++;
  if (node.isLeaf || node.feature === undefined || node.splitValue === undefined) return;
  const v = vec[node.feature] ?? 0.5;
  if (v < node.splitValue) updateNode(node.left!, vec, useReference);
  else updateNode(node.right!, vec, useReference);
}

function scoreNode(node: HSTNode, vec: number[]): number {
  // Score = mass * 2^depth at leaf (lower mass at deeper leaf = anomaly)
  if (node.isLeaf || node.feature === undefined || node.splitValue === undefined) {
    return node.rMass * Math.pow(2, node.depth);
  }
  const v = vec[node.feature] ?? 0.5;
  if (v < node.splitValue) return scoreNode(node.left!, vec);
  return scoreNode(node.right!, vec);
}

export class HalfSpaceTrees {
  private trees: HSTNode[] = [];
  private cfg: HSTConfig;
  private numFeatures: number;
  private trained = false;

  constructor(numFeatures: number, config: Partial<HSTConfig> = {}) {
    this.numFeatures = numFeatures;
    this.cfg = { ...DEFAULT_CONFIG, ...config };
    for (let i = 0; i < this.cfg.numTrees; i++) {
      this.trees.push(buildTree(numFeatures, this.cfg.maxDepth));
    }
  }

  /** Train reference window with normalized [0,1] vectors */
  fit(vectors: number[][]): void {
    for (const v of vectors) {
      for (const tree of this.trees) updateNode(tree, v, true);
    }
    this.trained = true;
  }

  /**
   * Compute anomaly score for vector.
   * Returns [0,1] where 1 = highly anomalous.
   */
  score(vec: number[]): number {
    if (!this.trained) return 0;
    let totalMass = 0;
    let maxPossible = 0;
    for (const tree of this.trees) {
      totalMass += scoreNode(tree, vec);
      maxPossible += this.cfg.windowSize * Math.pow(2, this.cfg.maxDepth);
    }
    // Lower mass = more anomalous; invert + normalize
    const normalized = totalMass / Math.max(maxPossible, 1);
    return Math.max(0, Math.min(1, 1 - normalized));
  }
}

/** Normalize a value to [0,1] given baseline mean/std */
export function normalize(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0.5;
  // Map z-score [-3, 3] to [0, 1]
  const z = (value - mean) / stdDev;
  const clamped = Math.max(-3, Math.min(3, z));
  return (clamped + 3) / 6;
}

/** Compute z-score of a value relative to baseline */
export function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}
