import { CellState } from "./constants";

export type HabitStreakSummary = {
  currentStreak: number;
  longestStreak: number;
  weeklyStreak: number;
  monthlyChain: number;
  completionRate: number;
  trackedDays: number;
  completedDays: number;
  lastTrackedIndex: number;
  currentStreakStartIndex: number;
};

function isCompleted(cell: CellState) {
  return cell === 1;
}

function isTracked(cell: CellState) {
  return cell !== 0;
}

function countWeeklySuccess(cells: CellState[]) {
  const weekSize = 7;
  const weeks = Math.ceil(cells.length / weekSize);
  const weekStatus = Array.from({ length: weeks }, (_, weekIndex) => {
    const start = weekIndex * weekSize;
    const end = Math.min(start + weekSize, cells.length);
    const window = cells.slice(start, end);
    const completed = window.filter(isCompleted).length;
    const tracked = window.filter(isTracked).length;

    return {
      completed,
      tracked,
      success: tracked > 0 && completed >= 5,
    };
  });

  const lastTrackedIndex = cells.map((cell, index) => (isTracked(cell) ? index : -1)).filter((index) => index >= 0).at(-1) ?? -1;
  if (lastTrackedIndex < 0) {
    return 0;
  }

  let streak = 0;
  for (let weekIndex = Math.floor(lastTrackedIndex / weekSize); weekIndex >= 0; weekIndex -= 1) {
    const status = weekStatus[weekIndex];
    if (!status?.success) {
      break;
    }
    streak += 1;
  }

  return streak;
}

export function computeHabitStreakSummary(cells: CellState[]): HabitStreakSummary {
  let longestStreak = 0;
  let activeStreak = 0;
  let monthlyChain = 0;
  let completedDays = 0;
  let trackedDays = 0;
  let lastTrackedIndex = -1;
  let currentStreakStartIndex = -1;

  cells.forEach((cell, index) => {
    if (isTracked(cell)) {
      trackedDays += 1;
      lastTrackedIndex = index;
    }

    if (isCompleted(cell)) {
      completedDays += 1;
      activeStreak += 1;
      longestStreak = Math.max(longestStreak, activeStreak);
      if (monthlyChain === index) {
        monthlyChain += 1;
      }
    } else {
      activeStreak = 0;
    }
  });

  if (lastTrackedIndex >= 0) {
    let currentStreak = 0;
    for (let index = lastTrackedIndex; index >= 0; index -= 1) {
      if (!isCompleted(cells[index])) {
        break;
      }
      currentStreak += 1;
      currentStreakStartIndex = index;
    }

    return {
      currentStreak,
      longestStreak,
      weeklyStreak: countWeeklySuccess(cells),
      monthlyChain,
      completionRate: cells.length > 0 ? completedDays / cells.length : 0,
      trackedDays,
      completedDays,
      lastTrackedIndex,
      currentStreakStartIndex,
    };
  }

  return {
    currentStreak: 0,
    longestStreak,
    weeklyStreak: 0,
    monthlyChain,
    completionRate: cells.length > 0 ? completedDays / cells.length : 0,
    trackedDays,
    completedDays,
    lastTrackedIndex: -1,
    currentStreakStartIndex: -1,
  };
}
