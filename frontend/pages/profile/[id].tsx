import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";

export default function StakeholderProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        setUser(await res.json());
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Profile...</div>;
  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-white">User not found</div>;

  return (
    <div className="min-h-screen relative text-white">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/1031700/pexels-photo-1031700.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
          className="w-full h-full object-cover opacity-30"
          alt=""
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="matte-glass p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-4xl shadow-xl border-4 border-white/10">
              {user.role?.[0]}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-xl text-green-400 font-medium mb-4">{user.role}</p>
              <div className="flex items-center gap-1 justify-center md:justify-start">
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className="text-yellow-400 text-2xl">★</span>
                ))}
                <span className="text-stone-400 ml-2">(4.9/5 Rating)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h3 className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-2">Wallet Address</h3>
              <p className="font-mono text-sm text-blue-400 break-all">{user.walletAddress || "Not Linked"}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h3 className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-2">Member Since</h3>
              <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-white/10">
            <h3 className="text-2xl font-bold mb-6 text-green-300">Operational Stats</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-3xl font-bold text-white">124</p>
                <p className="text-stone-400 text-xs">Batches Handled</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-3xl font-bold text-white">98%</p>
                <p className="text-stone-400 text-xs">Fulfillment Rate</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-3xl font-bold text-white">4.9</p>
                <p className="text-stone-400 text-xs">Community Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
