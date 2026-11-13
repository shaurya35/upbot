type Observation = { status: "UP" | "DOWN" | "UNKNOWN"; createdAt: Date };

export function currentMonitorStatus(
  last: Observation | undefined,
  intervalSeconds: number,
  now = Date.now(),
) {
  if (
    !last ||
    now - last.createdAt.getTime() > Math.max(120000, intervalSeconds * 3000)
  )
    return "UNKNOWN";
  return last.status;
}
