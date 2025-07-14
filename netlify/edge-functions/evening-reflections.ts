// @ts-ignore
import type { Context } from "https://edge.netlify.com/";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface EveningReflection {
  id?: string;
  user_id?: string;
  date: string;
  tomorrow_plans: string;
  preparation: string;
  random_thoughts: string;
  dont_forget: string;
  created_at?: string;
  completed_at?: string;
}

export default async function handler(req: Request, context: Context) {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase not configured, using fallback mode");

      // Fallback for when Supabase is not configured
      if (req.method === "GET") {
        return new Response(
          JSON.stringify({
            data: [],
            message: "Supabase not configured - using local storage fallback",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      if (req.method === "POST") {
        const body = await req.json();
        return new Response(
          JSON.stringify({
            data: { ...body, id: `local-${Date.now()}` },
            message: "Saved locally - configure Supabase for persistence",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 201,
          },
        );
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const authHeader = req.headers.get("Authorization");

    // Extract user from JWT token (will be implemented with auth)
    let userId = "anonymous"; // Default for now

    if (authHeader) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        userId = user?.id || "anonymous";
      } catch (error) {
        console.error("Auth error:", error);
      }
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");

    switch (req.method) {
      case "GET": {
        // Get evening reflections for user
        const limit = parseInt(url.searchParams.get("limit") || "30");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        const { data, error } = await supabase
          .from("evening_reflections")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "POST": {
        // Create new evening reflection
        const body: EveningReflection = await req.json();

        const reflection = {
          user_id: userId,
          date: body.date,
          tomorrow_plans: body.tomorrow_plans,
          preparation: body.preparation,
          random_thoughts: body.random_thoughts,
          dont_forget: body.dont_forget,
          created_at: new Date().toISOString(),
          completed_at: body.completed_at ? new Date().toISOString() : null,
        };

        // Check if reflection for this date already exists
        const { data: existing } = await supabase
          .from("evening_reflections")
          .select("id")
          .eq("user_id", userId)
          .eq("date", body.date)
          .single();

        let result;
        if (existing) {
          // Update existing
          const { data, error } = await supabase
            .from("evening_reflections")
            .update(reflection)
            .eq("id", existing.id)
            .select()
            .single();

          if (error) throw error;
          result = data;
        } else {
          // Create new
          const { data, error } = await supabase
            .from("evening_reflections")
            .insert(reflection)
            .select()
            .single();

          if (error) throw error;
          result = data;
        }

        return new Response(JSON.stringify({ data: result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: existing ? 200 : 201,
        });
      }

      case "PUT": {
        // Update existing evening reflection
        const reflectionId = pathParts[pathParts.length - 1];
        const body: Partial<EveningReflection> = await req.json();

        const { data, error } = await supabase
          .from("evening_reflections")
          .update({
            tomorrow_plans: body.tomorrow_plans,
            preparation: body.preparation,
            random_thoughts: body.random_thoughts,
            dont_forget: body.dont_forget,
            completed_at: body.completed_at ? new Date().toISOString() : null,
          })
          .eq("id", reflectionId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "DELETE": {
        // Delete evening reflection
        const reflectionId = pathParts[pathParts.length - 1];

        const { error } = await supabase
          .from("evening_reflections")
          .delete()
          .eq("id", reflectionId)
          .eq("user_id", userId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ message: "Reflection deleted successfully" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 405,
        });
    }
  } catch (error) {
    console.error("Evening reflections API error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
}

export const config = {
  path: "/evening-reflections/*",
};
