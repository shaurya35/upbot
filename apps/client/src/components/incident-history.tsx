import type { Incident } from "@/lib/api";

export function IncidentHistory({ incidents }: { incidents: Incident[] }) {
  if (!incidents.length)
    return (
      <p className="py-5 text-sm text-slate-500">No incidents recorded yet.</p>
    );
  return (
    <>
      {incidents.map((incident) => (
        <div key={incident.id} className="border-t py-4 text-sm">
          <p className="font-medium">
            {incident.recoveredAt ? "Recovered" : "Ongoing"} ·{" "}
            {incident.reason || "Monitor unavailable"}
          </p>
          <p className="mt-1 text-slate-500">
            Started {new Date(incident.startedAt).toLocaleString()}
            {incident.recoveredAt &&
              ` · Recovered ${new Date(incident.recoveredAt).toLocaleString()} · ${Math.max(0, Math.round((Date.parse(incident.recoveredAt) - Date.parse(incident.startedAt)) / 1000))}s`}
          </p>
          {incident.deliveries.map((delivery) => (
            <p key={delivery.id} className="mt-1 text-xs text-slate-500">
              {delivery.eventType} webhook: {delivery.status.toLowerCase()} ·{" "}
              {delivery.attempts}{" "}
              {delivery.attempts === 1 ? "attempt" : "attempts"}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}
