export function reconcileIds(activeIds: string[], scheduledIds: string[]) {
  const active = new Set(activeIds);
  const scheduled = new Set(scheduledIds);
  return {
    added: activeIds.filter((id) => !scheduled.has(id)),
    removed: scheduledIds.filter((id) => !active.has(id)),
  };
}
