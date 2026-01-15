// Unified balance scores type for 7 spheres
export interface BalanceScores {
  spirituality: number;
  relationships: number;
  health: number;
  finance: number;
  career: number;
  rest: number;
  environment: number;
}

export const DEFAULT_SCORES: BalanceScores = {
  spirituality: 0,
  relationships: 0,
  health: 0,
  finance: 0,
  career: 0,
  rest: 0,
  environment: 0,
};

export const SPHERE_KEYS = [
  "spirituality",
  "relationships", 
  "health",
  "finance",
  "career",
  "rest",
  "environment",
] as const;

export type SphereKey = keyof BalanceScores;
