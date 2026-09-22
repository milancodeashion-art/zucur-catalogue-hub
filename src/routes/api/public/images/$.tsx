import { createFileRoute } from "@tanstack/react-router";

const BUCKET = "catalogue";

export const Route = createFileRoute("/api/public/images/$")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as Record<string, string>)["_splat"] ?? "";
        const path = raw.replace(/^\/+/, "");
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path);
        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
