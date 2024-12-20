const express = require("express");
const Stripe = require("stripe");

// Initialize Stripe
const stripe = new Stripe("API_KEY", {
  apiVersion: "2024-04-10; custom_checkout_beta=v1",
});

// Create an Express application
const app = express();
app.use(express.json());

// Define the route to create a checkout session
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid items array." });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name, // Replace with actual product name
        },
        unit_amount: item.unitAmount, // Amount in cents
      },
      quantity: item.quantity,
    }));

    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ["card"], // Specify allowed payment methods
    //   line_items: lineItems,
    //   mode: "payment", // Use 'subscription' for recurring payments
    //   ui_mode: "custom", // Specify custom UI mode
    //   success_url: "https://your-site.com/success", // Replace with your success URL
    //   cancel_url: "https://your-site.com/cancel", // Replace with your cancel URL
    // });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "T-shirt",
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      ui_mode: "custom",
      // The URL of your payment completion page
      return_url: "https://your-site.com/cancel",
    });

    res.status(200).json({ clientSecret: session });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
});

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
