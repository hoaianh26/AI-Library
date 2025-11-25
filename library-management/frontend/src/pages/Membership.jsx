import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { upgradeMembership } from "../services/bookService";
import { createCheckoutSession } from "../services/paymentService";

// Thông tin tier cho UI
const TIER_INFO = {
  bronze: {
    name: "Bronze",
    color: "from-amber-700 to-amber-900",
    icon: "🥉",
    tagline: "Free Access",
  },
  silver: {
    name: "Silver",
    color: "from-gray-400 to-gray-600",
    icon: "🥈",
    tagline: "Enhanced Experience",
    price: { 1: "$9.99" },
  },
  gold: {
    name: "Gold",
    color: "from-yellow-400 to-yellow-600",
    icon: "🥇",
    tagline: "Ultimate Access",
    price: { 1: "$19.99" },
  },
};

const BENEFITS = {
  bronze: [
    "Access to free books",
    "Basic features available",
    "Community book reviews",
    "Standard search functionality",
  ],
  silver: [
    "Unlock more premium books",
    "Priority book recommendations",
    "Expanded favorites list",
    "Advanced search filters",
    "Personalized reading suggestions",
    "Early access to new arrivals",
  ],
  gold: [
    "Full library access",
    "Highest priority for all features",
    "Unlimited favorites list",
    "Exclusive premium content",
    "Advanced AI recommendations",
    "Ad-free experience",
    "Download for offline reading",
    "Priority customer support",
  ],
};

