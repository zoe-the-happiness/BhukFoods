import type { PendingSubscriber } from "@/lib/types/database";

const DELIVERY_LABELS = {
  blpga_onsite: "Living at BLPGA (no delivery, no security deposit)",
  self_pickup: "Self-pickup from the Agarpara kitchen",
  home_delivery: "Home delivery",
} as const;

export function deliveryLabel(mode: string | null | undefined): string {
  if (!mode) return "—";
  return (DELIVERY_LABELS as Record<string, string>)[mode] ?? mode;
}

/**
 * 2026-05-25: profession/workplace are no longer collected; the block is now
 * just the optional college + year for self-identified students. If the
 * person didn't tag themselves at all this returns an empty string and the
 * email template's section collapses cleanly.
 */
export function studentBlock(
  p: Pick<PendingSubscriber, "is_student" | "college" | "year_of_study">,
): string {
  if (p.is_student === true) {
    const college = p.college ? `College: ${p.college}` : "";
    const year = p.year_of_study ? `Year: ${p.year_of_study}` : "";
    return [college, year].filter(Boolean).join("\n");
  }
  return "";
}

/**
 * 2026-05-25: parent/guardian fields removed.
 */
export function deliveryBlock(
  p: Pick<PendingSubscriber, "delivery_mode" | "delivery_address" | "landmark" | "google_maps_url">,
): string {
  const lines: string[] = [];
  if (p.delivery_mode === "home_delivery") {
    if (p.delivery_address) lines.push(`Address: ${p.delivery_address}`);
    if (p.landmark) lines.push(`Landmark: ${p.landmark}`);
    if (p.google_maps_url) lines.push(`Google Maps: ${p.google_maps_url}`);
  } else if (p.delivery_mode === "self_pickup") {
    lines.push("Pickup at 43, Matangini Hazra Pally, Agarpara — Mon–Sat");
    if (p.delivery_address) lines.push(`Lives at: ${p.delivery_address}`);
    if (p.landmark) lines.push(`Landmark: ${p.landmark}`);
  } else if (p.delivery_mode === "blpga_onsite") {
    lines.push("Resident at BLPGA — meals served on-site, no delivery charge");
  }
  return lines.join("\n");
}
