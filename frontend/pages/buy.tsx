import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BuyProducts() {
  const { data: session } = useSession();
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [requestStatus, setRequestStatus] = useState("");

  const [historyBatchId, setHistoryBatchId] = useState<string | null>(null);
  const [batchHistoryData, setBatchHistoryData] = useState<any>(null);

  const viewBatchHistory = async (batchId: string) => {
    if (!batchId) return;
    setHistoryBatchId(batchId);
    setBatchHistoryData(null);
    const res = await fetch(`/api/history/${batchId}`);
    if (res.ok) {
      setBatchHistoryData(await res.json());
    }
  };

  const userRole = session?.user?.role;

  const getUpstreamRole = (role?: string) => {
    switch (role) {
      case "PROCESSOR": return "FARMER";
      case "DISTRIBUTOR": return "PROCESSOR";
      case "RETAILER": return "DISTRIBUTOR";
      case "CUSTOMER": return "RETAILER";
      default: return null;
    }
  };

  useEffect(() => {
    if (!userRole) return;
    const upstreamRole = getUpstreamRole(userRole);
    if (!upstreamRole) {
      setLoading(false);
      return;
    }

    const fetchCrops = async () => {
      const res = await fetch(`/api/crops?ownerRole=${upstreamRole}&isListed=true`);
      if (res.ok) {
        const data = await res.json();
        // Filter out crops with 0 quantity on client side just in case
        setCrops(data.filter((c: any) => c.quantity > 0));
      }
      setLoading(false);
    };

    fetchCrops();
  }, [userRole]);

  const handleRequestPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !selectedCrop) return;

    if (parseFloat(quantity) > selectedCrop.quantity) {
      setRequestStatus("Error: Requested quantity exceeds available stock.");
      return;
    }

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: session.user.id,
        receiverId: selectedCrop.currentOwner.id,
        cropId: selectedCrop.id,
        quantity,
        deliveryDate
      })
    });

    if (res.ok) {
      setRequestStatus("Purchase request sent successfully!");
      setTimeout(() => {
        setSelectedCrop(null);
        setRequestStatus("");
        setQuantity("");
        setDeliveryDate("");
      }, 2000);
    } else {
      setRequestStatus("Failed to send request.");
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Loading marketplace...</div>;

  const upstreamRole = getUpstreamRole(userRole);

  if (!upstreamRole) {
    return <div className="min-h-screen flex items-center justify-center">You don't have permission to buy products here.</div>;
  }

  return (
    <div 
      className="min-h-screen text-stone-900 pt-20 relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]"></div>

      <Head>
        <title>Buy Products | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12 text-center text-white">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg tracking-wide" style={{ fontFamily: "'Yeseva One', serif" }}>Marketplace</h1>
          <p className="text-stone-200 text-lg max-w-2xl mx-auto drop-shadow-md">Purchase premium products directly from verified {upstreamRole.toLowerCase()}s in the supply chain.</p>
        </div>

        {crops.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/20 text-center">
            <p className="text-white text-lg font-medium">No products are currently available from {upstreamRole.toLowerCase()}s.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map(crop => (
              <div key={crop.id} className="bg-white/85 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40 hover:bg-white/95 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">{crop.name}</h3>
                    <button onClick={() => viewBatchHistory(crop.batchId)} className="text-xs bg-stone-900/5 hover:bg-stone-900/10 px-2 py-1 rounded-md text-stone-700 transition font-mono border border-stone-900/10 mt-1 flex items-center gap-1 backdrop-blur-sm">
                      🔍 Batch: {crop.batchId || "N/A"}
                    </button>
                  </div>
                  <span className="bg-[#276239] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {crop.quantity} kg
                  </span>
                </div>
                
                <div className="mb-6 space-y-2 text-sm text-stone-600">
                  <p>
                    <span className="font-semibold text-stone-900">Listed By: </span>
                    <Link href={`/profile/${crop.currentOwner.id}`} className="text-[#276239] hover:underline font-bold">
                      {crop.currentOwner.name}
                    </Link>
                  </p>
                  <p><span className="font-semibold text-stone-900">Harvest Date:</span> {new Date(crop.harvestDate).toLocaleDateString()}</p>
                </div>

                <button
                  onClick={() => setSelectedCrop(crop)}
                  className="w-full bg-gradient-to-r from-[#8A9A5B] to-[#9CAF88] hover:from-[#7c8b52] hover:to-[#8a9a79] text-white font-bold py-3 rounded-xl transition-all shadow-md transform active:scale-[0.98]"
                >
                  Request Purchase
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button 
              onClick={() => setSelectedCrop(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">Request Purchase</h2>
            <p className="text-stone-500 mb-6 text-sm">Requesting <span className="font-bold">{selectedCrop.name}</span> from {selectedCrop.currentOwner.name}</p>

            {requestStatus && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${requestStatus.includes("Error") || requestStatus.includes("Failed") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                {requestStatus}
              </div>
            )}

            <form onSubmit={handleRequestPurchase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Quantity (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  max={selectedCrop.quantity}
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]/50"
                  placeholder={`Max: ${selectedCrop.quantity} kg`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Requested Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]/50"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#8A9A5B] hover:bg-[#9CAF88] text-white font-bold py-3 rounded-xl transition shadow-md mt-4"
              >
                Send Request
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Traceability Modal */}
      {historyBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <button 
              onClick={() => setHistoryBatchId(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">Product Journey</h2>
            <p className="text-stone-500 mb-6 font-mono text-sm">Batch: {historyBatchId}</p>

            {!batchHistoryData ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8A9A5B]"></div>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-300 before:to-transparent">
                
                {/* Farmer origin */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#8A9A5B] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xl">🌱</div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-stone-800">Harvested</div>
                      <time className="font-mono text-xs text-stone-500">{new Date(batchHistoryData.harvestDate).toLocaleDateString()}</time>
                    </div>
                    <div className="text-sm text-stone-600">
                      Farmed by: <Link href={`/profile/${batchHistoryData.farmer.id}`} className="font-bold text-[#276239] hover:underline">{batchHistoryData.farmer.name}</Link>
                    </div>
                  </div>
                </div>

                {/* Subsequent transfers */}
                {batchHistoryData.history.map((h: any, idx: number) => {
                   const transaction = batchHistoryData.transactions.find((t: any) => t.timestamp === h.createdAt || t.blockchainHash === h.transactionHash);
                   const emoji = transaction?.receiverRole === "PROCESSOR" ? "🏭" : transaction?.receiverRole === "DISTRIBUTOR" ? "📦" : transaction?.receiverRole === "RETAILER" ? "🛒" : "🤝";
                   return (
                    <div key={h.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white text-stone-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xl">{emoji}</div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-stone-800">Delivered</div>
                          <time className="font-mono text-xs text-stone-500">{new Date(h.deliveryDate).toLocaleDateString()}</time>
                        </div>
                        <div className="text-sm text-stone-600">
                          From: <span className="font-bold text-stone-800">{h.sender}</span>
                          <br/>
                          To: <span className="font-bold text-[#276239]">{h.receiver}</span>
                        </div>
                        {h.transactionHash && (
                          <div className="mt-2 text-xs text-stone-400 break-all font-mono bg-stone-100 p-2 rounded">
                            Tx: {h.transactionHash}
                          </div>
                        )}
                      </div>
                    </div>
                   );
                })}

              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
