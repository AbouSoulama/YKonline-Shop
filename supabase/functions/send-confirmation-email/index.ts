import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, redirectTo } = await req.json();
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Generate a fresh confirmation link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: redirectTo || "https://ykonline.shop/auth/callback" },
    });

    if (error || !data?.properties?.action_link) {
      return new Response(JSON.stringify({ error: error?.message || "Could not generate link" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const confirmUrl = data.properties.action_link;
    const firstName = name?.split(" ")[0] || "there";

    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "YKonline Shop <contact@ykonline.shop>",
          to: [email],
          subject: "Confirm your YKonline Shop account",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
              <h1 style="color:#0B6623">Welcome to YKonline Shop!</h1>
              <p>Hi ${firstName},</p>
              <p>Thank you for creating your account. Please confirm your email address to activate your account.</p>
              <a href="${confirmUrl}" style="display:inline-block;background:#FF7900;color:white;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:bold;margin:24px 0">
                Confirm my email
              </a>
              <p style="color:#666;font-size:13px">If you did not create this account, you can ignore this email.</p>
              <p style="color:#999;font-size:12px;margin-top:32px">YKonline Shop · contact@ykonline.shop</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ error: err }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: true, sent: Boolean(resendKey) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
