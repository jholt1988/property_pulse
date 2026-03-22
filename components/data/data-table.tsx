import { Badge } from "@/components/ui/badge";

export interface PropertyRow {
  property: string;
  occupancy: string;
  risk: "Low" | "Moderate" | "Elevated";
  status: string;
}

export function PropertyTable({ rows }: { rows: PropertyRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Property</th>
            <th className="px-4 py-3 font-medium">Occupancy</th>
            <th className="px-4 py-3 font-medium">Risk</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.property} className="border-t border-white/10 text-slate-200">
              <td className="px-4 py-4">{row.property}</td>
              <td className="px-4 py-4">{row.occupancy}</td>
              <td className="px-4 py-4"><RiskBadge risk={row.risk} /></td>
              <td className="px-4 py-4 text-slate-400">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskBadge({ risk }: { risk: PropertyRow["risk"] }) {
  if (risk === "Low") return <Badge tone="success">Low</Badge>;
  if (risk === "Moderate") return <Badge tone="warning">Moderate</Badge>;
  return <Badge tone="error">Elevated</Badge>;
}
