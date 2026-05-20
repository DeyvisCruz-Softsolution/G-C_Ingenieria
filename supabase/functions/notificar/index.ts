import { Resend } from "resend";
import { createClient } from "supabase";

// ✅ Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // 🔥 Manejo de preflight (MUY IMPORTANTE)
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método no permitido" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userName }: { userName: string } = await req.json();

    if (!userName) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Obtener socios
    const { data: socios, error } = await supabase
      .from("usuarios")
      .select("email")
      .eq("role", "socio");

    if (error) throw error;

    // Enviar correos (sin bloquear)
    for (const socio of socios || []) {
      resend.emails.send({
        from: "Notificaciones <onboarding@resend.dev>",
        to: socio.email,
        subject: "Ingreso de socio autorizado",
        html: `<p>El socio <strong>${userName}</strong> ha ingresado al panel de contabilidad.</p>`,
      }).catch(e => console.error("Error email:", e));
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        error: "Error interno",
        detalle: error instanceof Error ? error.message : "Desconocido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});