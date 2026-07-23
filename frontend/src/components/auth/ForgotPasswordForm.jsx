import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { forgotPassword } from "../../services/authService";

function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const response = await forgotPassword(data);

      toast.success(response.message);

      navigate("/reset-password");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-3 rounded mb-2"
          {...register("email", {
            required: "Email is required",
          })}
        />

        <p className="text-red-500 text-sm mb-6">
          {errors.email?.message}
        </p>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPasswordForm;