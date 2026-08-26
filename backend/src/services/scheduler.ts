const HOUR_MS = 60 * 60 * 1000;

export interface SlotAssignment {
  scheduledAt: Date;
  windowIndex: number;
}

/**
 * Assigns each recipient a send time, spaced by delayMs, while never letting
 * more than hourlyLimit land in the same hour-window relative to startTime.
 * Overflow rolls into the next window instead of being dropped.
 */
export function assignSendSlots(
  count: number,
  startTime: Date,
  delayMs: number,
  hourlyLimit: number
): SlotAssignment[] {
  const start = startTime.getTime();
  let currentTime = start;
  const counts = new Map<number, number>();
  const slots: SlotAssignment[] = [];

  for (let i = 0; i < count; i++) {
    let windowIndex = Math.floor((currentTime - start) / HOUR_MS);

    if ((counts.get(windowIndex) ?? 0) >= hourlyLimit) {
      windowIndex += 1;
      currentTime = start + windowIndex * HOUR_MS;
    }

    slots.push({ scheduledAt: new Date(currentTime), windowIndex });
    counts.set(windowIndex, (counts.get(windowIndex) ?? 0) + 1);
    currentTime += delayMs;
  }

  return slots;
}

export function windowIndexFor(scheduledAt: Date, startTime: Date): number {
  return Math.floor((scheduledAt.getTime() - startTime.getTime()) / HOUR_MS);
}

export { HOUR_MS };
