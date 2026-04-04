import { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

export default function CustomerMarketplace() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchMarket();
  }, []);

  const fetchMarket = async () => {
    const res = await fetch("/api/crops");
    const data = await res.json();
    setProducts(data);
  };

  const showTraceability = async (product: any) => {
    setSelectedProduct(product);
    const res = await fetch(`/api/crops/${product.id}/history`);
    if (res.ok) {
      setHistory(await res.json());
    } else {
      setHistory([]);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative text-white">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/158179/lake-constance-sheep-pasture-sheep-blue-158179.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
          className="w-full h-full object-cover opacity-20"
          alt=""
        />
        <div className="absolute inset-0 bg-stone-950/80"></div>
      </div>

      <Head>
        <title>Customer Marketplace | Seed2Shelf</title>
      </Head>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-extrabold text-white text-center mb-12 drop-shadow-lg">
          Fresh Produce <span className="text-green-400">Marketplace</span>
        </h1>

        {/* Search Bar */}
        <div className="matte-glass p-6 rounded-3xl shadow-2xl border border-white/10 mb-12 flex items-center gap-4">
          <div className="flex-grow relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search for crops (e.g. Mango, Potato)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-green-500 transition-colors" 
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <motion.div 
              key={product.id} 
              whileHover={{ y: -10 }}
              onClick={() => showTraceability(product)} 
              className="matte-glass rounded-3xl shadow-2xl cursor-pointer border border-white/5 overflow-hidden group hover:border-green-500/30 transition-all"
            >
              <div className="h-48 bg-white/5 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform">
                {product.name.toLowerCase().includes("mango") ? "🥭" :
                 product.name.toLowerCase().includes("rice") ? "🍚" :
                 product.name.toLowerCase().includes("wheat") ? "🌾" : "🥬"}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                <p className="text-sm text-stone-400 mb-4">Owner: {product.currentOwner?.name}</p>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="font-bold text-green-400 text-lg">₹{(Math.random() * 50 + 50).toFixed(0)}/kg</span>
                  <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-1 rounded-full font-bold border border-green-500/20 uppercase tracking-wider">In Stock</span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 text-stone-500 italic">
              No products matching your search.<br/>Try another crop name!
            </div>
          )}
        </div>

        {/* Traceability Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="matte-glass rounded-[40px] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)] border border-white/10"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">Provenance Trace</h2>
                  <p className="text-xs text-green-400 font-mono mt-1">ID: {selectedProduct.batchId || "OFF-CHAIN-DEMO"}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white px-4 py-2 rounded-2xl transition-colors text-2xl font-light">&times;</button>
              </div>
              
              <div className="p-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="mb-12 text-center">
                  <div className="text-6xl mb-6 drop-shadow-2xl">🔗</div>
                  <h3 className="text-3xl font-bold text-white">{selectedProduct.name}</h3>
                  <p className="text-stone-400 mt-2 font-light">Authenticated Smart Contract Path</p>
                </div>

                {/* Vertical Traceability Trail */}
                <div className="relative border-l-2 border-green-500/30 ml-6 space-y-12">
                  {/* Origin */}
                  <div className="relative pl-10">
                     <span className="absolute -left-3 top-2 w-6 h-6 bg-green-500 rounded-full border-4 border-stone-900 shadow-[0_0_15px_rgba(34,197,94,0.5)]"></span>
                     <h4 className="font-bold text-green-400 text-lg uppercase tracking-wider">Origin - Harvested</h4>
                     <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-sm text-stone-300">Farmer: <button onClick={() => router.push(`/profile/${selectedProduct.farmerId}`)} className="text-white hover:text-green-400 font-bold underline decoration-green-500/30 underline-offset-4">{selectedProduct.farmer?.name}</button></p>
                        <p className="text-xs text-stone-500 mt-1">Date: {new Date(selectedProduct.harvestDate).toLocaleDateString()}</p>
                     </div>
                  </div>

                  {/* Historical Transfers */}
                  {history.map((step, idx) => (
                    <div key={idx} className="relative pl-10">
                       <span className="absolute -left-3 top-2 w-6 h-6 bg-green-500/80 rounded-full border-4 border-stone-900"></span>
                       <h4 className="font-bold text-white text-lg uppercase tracking-wider">Handoff</h4>
                       <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-sm text-stone-300">From: <span className="text-stone-100 font-medium">{step.sender}</span></p>
                          <p className="text-sm text-stone-300 mt-1">To: <span className="text-stone-100 font-medium">{step.receiver}</span></p>
                          <p className="text-xs text-stone-500 mt-2">Verified Date: {new Date(step.deliveryDate).toLocaleDateString()}</p>
                          {step.transactionHash && (
                            <p className="text-[10px] text-blue-400 mt-3 font-mono break-all bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">Hash: {step.transactionHash}</p>
                          )}
                       </div>
                    </div>
                  ))}

                  {/* Final Destination */}
                  <div className="relative pl-10">
                     <span className="absolute -left-3 top-2 w-6 h-6 bg-green-400 rounded-full border-4 border-stone-900 animate-pulse"></span>
                     <h4 className="font-bold text-white text-lg uppercase tracking-wider">Current Location</h4>
                     <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/10 shadow-lg shadow-green-900/10">
                        <p className="text-sm text-stone-300">Retailer: <button onClick={() => router.push(`/profile/${selectedProduct.currentOwnerId}`)} className="text-white hover:text-green-400 font-bold underline decoration-green-500/30 underline-offset-4">{selectedProduct.currentOwner?.name}</button></p>
                        <span className="inline-block mt-3 text-[10px] bg-green-500 text-black px-3 py-1 rounded-full font-black uppercase">Live for Sale</span>
                     </div>
                  </div>
                </div>

                <button className="w-full mt-12 bg-green-600 hover:bg-green-500 py-5 rounded-[20px] text-white font-black text-xl transition-all shadow-2xl shadow-green-900/50 flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  Purchase Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
