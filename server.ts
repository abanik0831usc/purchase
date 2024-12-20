import { Application, Router } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import Stripe from "npm:stripe";

// Initialize Stripe
const stripe = new Stripe("sk_test_MxSnz9ROWbONvVnVmTpPDcNf", {
  apiVersion: "2018-02-28; custom_checkout_beta=v1" as any,
});

// Create an Oak application and router
const app = new Application();
const router = new Router();

// Define the route to create a checkout session
router.post("/api/create-checkout-session", async (context) => {
  try {
    const body = context.request.body({ type: "json" });
    const { items } = await body.value;

    if (!items || !Array.isArray(items)) {
      context.response.status = 400;
      context.response.body = { error: "Invalid items array." };
      return;
    }

    const lineItems = items.map(
      (item: { name: string; unitAmount: number; quantity: number }) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name, // Replace with actual product name
          },
          unit_amount: item.unitAmount, // Amount in cents
        },
        quantity: item.quantity,
      })
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Specify allowed payment methods
      line_items: lineItems,
      mode: "payment", // Use 'subscription' for recurring payments
      ui_mode: "custom", // Specify custom UI mode
      success_url: "https://your-site.com/success", // Replace with your success URL
      cancel_url: "https://your-site.com/cancel", // Replace with your cancel URL
    });

    context.response.status = 200;
    context.response.body = { clientSecret: session };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    context.response.status = 500;
    context.response.body = { error: "Failed to create checkout session." };
  }
});

// Add the router to the application
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
const PORT = 8000;
console.log(`Server running on http://localhost:${PORT}`);
await app.listen({ port: PORT });
