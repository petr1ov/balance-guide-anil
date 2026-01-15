// Unified balance scores type for 4 spheres
export interface BalanceScores {
  spirituality: number;
  relationships: number;
  health: number;
  finance: number;
}

export const DEFAULT_SCORES: BalanceScores = {
  spirituality: 0,
  relationships: 0,
  health: 0,
  finance: 0,
};

export const SPHERE_KEYS = [
  "spirituality",
  "relationships", 
  "health",
  "finance",
] as const;

export type SphereKey = keyof BalanceScores;
