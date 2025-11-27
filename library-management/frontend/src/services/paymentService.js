// frontend/src/services/paymentService.js
const API_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

export const createCheckoutSession = async (tier, durationMonths, token) => {
  const res = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tier, durationMonths }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create checkout session");
  }

  return res.json(); // { url }
};
