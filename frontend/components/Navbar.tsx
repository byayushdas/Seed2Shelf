import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ethers } from "ethers";

export default function Navbar() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          // Optionally send to backend to link wallet
        }
      } catch (err) {
        console.error("Wallet connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-dark text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-wider text-green-400">
          Seed2Shelf
        </Link>

        <div className="hidden md:flex flex-wrap gap-4 items-center text-sm font-medium">
          <Link href="/" className="hover:text-green-300 transition">Home</Link>
          <Link href="/farmer" className="hover:text-green-300 transition">Farmer</Link>
          <Link href="/processor" className="hover:text-green-300 transition">Processor</Link>
          <Link href="/distributor" className="hover:text-green-300 transition">Distributor</Link>
          <Link href="/retailer" className="hover:text-green-300 transition">Retailer</Link>
          <Link href="/customer/marketplace" className="hover:text-green-300 transition">Customer</Link>
        </div>

        <div className="flex gap-4 items-center">
          {session ? (
            <>
              <span className="text-sm opacity-80 border-r pr-4 border-white/20">
                {session.user?.name}
              </span>
              <button onClick={() => signOut()} className="text-sm hover:text-red-400">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:text-green-300">Login</Link>
              <Link href="/signup" className="text-sm bg-green-600 hover:bg-green-500 px-4 py-2 rounded-full transition">
                Sign Up
              </Link>
            </>
          )}

          <button
            onClick={connectWallet}
            className="text-sm border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-full transition"
          >
            {wallet ? `${wallet.substring(0,6)}...${wallet.substring(38)}` : "Connect Wallet"}
          </button>
        </div>
      </div>
    </nav>
  );
}
