import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteBody {
  email?: string;
  password?: string;
  make_admin?: boolean;
}

function genPassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  let out = "";
  const arr = new Uint32Array(16);
  crypto.getRandomValues(arr);
  for (let i = 0; i < arr.length; i++) out += chars[arr[i] % chars.length];
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin via their JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "missing_token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: isAdmin, error: roleErr } = await userClient.rpc(
      "is_current_user_admin",
    );
    if (roleErr || isAdmin !== true) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as InviteBody;
    const email = (body.email ?? "").trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "invalid_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const password = body.password && body.password.length >= 8
      ? body.password
      : genPassword();
    const makeAdmin = body.make_admin !== false; // default true

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Try to create user (already-confirmed) — idempotent: if exists, fetch.
    let userId: string | null = null;
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (created.error) {
      // Likely exists — list and find
      const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const existing = list.data.users.find(
        (u) => (u.email ?? "").toLowerCase() === email,
      );
      if (!existing) {
        return new Response(
          JSON.stringify({ error: created.error.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      userId = existing.id;
    } else {
      userId = created.data.user?.id ?? null;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "no_user_id" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (makeAdmin) {
      await admin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, {
          onConflict: "user_id,role",
        });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        user_id: userId,
        email,
        password_set: !body.password ? password : undefined,
        created: !created.error,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});