const Membership = () => {
  const { user, token, login } = useAuth();
  const location = useLocation();

  const [selectedTier, setSelectedTier] = useState("silver");
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Nếu chưa login thì báo luôn
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">
          Bạn cần <span className="font-semibold">đăng nhập</span> để nâng cấp
          membership.
        </p>
      </div>
    );
  }

  const currentTier = user.membershipTier || "bronze";

  // Sau khi Stripe redirect về: ?success=1 hoặc ?cancel=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get("success");
    const cancel = params.get("cancel");

    const handleAfterPayment = async () => {
      const pending = localStorage.getItem("pendingMembership");
      if (!pending || !token) return;

      try {
        setLoading(true);
        const { tier, duration } = JSON.parse(pending);

        // Gọi API backend để cập nhật membership (PATCH /api/users/membership)
        const updated = await upgradeMembership(tier, duration, token);

        const newUser = {
          ...user,
          membershipTier: updated.membershipTier,
          membershipExpiresAt: updated.membershipExpiresAt,
          isMembershipActive: updated.isMembershipActive,
        };

        login(newUser, token);
        setMessage({
          type: "success",
          text: "Thanh toán thành công, membership đã được nâng cấp!",
        });
        localStorage.removeItem("pendingMembership");
      } catch (err) {
        console.error("update membership after payment error:", err);
        setMessage({
          type: "error",
          text:
            err.message ||
            "Thanh toán xong nhưng nâng cấp membership thất bại. Vui lòng liên hệ hỗ trợ.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (success === "1") {
      handleAfterPayment();
    } else if (cancel === "1") {
      setMessage({
        type: "error",
        text: "Bạn đã huỷ thanh toán.",
      });
      localStorage.removeItem("pendingMembership");
    }
  }, [location.search, token, user, login]);

  const handleSubmit = async () => {
    if (!token) {
      setMessage({
        type: "error",
        text: "Token không hợp lệ, vui lòng đăng nhập lại.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Lưu lựa chọn để dùng sau khi Stripe redirect về
      localStorage.setItem(
        "pendingMembership",
        JSON.stringify({ tier: selectedTier, duration })
      );

      // Tạo checkout session trên backend
      const { url } = await createCheckoutSession(
        selectedTier,
        duration,
        token
      );

      // Redirect sang Stripe
      window.location.href = url;
    } catch (err) {
      console.error("create checkout session error:", err);
      setMessage({
        type: "error",
        text:
          err.message ||
          "Có lỗi xảy ra khi tạo phiên thanh toán. Vui lòng thử lại.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Upgrade Your Membership
          </h1>
          <p className="text-gray-600 text-lg">
            Unlock unlimited reading experiences with premium membership plans
          </p>
        </div>

        {/* Current Status Card */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${TIER_INFO[currentTier].color} p-6 text-white shadow-xl`}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {TIER_INFO[currentTier].icon}
                  </span>
                  <div>
                    <p className="text-sm opacity-90">Current Plan</p>
                    <p className="text-2xl font-bold">
                      {TIER_INFO[currentTier].name}
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">
                      {TIER_INFO[currentTier].tagline}
                    </p>
                  </div>
                </div>
                {user.isMembershipActive && (
                  <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                    <p className="text-xs font-semibold">Active</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {user.membershipExpiresAt
                    ? `Expires: ${new Date(
                        user.membershipExpiresAt
                      ).toLocaleDateString("en-US")}`
                    : "No paid plan yet"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* All Tiers Overview */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {["bronze", "silver", "gold"].map((tier) => (
            <div
              key={tier}
              onClick={() => tier !== "bronze" && setSelectedTier(tier)}
              className={`relative rounded-2xl border-2 transition-all duration-300 ${
                tier === "bronze"
                  ? "border-gray-300 bg-gray-50 opacity-75"
                  : selectedTier === tier
                  ? "border-indigo-500 shadow-xl scale-105 cursor-pointer"
                  : "border-gray-200 hover:border-gray-300 shadow-md cursor-pointer"
              }`}
            >
              {tier === "gold" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </div>
              )}

              {tier === "bronze" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Current Plan
                </div>
              )}

              <div className="p-6">
                {/* Tier Header */}
                <div className="text-center mb-4">
                  <span className="text-5xl block mb-2">
                    {TIER_INFO[tier].icon}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {TIER_INFO[tier].name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {TIER_INFO[tier].tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  {tier === "bronze" ? (
                    <div className="text-3xl font-bold text-gray-900">
                      Free
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-gray-900">
                        {TIER_INFO[tier].price[duration]}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {duration === 1 ? "per month" : `for ${duration} months`}
                      </p>
                    </>
                  )}
                </div>

                {/* Benefits */}
                <div className="space-y-2.5">
                  {BENEFITS[tier].slice(0, 4).map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                  {BENEFITS[tier].length > 4 && (
                    <p className="text-indigo-600 text-sm font-medium ml-7">
                      +{BENEFITS[tier].length - 4} more features
                    </p>
                  )}
                </div>

                {/* Selection Indicator */}
                {tier !== "bronze" && selectedTier === tier && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 font-semibold">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Benefits of Selected Tier */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">
                {TIER_INFO[selectedTier].icon}
              </span>
              {TIER_INFO[selectedTier].name} Membership Benefits
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {BENEFITS[selectedTier].map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Duration Selection & Submit */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3 text-lg">
                Select Duration
              </label>
              <div className="grid grid-cols-1 gap-4">
                {[{ value: 1, label: "1 Month", tag: "" }].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDuration(option.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      duration === option.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {option.tag && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                        {option.tag}
                      </span>
                    )}
                    <div className="font-semibold text-gray-900">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {TIER_INFO[selectedTier].price[option.value]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 mb-6 border border-indigo-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm">Total Payment</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {TIER_INFO[selectedTier].name} • {duration}{" "}
                    {duration === 1 ? "Month" : "Months"}
                  </p>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {TIER_INFO[selectedTier].price[duration]}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Upgrade to ${TIER_INFO[selectedTier].name}`
              )}
            </button>

            {message && (
              <div
                className={`mt-4 p-4 rounded-xl ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {message.type === "success" ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="font-medium">{message.text}</span>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-gray-500 mt-4">
              By upgrading, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
