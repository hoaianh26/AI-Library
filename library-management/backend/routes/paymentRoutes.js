// backend/routes/paymentRoutes.js
import express from "express";
import Stripe from "stripe";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// map tier -> Stripe price id
const PRICE_MAP = {
  silver: process.env.PRICE_SILVER,
  gold: process.env.PRICE_GOLD,
};

// POST /api/payments/create-checkout-session
router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    console.log("Using Stripe Key:", process.env.STRIPE_SECRET_KEY);
    const { tier, durationMonths } = req.body;

    if (Number(durationMonths) !== 1) {
      return res.status(400).json({ message: 'Invalid duration' });
    }

    if (!PRICE_MAP[tier]) {
      return res.status(400).json({ message: "Invalid tier" });
    }

    const qty = Number(durationMonths) || 1;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: PRICE_MAP[tier],
          quantity: qty,
        },
      ],

      success_url: `${process.env.FRONTEND_URL}/membership?success=1`,
      cancel_url: `${process.env.FRONTEND_URL}/membership?cancel=1`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return res.status(500).json({ message: "Stripe session error" });
  }
});

export default router;
