import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from "recharts";
import type { SeriesPoint, RankPoint } from "@/data/statistik";
import { formatSmart, withUnit } from "@/lib/format";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  boxShadow: "var(--shadow-md)",
};

export const SeriesChart = ({ data, satuan, digits = 2 }: { data: SeriesPoint[]; satuan: string; digits?: number }) => {
  const hasJateng = data.some((d) => d.jateng !== undefined && d.jateng !== null);
  const hasNasional = data.some((d) => d.nasional !== undefined && d.nasional !== null);
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="tahun" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={(v: number) => formatSmart(v, Math.max(digits, 1))}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => withUnit(formatSmart(v, digits), satuan)}
          labelFormatter={(label) => `Tahun ${label}`}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Line type="monotone" dataKey="brebes" name="Kab. Brebes" stroke="hsl(var(--brebes))" strokeWidth={3} dot={{ r: 5, fill: "hsl(var(--brebes))" }} activeDot={{ r: 7 }} />
        {hasJateng && (
          <Line type="monotone" dataKey="jateng" name="Jawa Tengah" stroke="hsl(var(--jateng))" strokeWidth={2} dot={{ r: 4 }} connectNulls />
        )}
        {hasNasional && (
          <Line type="monotone" dataKey="nasional" name="Nasional" stroke="hsl(var(--nasional))" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4 }} connectNulls />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Rapikan label nama wilayah:
// - "Kota X"  -> tetap "Kota X"
// - selain "Brebes" / agregat -> diberi prefix "Kab. "
const formatWilayah = (nama: string): string => {
  if (nama === "Jawa Tengah" || nama === "Indonesia") return nama;
  if (nama.startsWith("Kota ")) return nama;
  return `Kab. ${nama}`;
};

type RankingEntry = RankPoint & { _kind: "brebes" | "jateng" | "nasional" | "kab" | "kota" };

export const RankingChart = ({
  data,
  higherIsBetter,
  satuan,
  jateng,
  nasional,
}: {
  data: RankPoint[];
  higherIsBetter: boolean;
  satuan: string;
  jateng?: number;
  nasional?: number;
}) => {
  const enriched: RankingEntry[] = [
    ...data.map((d) => ({
      ...d,
      _kind: d.wilayah === "Brebes" ? ("brebes" as const) : d.wilayah.startsWith("Kota") ? ("kota" as const) : ("kab" as const),
    })),
    ...(jateng !== undefined ? [{ wilayah: "Jawa Tengah", nilai: jateng, _kind: "jateng" as const }] : []),
    ...(nasional !== undefined ? [{ wilayah: "Indonesia", nilai: nasional, _kind: "nasional" as const }] : []),
  ];
  const sorted = [...enriched].sort((a, b) => (higherIsBetter ? b.nilai - a.nilai : a.nilai - b.nilai));

  const colorFor = (kind: RankingEntry["_kind"]): string => {
    switch (kind) {
      case "brebes":   return "hsl(var(--brebes))";
      case "jateng":   return "hsl(var(--jateng))";
      case "nasional": return "hsl(var(--nasional))";
      default:         return "hsl(var(--muted-foreground) / 0.35)";
    }
  };

  // Sediakan field label yang sudah dirapikan untuk Y-axis & tooltip.
  const chartData = sorted.map((d) => ({ ...d, label: formatWilayah(d.wilayah) }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(560, chartData.length * 20)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v: number) => formatSmart(v, 1)} />
        <YAxis
          type="category"
          dataKey="label"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          width={140}
          interval={0}
          tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
            const entry = chartData.find((d) => d.label === payload.value);
            const highlight = entry && entry._kind !== "kab" && entry._kind !== "kota";
            return (
              <text
                x={x}
                y={y}
                dy={4}
                textAnchor="end"
                fontSize={11}
                fontWeight={highlight ? 700 : 400}
                fill={
                  entry?._kind === "brebes" ? "hsl(var(--brebes))"
                  : entry?._kind === "jateng" ? "hsl(var(--jateng))"
                  : entry?._kind === "nasional" ? "hsl(var(--nasional))"
                  : "hsl(var(--muted-foreground))"
                }
              >
                {payload.value}
              </text>
            );
          }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => withUnit(formatSmart(v, digits), satuan)}
          labelFormatter={(label) => String(label)}
        />
        <Bar dataKey="nilai" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={colorFor(entry._kind)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
