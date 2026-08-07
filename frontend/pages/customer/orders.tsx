import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { Package, Calendar, CheckCircle2, Search, ArrowRight, Loader2 } from "lucide-react";
import { orderService } from "@/services/order";

export default function CustomerOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.customerApi.getOrders();
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch customer orders", err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) fetchOrders();
  }, [session]);

  const filteredOrders = orders.filter((o) =>
    o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-white pt-24 pb-20 relative font-sans bg-stone-950">
      <Head>
        <title>Order History | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Package className="h-8 w-8 text-[#00d26a]" />
              Order History
            </h1>
            <p className="text-stone-400 text-sm mt-1">Track your past purchases and escrow payments.</p>
          </div>

          <div className="relative flex-grow md:max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-stone-500" />
            </span>
            <input
              type="text"
              placeholder="Search by order ID or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d26a] focus:ring-1 focus:ring-[#00d26a] transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#00d26a] animate-spin mb-4" />
            <p className="text-stone-400">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <Package className="w-16 h-16 text-stone-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Orders Found</h3>
            <p className="text-stone-400">You haven't placed any orders yet, or no matches found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">Order {order.orderId}</h3>
                    <p className="text-stone-400 text-sm flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" /> Placed on {order.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#00d26a]/10 border border-[#00d26a]/20 text-[#00d26a] rounded-xl text-xs font-bold uppercase tracking-wider">
                      {order.status}
                    </span>
                    <span className="font-bold text-xl text-white">₹{order.totalAmount}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 mt-4">
                  <p className="text-sm font-semibold text-stone-300 mb-2">Purchased from: <span className="text-white">{order.sellerName}</span></p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="bg-black/20 border border-white/5 p-3 rounded-2xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00d26a]" />
                        <div>
                          <p className="text-xs text-stone-400">Crop ID: {item.cropId}</p>
                          <p className="text-sm font-bold text-white">{item.quantity} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
