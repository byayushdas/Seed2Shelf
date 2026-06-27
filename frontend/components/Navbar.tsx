import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ethers } from "ethers";

export default function Navbar() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        }
      } catch (err) {
        console.error("Wallet connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const role = session?.user?.role;

  return (
    <nav className="fixed top-0 w-full z-50 glass-dark text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          className="text-3xl font-bold tracking-widest text-[#9CAF88]"
          style={{ fontFamily: "'Yeseva One', serif" }}
        >
          SEED2SHELF
        </Link>

        {session ? (
          <div className="hidden md:flex flex-wrap gap-6 items-center text-sm font-medium">
            {role === "CUSTOMER" && (
              <Link href="/customer/marketplace" className="hover:text-[#B2C29D] transition">Buy Products</Link>
            )}
            {role === "FARMER" && (
              <Link href="/farmer" className="hover:text-[#B2C29D] transition">List Products</Link>
            )}
            {role === "PROCESSOR" && (
              <>
                <Link href="/buy" className="hover:text-[#B2C29D] transition">Buy Products</Link>
                <Link href="/processor" className="hover:text-[#B2C29D] transition">List Products</Link>
              </>
            )}
            {role === "DISTRIBUTOR" && (
              <>
                <Link href="/buy" className="hover:text-[#B2C29D] transition">Buy Products</Link>
                <Link href="/distributor" className="hover:text-[#B2C29D] transition">List Products</Link>
              </>
            )}
            {role === "RETAILER" && (
              <>
                <Link href="/buy" className="hover:text-[#B2C29D] transition">Buy Products</Link>
                <Link href="/retailer" className="hover:text-[#B2C29D] transition">List Products</Link>
              </>
            )}
          </div>
        ) : (
          <div className="hidden md:flex flex-wrap gap-4 items-center text-sm font-medium">
            {/* Roles hidden when not logged in */}
          </div>
        )}

        <div className="flex gap-4 items-center">
          {session ? (
            <>
              <span className="text-sm opacity-80 border-r pr-4 border-white/20">
                {session.user?.name}
              </span>
              <Link href={`/profile/${session.user.id}`} className="text-sm hover:text-[#B2C29D] font-medium border-r pr-4 border-white/20">
                Profile
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm hover:text-red-400">
                Logout
              </button>
              <button
                onClick={connectWallet}
                className="text-sm border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-full transition"
              >
                {wallet ? `${wallet.substring(0,6)}...${wallet.substring(38)}` : "Connect Wallet"}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="text-sm hover:text-[#B2C29D] font-medium">Login</Link>
              <Link href="/auth" className="text-sm bg-[#8A9A5B] hover:bg-[#9CAF88] px-5 py-2 rounded-full transition font-medium">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
