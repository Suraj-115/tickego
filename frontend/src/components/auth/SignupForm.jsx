import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import { signupUser } from "../../services/authService";

function SignupForm() {
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

      const response = await signupUser(data);

      toast.success(response.message);

      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup Failed");
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
          Create Account
        </h1>

        <input
          type="text"
          placeholder="Name"
          className="w-full border p-3 rounded mb-2"
          {...register("name", { required: "Name is required" })}
        />
        <p className="text-red-500 text-sm mb-3">
          {errors.name?.message}
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-2"
          {...register("email", { required: "Email is required" })}
        />
        <p className="text-red-500 text-sm mb-3">
          {errors.email?.message}
        </p>

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-2"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Minimum 6 characters",
            },
          })}
        />
        <p className="text-red-500 text-sm mb-6">
          {errors.password?.message}
        </p>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignupForm;