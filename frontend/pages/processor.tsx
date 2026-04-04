import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";

interface Crop {
  id: string;
  name: string;
  quantity: number;
  farmerId: string;
  farmer: { name: string };
  currentOwnerId: string;
  currentOwner?: { role: string };
}

interface Request {
  id: string;
  crop: Crop;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
  status: string;
}

export default function ProcessorDashboard({ user }: { user: any }) {
  const [availableCrops, setAvailableCrops] = useState<Crop[]>([]);
  const [myInventory, setMyInventory] = useState<Crop[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const cropsRes = await fetch("/api/crops");
    const allCrops = await cropsRes.json();
    setAvailableCrops(allCrops.filter((c: any) => c.currentOwner?.role === "FARMER"));
    setMyInventory(allCrops.filter((c: any) => c.currentOwnerId === user.id));

    const reqRes = await fetch(`/api/requests?userId=${user.id}`);
    setRequests(await reqRes.json());
    
    // In a real app we'd fetch distributors, just mocking one or allowing text input for MVP
  };

  const buyCrop = async (cropId: string, farmerId: string) => {
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: user.id, receiverId: farmerId, cropId, deliveryDate: new Date().toISOString() })
    });
    fetchData();
    alert("Purchase request sent!");
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, transactionHash: "0xMockHash" })
    });
    fetchData();
  };

  return (
    <div className="min-h-screen relative text-white">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/126605/pexels-photo-126605.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
          className="w-full h-full object-cover opacity-30"
          alt=""
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 text-green-400 drop-shadow-md">Processor Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Marketplace for Processors */}
          <div className="matte-glass p-8 rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-green-300">Farmer Market (Available Crops)</h2>
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow max-h-[400px]">
              {availableCrops.length === 0 ? (
                <p className="text-stone-400 italic">No crops available from farmers yet.</p>
              ) : (
                <div className="space-y-4">
                  {availableCrops.map(crop => (
                    <div key={crop.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-colors">
                      <div className="flex-grow">
                        <h3 className="font-bold text-green-400 text-lg">{crop.name} <span className="text-xs font-normal text-stone-300">({crop.quantity}kg)</span></h3>
                        <p className="text-sm text-stone-400">From: {crop.farmer?.name}</p>
                      </div>
                      <button onClick={() => buyCrop(crop.id, crop.farmerId)} className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition">
                        Request Purchase
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Inventory */}
          <div className="matte-glass p-8 rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-green-300">My Processed Inventory</h2>
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow max-h-[400px]">
              {myInventory.length === 0 ? (
                <p className="text-stone-400 italic">You don't own any batches yet.</p>
              ) : (
                <div className="space-y-4">
                  {myInventory.map(crop => (
                    <div key={crop.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
                      <h3 className="font-bold text-green-400 text-lg">{crop.name}</h3>
                      <p className="text-sm text-stone-300">Qty: {crop.quantity} kg</p>
                      <div className="mt-4">
                        <button onClick={() => alert("Forward functionality connects to Distributor Request API")} className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg">Forward to Distributor</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transfer Requests */}
          <div className="md:col-span-2 matte-glass p-8 rounded-3xl shadow-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-green-300">Transfer Management</h2>
            {requests.length === 0 ? (
              <p className="text-stone-400 italic">No active requests.</p>
            ) : (
              <div className="space-y-5">
                {requests.map(req => (
                  <div key={req.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/10 transition-colors">
                    <div className="flex-grow">
                      <p className="text-lg font-medium text-stone-100">
                        <span className="font-bold text-white">{req.crop?.name}</span>
                      </p>
                      <div className="flex gap-4 mt-2">
                         <p className="text-sm text-stone-400">Partner: {req.sender.id === user.id ? req.receiver.name : req.sender.name}</p>
                         <p className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            req.status === "PENDING" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
                            req.status === "ACCEPTED" ? "text-blue-400 border-blue-400/30 bg-blue-400/10" :
                            "text-green-400 border-green-400/30 bg-green-400/10"
                          }`}>
                            {req.status}
                          </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {req.status === "PENDING" && req.receiver.id === user.id && (
                         <button onClick={() => updateRequestStatus(req.id, "ACCEPTED")} className="px-6 py-2 bg-green-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-green-500 transition">Accept</button>
                      )}
                      {req.status === "ACCEPTED" && req.sender.id === user.id && (
                         <button onClick={() => updateRequestStatus(req.id, "SHIPPED")} className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-blue-500 transition">Confirm Shipment</button>
                      )}
                      {req.status === "SHIPPED" && req.receiver.id === user.id && (
                         <button onClick={() => updateRequestStatus(req.id, "DELIVERED")} className="px-6 py-2 bg-green-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-green-500 transition">Confirm Receipt</button>
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
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session || session.user?.role !== "PROCESSOR") {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { user: session.user } };
};
