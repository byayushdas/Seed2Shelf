import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "FARMER"
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden text-white">
      <video 
  autoPlay 
  loop 
  muted 
  playsInline 
  poster="https://images.pexels.com/photos/158179/lake-constance-sheep-pasture-sheep-blue-158179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover opacity-40"
>
  <source src="https://cdn.coverr.co/videos/preview/720p/coverr-drone-shot-of-a-field-of-wheat-5231.mp4" type="video/mp4" />
</video>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 glass-dark p-10 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-400">Join Seed2Shelf</h2>
        
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Full Name</label>
            <input name="name" type="text" onChange={handleChange} required className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Email</label>
            <input name="email" type="email" onChange={handleChange} required className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Password</label>
            <input name="password" type="password" onChange={handleChange} required className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Role</label>
            <select name="role" onChange={handleChange} value={formData.role} className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500">
              <option value="FARMER">Farmer</option>
              <option value="PROCESSOR">Processor</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="RETAILER">Retailer</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
          
          <button type="submit" className="w-full bg-green-600 hover:bg-green-500 transition py-3 rounded-lg font-bold text-white shadow-lg mt-6">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-400">
          Already have an account? <Link href="/login" className="text-green-400 hover:underline">Log in</Link>
        </div>
      </motion.div>
    </div>
  );
}
