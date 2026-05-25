import type { Profile, PendingSubscriber } from "@/lib/types/database";

const DELIVERY_LABELS = {
  blpga_onsite: "Living at BLPGA (no delivery, no security deposit)",
  self_pickup: "Self-pickup from the Agarpara kitchen",
  home_delivery: "Home delivery",
} as const;

export function deliveryLabel(mode: string | null | undefined): string {
  if (!mode) return "—";
  return (DELIVERY_LABELS as Record<string, string>)[mode] ?? mode;
}

export function studentBlock(p: Pick<PendingSubscriber, "is_student" | "college" | "year_of_study" | "profession" | "workplace">): string {
  if (p.is_student) {
    const college = p.college ? `College: ${p.college}` : "";
    const year = p.year_of_study ? `Year: ${p.year_of_study}` : "";
    return [college, year].filter(Boolean).join("\n");
  }
  const profession = p.profession ? `Profession: ${p.profession}` : "";
  const workplace = p.workplace ? `Workplace: ${p.workplace}` : "";
  return [profession, workplace].filter(Boolean).join("\n");
}

export function deliveryBlock(p: Pick<PendingSubscriber, "delivery_mode" | "delivery_address" | "landmark" | "google_maps_url" | "parent_name" | "parent_phone">): string {
  const lines: string[] = [];
  if (p.delivery_mode === "home_delivery") {
    if (p.delivery_address) lines.push(`Address: ${p.delivery_address}`);
    if (p.landmark) lines.push(`Landmark: ${p.landmark}`);
    if (p.google_maps_url) lines.push(`Google Maps: ${p.google_maps_url}`);
  } else if (p.delivery_mode === "self_pickup") {
    lines.push("Pickup at 43, Matangini Hazra Pally, Agarpara — Mon–Sat");
  } else if (p.delivery_mode === "blpga_onsite") {
    lines.push("Resident at BLPGA — meals served on-site, no delivery charge");
  }
  if (p.parent_name || p.parent_phone) {
    lines.push(
      `Parent / guardian: ${p.parent_name ?? "—"}${p.parent_phone ? ` (${p.parent_phone})` : ""}`,
    );
  }
  return lines.join("\n");
}
