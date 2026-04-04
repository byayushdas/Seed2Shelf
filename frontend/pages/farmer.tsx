import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";

interface Crop {
  id: string;
  name: string;
  quantity: number;
  harvestDate: string;
  currentOwner: { name: string; role: string };
}

interface Request {
  id: string;
  crop: Crop;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
  deliveryDate: string;
  status: string;
}

export default function FarmerDashboard({ user }: { user: any }) {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [newCrop, setNewCrop] = useState({ name: "", quantity: "", harvestDate: "" });

  useEffect(() => {
    fetchCrops();
    fetchRequests();
  }, []);

  const fetchCrops = async () => {
    const res = await fetch(`/api/crops?ownerId=${user.id}`);
    const data = await res.json();
    setCrops(data);
  };

  const fetchRequests = async () => {
    const res = await fetch(`/api/requests?userId=${user.id}`);
    const data = await res.json();
    setRequests(data.filter((r: any) => r.receiverId === user.id || r.senderId === user.id));
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newCrop, farmerId: user.id })
    });
    fetchCrops();
    setNewCrop({ name: "", quantity: "", harvestDate: "" });
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    fetchRequests();
    fetchCrops(); // Refresh crops in case ownership changed
  };

  return (
    <div className="min-h-screen relative text-white">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/235925/pexels-photo-235925.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
          className="w-full h-full object-cover opacity-30"
          alt=""
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 text-green-400 drop-shadow-md">Farmer Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Crop */}
          <div className="matte-glass p-8 rounded-3xl shadow-2xl border border-white/10 transform hover:scale-[1.01] transition-all">
            <h2 className="text-2xl font-bold mb-6 text-green-300">Log New Harvest</h2>
            <form onSubmit={handleAddCrop} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Crop Name</label>
                <input type="text" value={newCrop.name} onChange={e => setNewCrop({...newCrop, name: e.target.value})} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors" placeholder="e.g. Alphonso Mangoes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Quantity (kg)</label>
                <input type="number" value={newCrop.quantity} onChange={e => setNewCrop({...newCrop, quantity: e.target.value})} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Harvest Date</label>
                <input type="date" value={newCrop.harvestDate} onChange={e => setNewCrop({...newCrop, harvestDate: e.target.value})} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-900/40">
                Log on Blockchain & Save
              </button>
            </form>
          </div>

          {/* My Crops */}
          <div className="matte-glass p-8 rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-green-300">My Inventory</h2>
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow max-h-[400px]">
              {crops.length === 0 ? (
                <p className="text-stone-400 italic">No crops logged yet.</p>
              ) : (
                <div className="space-y-4">
                  {crops.map(crop => (
                    <div key={crop.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors">
                      <div>
                        <h3 className="font-bold text-green-400 text-lg">{crop.name}</h3>
                        <p className="text-sm text-stone-300">{crop.quantity} kg • Harvested: {new Date(crop.harvestDate).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-bold border border-green-500/20">In Stock</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Incoming Requests */}
          <div className="md:col-span-2 matte-glass p-8 rounded-3xl shadow-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-green-300">Transfer Requests & Shipments</h2>
            {requests.length === 0 ? (
               <p className="text-stone-400 italic">No active requests.</p>
            ) : (
              <div className="space-y-5">
                {requests.map(req => (
                  <div key={req.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/10 transition-colors">
                    <div className="flex-grow">
                      <p className="text-lg font-medium text-stone-100">
                        <span className="text-green-400 font-bold">{req.sender?.name}</span> wants to buy <span className="font-bold text-white">{req.crop?.name}</span>
                      </p>
                      <div className="flex gap-4 mt-2">
                        <p className="text-sm text-stone-400 flex items-center gap-1">📅 {new Date(req.deliveryDate).toLocaleDateString()}</p>
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
                      {req.status === "PENDING" && (
                        <>
                          <button onClick={() => updateRequestStatus(req.id, "ACCEPTED")} className="px-6 py-2 bg-green-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-green-500 transition">Accept</button>
                          <button onClick={() => updateRequestStatus(req.id, "REJECTED")} className="px-6 py-2 bg-red-600/20 text-red-400 rounded-xl border border-red-400/20 shadow-lg text-sm font-bold hover:bg-red-600/40 transition">Reject</button>
                        </>
                      )}
                      {req.status === "ACCEPTED" && req.sender.name === user.name && ( 
                        <button onClick={() => updateRequestStatus(req.id, "SHIPPED")} className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg text-sm font-bold hover:bg-blue-500 transition">Confirm Shipment</button>
                      )}
                      {req.status === "SHIPPED" && req.receiver.name === user.name && (
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
  if (!session || session.user?.role !== "FARMER") {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { user: session.user } };
};
