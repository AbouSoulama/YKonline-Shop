import path from "path";
import { fileURLToPath } from "url";
import type { IncomingMessage, ServerResponse } from "http";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function stripePaymentApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: "stripe-payment-api",
    configureServer(server) {
      server.middlewares.use("/api/create-payment-intent", async (req, res, next) => {
        if (req.method !== "POST") return next();

        const secretKey = env.STRIPE_SECRET_KEY;
        const supabaseUrl = env.VITE_SUPABASE_URL;
        const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

        if (!secretKey?.startsWith("sk_")) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Add STRIPE_SECRET_KEY to your .env file for local payments." }));
          return;
        }

        try {
          const body = JSON.parse(await readBody(req));
          const orderId = body.orderId as string;
          if (!orderId) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "orderId is required." }));
            return;
          }

          let order: { total: number; order_number: string } | null = null;

          if (supabaseUrl && serviceKey) {
            const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=total,order_number`, {
              headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
              },
            });
            const rows = await orderRes.json();
            order = rows?.[0] ?? null;
          }

          if (!order) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Order not found." }));
            return;
          }

          const amount = Math.round(Number(order.total) * 100);
          const params = new URLSearchParams({
            amount: String(amount),
            currency: "usd",
            "automatic_payment_methods[enabled]": "true",
            "metadata[order_id]": orderId,
            "metadata[order_number]": order.order_number,
          });

          const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secretKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
          });

          const intent = await stripeRes.json();
          if (!stripeRes.ok) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: intent.error?.message || "Stripe error." }));
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ clientSecret: intent.client_secret }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Server error." }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), stripePaymentApiPlugin(env), viteSingleFile()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
