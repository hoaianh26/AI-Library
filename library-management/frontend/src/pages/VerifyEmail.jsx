import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/users/verify-email",
          {
            params: { token },
          }
        );
        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. Please try again."
        );
      }
    };

    verify();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>
        <p
          className={
            status === "success"
              ? "text-green-600"
              : status === "error"
              ? "text-red-600"
              : "text-gray-700"
          }
        >
          {message}
        </p>
        {status === "success" && (
          <p className="mt-2 text-sm text-gray-500">
            Redirecting to login page...
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
