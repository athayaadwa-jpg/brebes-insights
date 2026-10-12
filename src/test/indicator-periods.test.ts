import { describe, expect, it } from "vitest";
import { isEconomicHeader, parseIndicatorPeriod } from "../../supabase/functions/_shared/indicator-periods";

describe("updated spreadsheet periods", () => {
  it("recognizes the updated quarterly economic header and its previous name", () => {
    expect(isEconomicHeader("Laju Pertumbuhan (y-on-y) PDRB Triwulanan")).toBe(true);
    expect(isEconomicHeader("Laju Pertumbuhan (y-on-y) PDRB Triwulan IV")).toBe(true);
    expect(isEconomicHeader("Laju Pertumbuhan PDRB (q to q)")).toBe(false);
  });
  it("keeps the five source quarters distinct and chronologically ordered", () => {
    const periods = ["2025 TW II", "2025 TW III", "2025 TW IV", "2026 TW I", "2026 TW II"].map(parseIndicatorPeriod);
    expect(periods.map((p) => p?.key)).toEqual([2025.2, 2025.3, 2025.4, 2026.1, 2026.2]);
    expect(periods.at(-1)?.label).toBe("2026 · Triwulan II");
  });
  it("preserves annual keys and rejects empty or invalid periods", () => {
    expect(parseIndicatorPeriod("2025")).toEqual({ key: 2025, label: "2025" });
    expect(parseIndicatorPeriod("")).toBeNull();
    expect(parseIndicatorPeriod("2026 TW V")).toBeNull();
  });
});