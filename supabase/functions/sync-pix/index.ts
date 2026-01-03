import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const syncBaseUrl = "https://api.syncpayments.com.br";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const syncClientId = Deno.env.get("SYNC_CLIENT_ID");
const syncClientSecret = Deno.env.get("SYNC_CLIENT_SECRET");

if (!syncClientId || !syncClientSecret) {
  console.error("SYNC_CLIENT_ID or SYNC_CLIENT_SECRET not configured");
}

async function getAccessToken() {
  if (!syncClientId || !syncClientSecret) {
    throw new Error("SyncPayments credentials not configured");
  }

  const response = await fetch(`${syncBaseUrl}/api/partner/v1/auth-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: syncClientId,
      client_secret: syncClientSecret,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Error fetching SyncPayments auth token", response.status, text);
    throw new Error("Falha na autenticação com a SyncPayments");
  }

  const data = await response.json();
  return data.access_token as string;
}

async function validateCompany(accessToken: string) {
  const response = await fetch(`${syncBaseUrl}/s1/getCompany`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Error validating SyncPayments company", response.status, text);
    throw new Error("Falha ao validar conta na SyncPayments");
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Valores padrão para o botão "Assinar (30 dias)"
    const amount = typeof body.amount === "number" ? body.amount : 2990;
    const description =
      typeof body.description === "string" && body.description.trim().length > 0
        ? body.description
        : "Assinatura 30 dias - Bolzani";

    const client = body.client ?? {
      name: "Cliente",
      cpf: "12345678900",
      email: "cliente@example.com",
      phone: "11999999999", // 11 dígitos, sem DDI, para passar na validação da Sync
    };

    const webhookUrl = body.webhook_url ?? `${supabaseUrl}/functions/v1/sync-webhook`;

    // Normaliza e valida telefone (API exige 10-11 dígitos numéricos)
    const phoneRaw = String(client.phone ?? "");
    const phoneDigits = phoneRaw.replace(/\D/g, "");

    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      console.error("Telefone inválido para SyncPayments", phoneRaw);
      return new Response(
        JSON.stringify({
          error: "Telefone inválido. Use DDD + número, apenas dígitos (10 ou 11 dígitos).",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    client.phone = phoneDigits as string;

    const accessToken = await getAccessToken();
    await validateCompany(accessToken);

    const cashInResponse = await fetch(`${syncBaseUrl}/api/partner/v1/cash-in`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount,
        description,
        webhook_url: webhookUrl,
        client,
      }),
    });

    if (!cashInResponse.ok) {
      const text = await cashInResponse.text();
      console.error("Error creating SyncPayments cash-in", cashInResponse.status, text);
      return new Response(JSON.stringify({ error: "Falha ao criar pagamento PIX" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cashInData = await cashInResponse.json();

    const { data, error } = await supabase.from("payments").insert({
      identifier: cashInData.identifier,
      type: body.type ?? "assinatura",
      amount,
      status: "pending",
      client_name: client.name,
      client_cpf: client.cpf,
      client_email: client.email,
      method: "PIX",
    });

    if (error) {
      console.error("Error inserting payment in database", error);
    } else {
      console.log("Payment inserted", data);
    }

    return new Response(
      JSON.stringify({
        message: cashInData.message,
        pix_code: cashInData.pix_code,
        identifier: cashInData.identifier,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in sync-pix function", error);
    return new Response(JSON.stringify({ error: "Erro interno ao gerar pagamento PIX" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
