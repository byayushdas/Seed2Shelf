import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";

interface Crop {
  id: string;
  name: string;
  quantity: number;
}

interface Request {
  id: string;
  crop: Crop;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
  status: string;
}

export default function DistributorDashboard({ user }: { user: any }) {
  const [myInventory, setMyInventory] = useState<Crop[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const cropsRes = await fetch(`/api/crops?ownerId=${user.id}`);
    setMyInventory(await cropsRes.json());

    const reqRes = await fetch(`/api/requests?userId=${user.id}`);
    setRequests(await reqRes.json());
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, transactionHash: "0xDistributorHash" })
    });
    fetchData();
  };

  return (
    <div className="min-h-screen relative text-white">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
          className="w-full h-full object-cover opacity-30"
          alt=""
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 text-green-400 drop-shadow-md">Distributor Logistics Portal</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Logistics Inventory */}
          <div className="matte-glass p-8 rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-green-300">Goods in Transit / Warehouse</h2>
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow max-h-[400px]">
              {myInventory.length === 0 ? <p className="text-stone-400 italic">No goods currently in your possession.</p> : (
                <div className="space-y-4">
                  {myInventory.map(crop => (
                    <div key={crop.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
                      <h3 className="font-bold text-green-400 text-lg">{crop.name}</h3>
                      <p className="text-sm text-stone-300">Qty: {crop.quantity} kg</p>
                      <button onClick={() => alert("Forward functionality connects to Retailer Request API")} className="mt-4 bg-stone-100/10 hover:bg-stone-100/20 text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg">Deliver to Retailer</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transfer Requests */}
          <div className="matte-glass p-8 rounded-3xl shadow-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-green-300">Active Shipments & Hand-offs</h2>
            <div className="space-y-5">
              {requests.map(req => (
                <div key={req.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-start gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-full flex justify-between items-center">
                    <p className="text-lg font-bold text-white">
                      {req.crop?.name} 
                    </p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      req.status === "PENDING" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
                      req.status === "ACCEPTED" ? "text-blue-400 border-blue-400/30 bg-blue-400/10" :
                      "text-green-400 border-green-400/30 bg-green-400/10"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-stone-400 italic">Partner: {req.sender.id === user.id ? req.receiver.name : req.sender.name}</p>
                  
                  <div className="flex gap-3 mt-2 w-full justify-end">
                    {req.status === "PENDING" && req.receiver.id === user.id && (
                       <button onClick={() => updateRequestStatus(req.id, "ACCEPTED")} className="px-6 py-2 bg-green-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-green-500 transition">Accept Hand-off</button>
                    )}
                    {req.status === "ACCEPTED" && req.sender.id === user.id && (
                       <button onClick={() => updateRequestStatus(req.id, "SHIPPED")} className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-blue-500 transition">Dispatch Log</button>
                    )}
                    {req.status === "SHIPPED" && req.receiver.id === user.id && (
                       <button onClick={() => updateRequestStatus(req.id, "DELIVERED")} className="px-6 py-2 bg-green-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-green-500 transition">Confirm Valid Receipt</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session || session.user?.role !== "DISTRIBUTOR") {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { user: session.user } };
};
