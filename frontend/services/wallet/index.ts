import { ethers } from "ethers";

export const walletService = {
  async connectMetaMask(): Promise<string | null> {
    if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        return accounts[0];
      }
    }
    return null;
  },

  async getEthBalance(address: string): Promise<{ eth: string; inr: string }> {
    if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const bal = await provider.getBalance(address);
        const formattedEth = parseFloat(ethers.formatEther(bal)).toFixed(4);
        const inrVal = (parseFloat(formattedEth) * 300000).toLocaleString("en-IN", { maximumFractionDigits: 0 });
        return { eth: formattedEth, inr: inrVal };
      } catch (err) {
        console.error("Balance fetch error:", err);
      }
    }
    return { eth: "1.4285", inr: "4,28,550" };
  },

  async linkWalletToUser(userId: string, walletAddress: string) {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    if (!res.ok) {
      throw new Error("Failed to link wallet address to user account.");
    }
    return res.json();
  },

  farmerApi: {
    async getWallet() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/farmer/wallet`);
      if (!res.ok) throw new Error("Failed to fetch wallet");
      return res.json();
    },
    async getInvoices() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/farmer/wallet/invoices`);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    },
    async getTransactions() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/farmer/wallet/transactions`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    }
  },

  distributorApi: {
    async getWallet() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/distributor/wallet`);
      if (!res.ok) throw new Error("Failed to fetch distributor wallet");
      return res.json();
    },
    async getInvoices() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/distributor/wallet/invoices`);
      if (!res.ok) throw new Error("Failed to fetch distributor invoices");
      return res.json();
    },
    async getTransactions() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/distributor/wallet/transactions`);
      if (!res.ok) throw new Error("Failed to fetch distributor transactions");
      return res.json();
    }
  },

  retailerApi: {
    async getWallet() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/retailer/wallet`);
      if (!res.ok) throw new Error("Failed to fetch retailer wallet");
      return res.json();
    },
    async getInvoices() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/retailer/wallet/invoices`);
      if (!res.ok) throw new Error("Failed to fetch retailer invoices");
      return res.json();
    },
    async getTransactions() {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000");
      const res = await fetch(`${baseUrl}/api/retailer/wallet/transactions`);
      if (!res.ok) throw new Error("Failed to fetch retailer transactions");
      return res.json();
    }
  }
};
