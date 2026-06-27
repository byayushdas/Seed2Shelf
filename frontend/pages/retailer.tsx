import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Head from "next/head";

interface Crop {
  id: string;
  name: string;
  quantity: number;
  farmerId: string;
  farmer: { name: string };
  currentOwnerId: string;
  currentOwner?: { role: string };
  isListed: boolean;
}

interface Request {
  id: string;
  crop: Crop;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
  status: string;
  quantity: number;
  deliveryDate: string;
  ratings?: any[];
}

export default function RetailerDashboard({ user }: { user: any }) {
  const [myInventory, setMyInventory] = useState<Crop[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const cropsRes = await fetch(`/api/crops?ownerId=${user.id}`);
    const allCrops = await cropsRes.json();
    setMyInventory(allCrops);

    const reqRes = await fetch(`/api/requests?userId=${user.id}`);
    setRequests(await reqRes.json());
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, userId: user.id })
    });
    fetchData();
  };

  const submitRating = async (requestId: string, revieweeId: string, value: number) => {
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, reviewerId: user.id, revieweeId, requestId })
    });
    fetchData();
  };

  const toggleListing = async (cropId: string, currentStatus: boolean) => {
    await fetch(`/api/crops/${cropId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isListed: !currentStatus })
    });
    fetchData();
  };

  return (
    <div className="min-h-screen relative text-white">
      <Head>
        <title>Retailer Dashboard | Seed2Shelf</title>
      </Head>
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/1036856/pexels-photo-1036856.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
          className="w-full h-full object-cover opacity-30"
          alt=""
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 text-green-400 drop-shadow-md">Retailer Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* My Inventory */}
          <div className="matte-glass p-8 rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-green-300">Store Inventory</h2>
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow max-h-[400px]">
              {myInventory.length === 0 ? (
                <p className="text-stone-400 italic">You don't own any batches yet.</p>
              ) : (
                <div className="space-y-4">
                  {myInventory.map(crop => (
                    <div key={crop.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-green-400 text-lg">{crop.name}</h3>
                          <p className="text-sm text-stone-300">Qty: {crop.quantity} kg</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold border ${crop.isListed ? 'bg-green-500/20 text-green-300 border-green-500/20' : 'bg-stone-500/20 text-stone-300 border-stone-500/20'}`}>
                          {crop.isListed ? 'Listed' : 'Unlisted'}
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        {crop.quantity > 0 && (
                          <button 
                            onClick={() => toggleListing(crop.id, crop.isListed)}
                            className="w-full bg-stone-100/10 hover:bg-stone-100/20 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg"
                          >
                            {crop.isListed ? 'Take Down from Marketplace' : 'List on Marketplace'}
                          </button>
                        )}
                        {crop.quantity === 0 && (
                           <span className="block text-center text-xs bg-red-500/20 text-red-300 px-3 py-2 rounded-xl font-bold border border-red-500/20">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transfer Requests */}
          <div className="flex flex-col gap-8">
            {/* Incoming Orders */}
            <div className="matte-glass p-8 rounded-3xl shadow-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-green-300">Incoming Orders (Sales)</h2>
              {requests.filter(r => r.receiver.id === user.id).length === 0 ? (
                <p className="text-stone-400 italic">No incoming orders yet.</p>
              ) : (
                <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                  {requests.filter(r => r.receiver.id === user.id).map(req => (
                    <div key={req.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
                      <p className="text-lg font-medium text-stone-100 mb-2">
                        <span className="text-green-400 font-bold">{req.sender?.name}</span> wants to buy <span className="font-bold text-white">{req.quantity} kg of {req.crop?.name}</span>
                      </p>
                      <div className="flex gap-4 mb-4">
                          <p className="text-sm text-stone-400 flex items-center gap-1">📅 {new Date(req.deliveryDate).toLocaleDateString()}</p>
                          <p className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            req.status === "PENDING" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
                            req.status === "DELIVERED" ? "text-green-400 border-green-400/30 bg-green-400/10" :
                            "text-blue-400 border-blue-400/30 bg-blue-400/10"
                          }`}>
                            {req.status === "SELLER_CONFIRMED" || req.status === "BUYER_CONFIRMED" ? "DELIVERY PENDING" : req.status}
                          </p>
                      </div>
                      
                      <div className="flex gap-3">
                        {req.status === "PENDING" && (
                            <>
                              <button onClick={() => updateRequestStatus(req.id, "ACCEPTED")} className="flex-1 py-2 bg-green-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-green-500 transition">Accept</button>
                              <button onClick={() => updateRequestStatus(req.id, "REJECTED")} className="flex-1 py-2 bg-red-600/20 text-red-400 rounded-xl border border-red-400/20 shadow-lg text-sm font-bold hover:bg-red-600/40 transition">Reject</button>
                            </>
                        )}
                        {(req.status === "ACCEPTED" || req.status === "BUYER_CONFIRMED") && (
                            <button onClick={() => updateRequestStatus(req.id, "CONFIRM_DELIVERY")} className="w-full py-2 bg-blue-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-blue-500 transition">Confirm Delivery</button>
                        )}
                        {req.status === "SELLER_CONFIRMED" && (
                            <p className="text-stone-400 text-sm italic py-2">Waiting for buyer to confirm delivery...</p>
                        )}
                        {req.status === "DELIVERED" && (
                            <div className="flex flex-col gap-2 w-full">
                              <p className="text-green-400 text-sm italic py-2 font-bold flex items-center gap-2">✓ Delivery Completed</p>
                              {!req.ratings?.some((r: any) => r.reviewerId === user.id) && (
                                <div className="flex items-center gap-2 text-sm bg-black/20 p-2 rounded-lg">
                                  <span className="text-stone-300">Rate Buyer:</span>
                                  {[1,2,3,4,5].map(v => (
                                    <button key={v} onClick={() => submitRating(req.id, req.sender.id, v)} className="hover:scale-110 text-stone-500 hover:text-yellow-400 transition text-lg">★</button>
                                  ))}
                                </div>
                              )}
                              {req.ratings?.some((r: any) => r.reviewerId === user.id) && (
                                <p className="text-xs text-stone-500 italic">You rated this buyer.</p>
                              )}
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Orders */}
            <div className="matte-glass p-8 rounded-3xl shadow-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-green-300">My Purchases (Outbound)</h2>
              {requests.filter(r => r.sender.id === user.id).length === 0 ? (
                <p className="text-stone-400 italic">No active purchases.</p>
              ) : (
                <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                  {requests.filter(r => r.sender.id === user.id).map(req => (
                    <div key={req.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
                      <p className="text-lg font-medium text-stone-100 mb-2">
                        You requested to buy <span className="font-bold text-white">{req.quantity} kg of {req.crop?.name}</span> from <span className="text-green-400 font-bold">{req.receiver?.name}</span>
                      </p>
                      <div className="flex gap-4 mb-4">
                          <p className="text-sm text-stone-400 flex items-center gap-1">📅 {new Date(req.deliveryDate).toLocaleDateString()}</p>
                          <p className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            req.status === "PENDING" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
                            req.status === "DELIVERED" ? "text-green-400 border-green-400/30 bg-green-400/10" :
                            "text-blue-400 border-blue-400/30 bg-blue-400/10"
                          }`}>
                            {req.status === "SELLER_CONFIRMED" || req.status === "BUYER_CONFIRMED" ? "DELIVERY PENDING" : req.status}
                          </p>
                      </div>
                      
                      <div className="flex gap-3">
                        {req.status === "PENDING" && (
                            <p className="text-stone-400 text-sm italic py-2">Waiting for seller to accept...</p>
                        )}
                        {(req.status === "ACCEPTED" || req.status === "SELLER_CONFIRMED") && (
                            <button onClick={() => updateRequestStatus(req.id, "CONFIRM_DELIVERY")} className="w-full py-2 bg-blue-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-blue-500 transition">Confirm Delivery</button>
                        )}
                        {req.status === "BUYER_CONFIRMED" && (
                            <p className="text-stone-400 text-sm italic py-2">Waiting for seller to confirm delivery...</p>
                        )}
                        {req.status === "DELIVERED" && (
                            <div className="flex flex-col gap-2 w-full">
                              <p className="text-green-400 text-sm italic py-2 font-bold flex items-center gap-2">✓ Delivery Completed</p>
                              {!req.ratings?.some((r: any) => r.reviewerId === user.id) && (
                                <div className="flex items-center gap-2 text-sm bg-black/20 p-2 rounded-lg">
                                  <span className="text-stone-300">Rate Seller:</span>
                                  {[1,2,3,4,5].map(v => (
                                    <button key={v} onClick={() => submitRating(req.id, req.receiver.id, v)} className="hover:scale-110 text-stone-500 hover:text-yellow-400 transition text-lg">★</button>
                                  ))}
                                </div>
                              )}
                              {req.ratings?.some((r: any) => r.reviewerId === user.id) && (
                                <p className="text-xs text-stone-500 italic">You rated this seller.</p>
                              )}
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session || session.user?.role !== "RETAILER") {
    return { redirect: { destination: "/auth", permanent: false } };
  }
  return { props: { user: session.user } };
};
