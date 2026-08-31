import { supabaseApi } from "@/integrations/supabase/apiClient";

export interface ChurchOnboardingRecord {
  id: string;
  user_id: string;
  church_name: string;
  denomination: string | null;
  address: string | null;
  city: string;
  state_province: string | null;
  country: string;
  postal_code: string | null;
  website: string | null;
  pastor_name: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  wallet_address: string | null;
  preferred_currencies: string[];
  status: string;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NfcCardOrder {
  id: string;
  onboarding_id: string;
  quantity: number;
  logo_url: string | null;
  design_notes: string | null;
  shipping_address: string | null;
  status: string;
  tracking_number: string | null;
  activated_at: string | null;
  created_at: string;
}

export interface TithePayment {
  id: string;
  onboarding_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  tx_hash: string | null;
  donor_display_name: string | null;
  anonymous: boolean;
  status: string;
  paid_at: string;
}

export type ChurchOnboardingInput = Omit<
  ChurchOnboardingRecord,
  "id" | "user_id" | "status" | "review_notes" | "created_at" | "updated_at"
>;

/** The church application belonging to the signed-in user, if any. */
export async function fetchMyChurch(userId: string): Promise<ChurchOnboardingRecord | null> {
  const { data, error } = await supabaseApi
    .from("church_onboarding")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ChurchOnboardingRecord | null) ?? null;
}

/** Register a church — "Honor the Lord with your firstfruits" (Proverbs 3:9). */
export async function submitChurchOnboarding(
  userId: string,
  input: ChurchOnboardingInput,
): Promise<ChurchOnboardingRecord> {
  const { data, error } = await supabaseApi
    .from("church_onboarding")
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ChurchOnboardingRecord;
}

export async function fetchCardOrders(onboardingId: string): Promise<NfcCardOrder[]> {
  const { data, error } = await supabaseApi
    .from("church_nfc_cards")
    .select("*")
    .eq("onboarding_id", onboardingId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as NfcCardOrder[];
}

export async function requestNfcCards(input: {
  onboarding_id: string;
  quantity: number;
  logo_url?: string | null;
  design_notes?: string | null;
  shipping_address?: string | null;
}): Promise<NfcCardOrder> {
  const { data, error } = await supabaseApi
    .from("church_nfc_cards")
    .insert({
      onboarding_id: input.onboarding_id,
      quantity: input.quantity,
      logo_url: input.logo_url || null,
      design_notes: input.design_notes || null,
      shipping_address: input.shipping_address || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as NfcCardOrder;
}

export async function fetchTithePayments(onboardingId: string): Promise<TithePayment[]> {
  const { data, error } = await supabaseApi
    .from("church_tithe_payments")
    .select("*")
    .eq("onboarding_id", onboardingId)
    .order("paid_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []) as TithePayment[];
}
