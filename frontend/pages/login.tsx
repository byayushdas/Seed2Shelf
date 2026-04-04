import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
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
        <h2 className="text-3xl font-bold mb-6 text-center text-green-400">Welcome Back</h2>
        
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500" />
          </div>
          
          <button type="submit" className="w-full bg-green-600 hover:bg-green-500 transition py-3 rounded-lg font-bold text-white shadow-lg mt-6">
            Log In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-400">
          Don't have an account? <Link href="/signup" className="text-green-400 hover:underline">Sign up</Link>
        </div>
      </motion.div>
    </div>
  );
}
