export type CellState = 0 | 1 | 2 | 3;

export const HABIT_ROWS = 10;
export const DAYS = 31;
export const SCORE_ROWS = 8;
export const SCORE_ROW_LABELS = [10, 9, 8, 7, 6, 5, 4, 3] as const;
export const HABIT_CATEGORIES = ["Health", "Work", "Learning", "Mindfulness", "General"] as const;
