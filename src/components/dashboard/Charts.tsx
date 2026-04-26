import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell, ReferenceLine } from "recharts";
import type { SeriesPoint, RankPoint } from "@/data/statistik";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  boxShadow: "var(--shadow-md)",
};

export const SeriesChart = ({ data, satuan }: { data: SeriesPoint[]; satuan: string }) => (
  <ResponsiveContainer width="100%" height={320}>
    <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
      <XAxis dataKey="tahun" stroke="hsl(var(--muted-foreground))" fontSize={12} />
      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toLocaleString("id-ID")} ${satuan}`} />
      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
      <Line type="monotone" dataKey="brebes" name="Kab. Brebes" stroke="hsl(var(--brebes))" strokeWidth={3} dot={{ r: 5, fill: "hsl(var(--brebes))" }} activeDot={{ r: 7 }} />
      <Line type="monotone" dataKey="jateng" name="Jawa Tengah" stroke="hsl(var(--jateng))" strokeWidth={2} dot={{ r: 4 }} />
      <Line type="monotone" dataKey="nasional" name="Nasional" stroke="hsl(var(--nasional))" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4 }} />
    </LineChart>
  </ResponsiveContainer>
);

export const RankingChart = ({
  data,
  higherIsBetter,
  satuan,
}: {
  data: RankPoint[];
  higherIsBetter: boolean;
  satuan: string;
}) => {
  const sorted = [...data].sort((a, b) => (higherIsBetter ? b.nilai - a.nilai : a.nilai - b.nilai));
  return (
    <ResponsiveContainer width="100%" height={Math.max(540, sorted.length * 18)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <YAxis type="category" dataKey="wilayah" stroke="hsl(var(--muted-foreground))" fontSize={10} width={110} interval={0} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toLocaleString("id-ID")} ${satuan}`} />
        <Bar dataKey="nilai" radius={[0, 4, 4, 0]}>
          {sorted.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.wilayah === "Brebes"
                  ? "hsl(var(--brebes))"
                  : entry.wilayah.startsWith("Kota")
                  ? "hsl(var(--muted-foreground) / 0.5)"
                  : "hsl(var(--primary-glow) / 0.55)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
