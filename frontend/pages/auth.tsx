import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function Auth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "FARMER",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
      }
    } else {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsLogin(true);
        setError(""); // Clear error on successful signup
        // Optionally, show a success message or auto-login
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute z-0 w-full h-full object-fill opacity-60"
      >
        <source src="/login_signup.mp4" type="video/mp4" />
      </video>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-dark p-10 rounded-2xl w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`px-6 py-2 rounded-full transition text-sm font-medium ${
                isLogin ? "bg-[#8A9A5B] text-white shadow-lg" : "text-stone-400 hover:text-white"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`px-6 py-2 rounded-full transition text-sm font-medium ${
                !isLogin ? "bg-[#8A9A5B] text-white shadow-lg" : "text-stone-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8A9A5B]"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8A9A5B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8A9A5B]"
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8A9A5B] [&>option]:bg-stone-900"
              >
                <option value="FARMER">Farmer</option>
                <option value="PROCESSOR">Processor</option>
                <option value="DISTRIBUTOR">Distributor</option>
                <option value="RETAILER">Retailer</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#8A9A5B] hover:bg-[#9CAF88] transition py-3 rounded-lg font-bold text-white shadow-lg mt-6"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
