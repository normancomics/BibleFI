// Emails a tithe receipt to a donor or church treasurer.
// "Honor the Lord with your firstfruits" (Proverbs 3:9).
//
// Requires the RESEND_API_KEY secret. Without it the function returns 503 so the
// UI can fall back to the printable receipt instead of failing silently.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  payment_id: z.string().uuid(),
  to_email: z.string().email(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const money = (amount: number, currency: string) =>
  `${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Caller-scoped client: RLS decides whether this user may read the payment.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    db: { schema: "api" },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

  let parsed;
  try {
    parsed = BodySchema.safeParse(await req.json());
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);

  const { payment_id, to_email } = parsed.data;

  const { data: payment, error: payErr } = await userClient
    .from("church_tithe_payments")
    .select("*")
    .eq("id", payment_id)
    .maybeSingle();

  if (payErr) return json({ error: payErr.message }, 400);
  if (!payment) return json({ error: "Payment not found or not accessible" }, 404);

  const { data: church } = await userClient
    .from("church_onboarding")
    .select("church_name, city, country, contact_email")
    .eq("id", payment.onboarding_id)
    .maybeSingle();

  const churchName = church?.church_name ?? "Your church";
  const amount = money(payment.amount, payment.currency);
  const paidAt = new Date(payment.paid_at).toUTCString();

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1f2937">
      <h1 style="color:#8B5CF6;font-size:22px;margin-bottom:4px">Tithe Receipt</h1>
      <p style="color:#6b7280;margin-top:0">${churchName}${church?.city ? ` &middot; ${church.city}, ${church.country}` : ""}</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr><td style="padding:8px 0">Amount</td><td style="padding:8px 0;text-align:right"><strong>${amount}</strong></td></tr>
        <tr><td style="padding:8px 0">Method</td><td style="padding:8px 0;text-align:right">${payment.payment_method}</td></tr>
        <tr><td style="padding:8px 0">Date</td><td style="padding:8px 0;text-align:right">${paidAt}</td></tr>
        <tr><td style="padding:8px 0">Status</td><td style="padding:8px 0;text-align:right">${payment.status}</td></tr>
        <tr><td style="padding:8px 0">Donor</td><td style="padding:8px 0;text-align:right">${payment.anonymous ? "Anonymous" : payment.donor_display_name ?? "—"}</td></tr>
        ${payment.tx_hash ? `<tr><td style="padding:8px 0">On-chain tx</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:12px">${payment.tx_hash}</td></tr>` : ""}
        <tr><td style="padding:8px 0">Receipt ID</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:12px">${payment.id}</td></tr>
      </table>
      <p style="font-style:italic;color:#374151">
        &ldquo;Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith,
        saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing,
        that there shall not be room enough to receive it.&rdquo; &mdash; Malachi 3:10 (KJV)
      </p>
      <p style="color:#6b7280;font-size:12px">
        Keep this receipt for your records. BibleFi does not provide tax advice; consult your advisor about deductibility.
      </p>
      <p style="color:#6b7280;font-size:12px">Trust in the LORD with all your heart &mdash; Proverbs 3:5-6</p>
    </div>`;

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    return json(
      {
        error: "email_not_configured",
        message:
          "Email delivery is not configured yet. Add the RESEND_API_KEY secret and verify a sending domain to enable receipts.",
        receipt_html: html,
      },
      503,
    );
  }

  const from = Deno.env.get("TITHE_RECEIPT_FROM") ?? "BibleFi Receipts <receipts@biblefi.org>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to_email],
      subject: `Tithe receipt — ${amount} to ${churchName}`,
      html,
    }),
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Resend error", res.status, result);
    return json({ error: "send_failed", details: result }, 502);
  }

  return json({ sent: true, to: to_email, provider_id: result?.id ?? null });
});
