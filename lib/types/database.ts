/**
 * Hand-typed Supabase row types matching 20260525000002_schema.sql.
 * Replace with `npx supabase gen types typescript` output once the schema
 * is applied to the remote project.
 */

export type Role = "customer" | "cook" | "admin";

export type DeliveryMode = "blpga_onsite" | "self_pickup" | "home_delivery";

export type FoodPreference = "veg" | "nonveg";

export type LedgerBucket = "meal" | "sd";

export type LedgerType =
  | "credit"
  | "meal_charge"
  | "delivery_charge"
  | "refund"
  | "adjustment"
  | "sd_deposit"
  | "damage_deduction"
  | "sd_refund";

export type MealExceptionKind =
  | "customer_cancel"
  | "admin_user_off"
  | "cook_leave_global";

export type PendingStatus = "pending" | "quoted" | "activated" | "rejected";

export type EmailTemplateKey =
  | "magic_link"
  | "form_copy"
  | "admin_new_subscriber"
  | "quote"
  | "tomorrow_customer"
  | "tomorrow_admin"
  | "low_balance"
  | "cook_sheet_admin"
  | "exit_statement"
  | "damage_notice";

export interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  role: Role;
  is_active: boolean;
  is_student: boolean | null;
  college: string | null;
  year_of_study: string | null;
  profession: string | null;
  workplace: string | null;
  delivery_mode: DeliveryMode | null;
  delivery_fee_per_day: number;
  google_maps_url: string | null;
  delivery_address: string | null;
  landmark: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  food_preference: FoodPreference | null;
  allergies: string | null;
  start_date: string | null;
  created_at: string;
}

export interface LedgerRow {
  id: string;
  user_id: string;
  entry_date: string;
  bucket: LedgerBucket;
  type: LedgerType;
  amount: number;
  balance_after: number;
  damage_item: string | null;
  damage_qty: number | null;
  photo_url: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MealException {
  id: string;
  user_id: string | null;
  service_date: string;
  kind: MealExceptionKind;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PendingSubscriber {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  is_student: boolean;
  college: string | null;
  year_of_study: string | null;
  profession: string | null;
  workplace: string | null;
  delivery_mode: DeliveryMode;
  google_maps_url: string | null;
  delivery_address: string | null;
  landmark: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  food_preference: FoodPreference | null;
  allergies: string | null;
  start_date: string | null;
  delivery_fee_per_day: number | null;
  status: PendingStatus;
  quote_total: number | null;
  quote_sent_at: string | null;
  activated_user_id: string | null;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  key: EmailTemplateKey;
  subject: string;
  body_text: string;
  merge_tags: string[];
  updated_by: string | null;
  updated_at: string;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface CookSheet {
  id: string;
  service_date: string;
  pdf_storage_path: string | null;
  headcount: number;
  generated_at: string;
}
