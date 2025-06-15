
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Paystack will retry for non-2xx statuses, so always return 200 after processing
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const eventType = payload?.event;
    const data = payload?.data;
    const userReference = data?.metadata?.user_id; // You'll need to include this metadata when creating the Paystack payment
    const transactionRef = data?.reference;

    if (!userReference) {
      console.error("Missing user_id reference in Paystack event payload.");
      return new Response(
        JSON.stringify({ error: "Missing user reference in webhook payload." }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Get service key for admin rights
    const service_role = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const url = Deno.env.get("SUPABASE_URL");

    // Insert paystack event
    const eventInsertRes = await fetch(`${url}/rest/v1/paystack_events`, {
      method: "POST",
      headers: {
        "apikey": service_role,
        "Authorization": `Bearer ${service_role}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        event_type: eventType,
        user_id: userReference,
        reference: transactionRef,
        raw_payload: payload,
      }),
    });

    if (!eventInsertRes.ok) {
      console.error("Failed to insert paystack event:", await eventInsertRes.text());
    }

    // For successful payment events mark user as premium
    if (eventType === "charge.success" && data.status === "success") {
      // Set profile is_premium = true
      const updateRes = await fetch(`${url}/rest/v1/profiles?id=eq.${userReference}`, {
        method: "PATCH",
        headers: {
          "apikey": service_role,
          "Authorization": `Bearer ${service_role}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_premium: true, updated_at: new Date().toISOString() }),
      });

      if (!updateRes.ok) {
        console.error("Failed to set is_premium for user:", await updateRes.text());
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook error." }),
      { status: 200, headers: corsHeaders }
    );
  }
});
