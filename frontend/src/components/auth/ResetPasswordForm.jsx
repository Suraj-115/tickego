import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { resetPassword } from "../../services/authService";

function ResetPasswordForm() {
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

      const response = await resetPassword(data);

      toast.success(response.message);

      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset Failed");
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
          Reset Password
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-3"
          {...register("email", {
            required: "Email is required",
          })}
        />

        <input
          type="text"
          placeholder="OTP"
          className="w-full border p-3 rounded mb-3"
          {...register("otp", {
            required: "OTP is required",
          })}
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-3 rounded mb-3"
          {...register("newPassword", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Minimum 6 characters",
            },
          })}
        />

        <p className="text-red-500 text-sm mb-6">
          {errors.newPassword?.message}
        </p>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordForm;