import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Building2,
  CheckCircle2,
  Search,
  X,
  Share2,
  Copy,
  HelpCircle,
  ArrowLeft,
  ChevronDown
} from "lucide-react";

export default function ProcessorTransactionsPage() {
  const { data: session } = useSession();
  const [filterType] = useState<"ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const userId = (session?.user as any)?.id || (session?.user as any)?.processorId || "";
        if (!userId) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/v1/wallet/transactions?userId=${userId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
             setTransactions(json.data.map((tx: any) => ({
                id: tx._id,
                shortId: tx.transactionId.substring(0, 8),
                type: tx.type, 
                title: tx.description || 'Transaction',
                counterparty: tx.orderId || 'Unknown',
                amount: `₹ ${tx.amount?.toLocaleString()}`,
                date: (tx.razorpayData?.created_at ? new Date(tx.razorpayData.created_at * 1000) : new Date(tx.timestamp)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: (tx.razorpayData?.created_at ? new Date(tx.razorpayData.created_at * 1000) : new Date(tx.timestamp)).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                status: tx.status,
                orderId: tx.orderId || '',
                productName: 'Crop Product',
                method: tx.razorpayData ? (tx.razorpayData.method || tx.razorpayData.status) : 'Escrow Wallet',
                razorpayId: tx.razorpayData?.id || tx.transactionId,
                rzpData: tx.razorpayData,
                rawAmount: tx.amount
             })));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTxs();
  }, [session]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter =
      filterType === "ALL" ||
      (filterType === "CREDITS" && tx.type === "CREDIT") ||
      (filterType === "DEBITS" && tx.type === "DEBIT") ||
      (filterType === "ESCROW" && tx.type === "ESCROW_HOLD");

    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.shortId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.productName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen text-stone-100 font-sans pb-24 pt-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <Head>
        <title>Processor Transactions | Seed2Shelf</title>
        <meta name="description" content="Processor financial transaction records, distributor payouts, and farmer raw material settlements" />
      </Head>

      {/* Solid Dark Background Overlay */}

      <div className="max-w-5xl mx-auto space-y-7">

        {/* =========================================================================
            PAGE HEADER (MATCHING FARMER WALLET TRANSACTIONS HEADER STYLE)
           ========================================================================= */}
        <div className="flex items-center gap-3.5 border-y border-stone-800/80 py-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
            <ArrowLeftRight className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Wallet Transactions
            </h1>
          </div>
        </div>


        {/* =========================================================================
            SEARCH & FILTER CONTROLS
           ========================================================================= */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <input
                type="text"
                placeholder="Search product, partner, or Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>

            {/* Single Filter Option */}
            <div className="relative shrink-0">
              <div className="bg-stone-900 border border-emerald-500/30 text-emerald-400 rounded-2xl px-5 py-2.5 text-xs font-extrabold flex items-center justify-center shadow-md">
                <span>All Transactions</span>
              </div>
            </div>

          </div>
        </div>


        {/* =========================================================================
            TRANSACTIONS LIST CONTAINER
           ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 h-6">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Transaction Records
            </h2>
            <span className="text-[11px] text-stone-500">
              Tap any row to view details
            </span>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-2.5 shadow-sm">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                No transaction records found matching your query.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="bg-stone-950/60 border border-stone-800/80 hover:border-stone-700/80 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-900/50 transition shadow-sm"
                >
                  {/* Left Side: Icon + Title & Partner */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 ${
                        tx.type === "DISTRIBUTOR"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : tx.type === "FARMER_PAYMENT"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}
                    >
                      {tx.type === "DISTRIBUTOR" ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : tx.type === "FARMER_PAYMENT" ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">
                        {tx.productName}
                      </h3>
                      <p className="text-xs text-stone-400 truncate">
                        {tx.type === "DISTRIBUTOR"
                          ? "Received from: "
                          : tx.type === "FARMER_PAYMENT"
                          ? "Paid to: "
                          : "Locked for: "}
                        <strong className="text-stone-200">{tx.counterparty}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Amount & Date */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm sm:text-base font-extrabold tracking-tight ${
                        tx.type === "DISTRIBUTOR"
                          ? "text-emerald-400"
                          : tx.type === "FARMER_PAYMENT"
                          ? "text-stone-300"
                          : "text-amber-300"
                      }`}
                    >
                      {tx.amount}
                    </div>
                    <span className="text-[11px] text-stone-500 font-mono block">
                      {tx.date}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>


      {/* =========================================================================
          PHONEPE-INSPIRED TRANSACTION DETAILS MODAL DIALOG (MATCHING FARMER 1-TO-1)
         ========================================================================= */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* PhonePe Status Top Header Bar */}
            <div className={`p-4 sm:p-5 text-white flex items-center justify-between ${
              (selectedTx.type === 'ESCROW' || selectedTx.type === 'ESCROW_HOLD') 
                ? (selectedTx.status === 'COMPLETED' ? 'bg-emerald-700' : 'bg-amber-600') 
                : 'bg-emerald-700'
            }`}>
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  {selectedTx.status === "COMPLETED" && (selectedTx.type === "ESCROW" || selectedTx.type === "ESCROW_HOLD") 
                    ? "COMPLETED" 
                    : selectedTx.status}
                </h3>
                <p className="text-xs text-emerald-100/90 font-medium pl-7">
                  {selectedTx.time} on {selectedTx.date}
                </p>
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl bg-black/20 hover:bg-black/40 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Main Content Container */}
            <div className="p-5 sm:p-6 space-y-5">
              
              {/* Paid By / Received From Card */}
              <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 space-y-3">
                <span className="text-[11px] text-stone-400 font-semibold block uppercase tracking-wider">
                  {selectedTx.type === "DISTRIBUTOR"
                    ? "Received from"
                    : selectedTx.type === "FARMER_PAYMENT"
                    ? "Paid to"
                    : "Escrow Payment for"}
                </span>

                <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                      {selectedTx.counterparty.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{selectedTx.counterparty}</h4>
                      <p className="text-xs text-stone-400 font-mono text-[11px]">{selectedTx.counterpartyUpi}</p>
                    </div>
                  </div>

                  <span className="text-lg font-black text-white tracking-tight shrink-0">
                    {selectedTx.amount}
                  </span>
                </div>

                <div className="text-xs text-stone-400 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Product Item:</span>
                    <strong className="text-stone-200">{selectedTx.productName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <strong className="font-mono text-stone-300">{selectedTx.orderId}</strong>
                  </div>
                </div>
              </div>

              {/* NEW BREAKDOWN SECTION (Only for ESCROW payments) */}
              {(selectedTx.type === "ESCROW_HOLD" || selectedTx.type === "ESCROW" || selectedTx.type === "DEBIT") && selectedTx.rawAmount && (
                <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-stone-800/80 pb-2.5">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Amount Breakdown
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Total Payment:</span>
                      <strong className="text-stone-200">₹ {selectedTx.rawAmount?.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Platform Fees (2%):</span>
                      <strong className="text-red-400">- ₹ {Math.round((selectedTx.rawAmount / 1.07) * 0.02).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">GST (5%):</span>
                      <strong className="text-red-400">- ₹ {Math.round((selectedTx.rawAmount / 1.07) * 0.05).toLocaleString()}</strong>
                    </div>
                    <div className="pt-2 border-t border-stone-800/60 flex justify-between items-center">
                      <span className="text-stone-300 font-bold">Net Amount to Farmer:</span>
                      <div className="text-right">
                        <strong className="text-emerald-400 font-extrabold text-sm block">₹ {Math.round(selectedTx.rawAmount / 1.07).toLocaleString()}</strong>
                        {selectedTx.status === "COMPLETED" && (
                          <span className="text-[10px] text-emerald-500 font-medium">(Released)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Transfer Details Section */}
              <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-stone-800/80 pb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-emerald-400" /> Transfer Details
                  </span>
                  <ChevronDown className="h-4 w-4 text-stone-500" />
                </div>

                <div className="space-y-3 text-xs">
                  
                  {/* Transaction ID */}
                  <div>
                    <span className="text-[11px] text-stone-400 block">Payment Method & ID (Razorpay)</span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-mono text-stone-200 text-[11px] truncate">
                        {selectedTx.rzpData?.method ? `${selectedTx.rzpData.method.charAt(0).toUpperCase() + selectedTx.rzpData.method.slice(1)} | ` : ''}{selectedTx.razorpayId || selectedTx.id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedTx.razorpayId || selectedTx.id, "id")}
                        className="text-stone-400 hover:text-emerald-400 p-1 transition cursor-pointer shrink-0"
                        title="Copy Transaction ID"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {copiedField === "id" && (
                      <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Copied!</span>
                    )}
                  </div>

                  {/* Account / Credited to */}
                  <div className="pt-2 border-t border-stone-800/60">
                    <span className="text-[11px] text-stone-400 block">
                      {selectedTx.type === "DISTRIBUTOR"
                        ? "Credited to Bank Account"
                        : selectedTx.type === "FARMER_PAYMENT"
                        ? "Debited from Bank Account"
                        : "Destination Bank Account"}
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-semibold text-emerald-400 text-xs">{selectedTx.bankName}</span>
                      <span className="font-extrabold text-white text-xs">{selectedTx.amount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-[11px] text-stone-400">UTR Reference:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-stone-300 text-[11px]">{selectedTx.utr}</span>
                        <button
                          onClick={() => copyToClipboard(selectedTx.utr, "utr")}
                          className="text-stone-400 hover:text-emerald-400 p-0.5 transition cursor-pointer"
                          title="Copy UTR"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {copiedField === "utr" && (
                      <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Copied UTR!</span>
                    )}
                  </div>

                </div>
              </div>


              {/* PhonePe-Style Action Buttons: ONLY Share Receipt & Support */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <button
                  onClick={() => alert(`Viewing Invoice (Mockup) for ${selectedTx.orderId}`)}
                  className="flex flex-col items-center justify-center p-3 bg-stone-950 hover:bg-stone-800 rounded-2xl border border-stone-800 transition cursor-pointer text-stone-200 hover:text-white"
                >
                  <ArrowDownLeft className="h-5 w-5 text-emerald-400 mb-1" />
                  <span className="text-[11px] font-bold">View Invoice</span>
                </button>

                <button
                  onClick={() => alert(`Share Receipt link copied for ${selectedTx.shortId}`)}
                  className="flex flex-col items-center justify-center p-3 bg-stone-950 hover:bg-stone-800 rounded-2xl border border-stone-800 transition cursor-pointer text-stone-200 hover:text-white"
                >
                  <Share2 className="h-5 w-5 text-emerald-400 mb-1" />
                  <span className="text-[11px] font-bold">Share Receipt</span>
                </button>

                <button
                  onClick={() => alert("Connecting to Seed2Shelf Processor Support...")}
                  className="flex flex-col items-center justify-center p-3 bg-stone-950 hover:bg-stone-800 rounded-2xl border border-stone-800 transition cursor-pointer text-stone-200 hover:text-white"
                >
                  <HelpCircle className="h-5 w-5 text-emerald-400 mb-1" />
                  <span className="text-[11px] font-bold">Support</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { user: JSON.parse(JSON.stringify(session.user)) } };
};
