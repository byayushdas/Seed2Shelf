import Head from "next/head";
import { useState } from "react";
import { useChain } from "@/hooks/useChain";
import { Card, StatCard } from "@/components/Card";
import { Truck, MapPin, Package, Search } from 'lucide-react';
import Link from "next/link";

export default function DistributorDashboard() {
  const { batches, isLoading, transferCustody } = useChain();
  
  const incomingBatches = batches.filter(b => b.status === "With Processor" || b.status === "Dispatched by Processor");
  const inTransitBatches = batches.filter(b => b.distributor?.address === "0x7890abcdef1234567890abcdef1234567890abcd");

  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatch) {
      await transferCustody(selectedBatch, "0xdef1234... (Retailer Address)", Number(newPrice), remarks);
      alert("Batch transported, price updated, and custody transferred to Retailer on-chain! (Demo Simulation)");
      setSelectedBatch(null);
    }
  };

  return (
    <>
      <Head>
        <title>Distributor Dashboard | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Distributor Dashboard</h1>
          <p className="text-gray-800 mt-1">MahaTrans Logistics. Connected via 0x7890...abcd</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            label="Pending Pickup" 
            value={incomingBatches.length} 
            icon={<MapPin className="w-6 h-6" />}
          />
          <StatCard 
            label="In Transit (Active)" 
            value="18" 
            icon={<Truck className="w-6 h-6 border-b-2 border-agri-gold pb-1" />}
          />
          <StatCard 
            label="Delivered This Week" 
            value="142" 
            icon={<Package className="w-6 h-6" />}
            trend="+15%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card title="Ready for Transport">
             {isLoading ? (
               <div className="text-center py-4 text-gray-800 animate-pulse">Fetching on-chain data...</div>
             ) : (
               <div className="space-y-4">
                 {incomingBatches.map(batch => (
                   <div key={batch.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <span className="text-sm font-bold text-agri-green">Batch #{batch.id}</span>
                         <h4 className="font-medium text-gray-900">{batch.cropType}  <span className="text-sm font-normal text-gray-800">({batch.weightKg} kg)</span></h4>
                       </div>
                       <button 
                         onClick={() => setSelectedBatch(batch.id)}
                         className="px-3 py-1 bg-agri-gold/10 text-agri-green-900 text-sm font-medium rounded hover:bg-agri-gold hover:text-white transition-colors"
                       >
                         Manage Transit
                       </button>
                     </div>
                     <p className="text-xs text-gray-800">From Processor: {batch.processor?.name} (Location: Pune Hub)</p>
                   </div>
                 ))}
                 {incomingBatches.length === 0 && (
                   <div className="text-center py-8 text-gray-800">No batches waiting for transport.</div>
                 )}
               </div>
             )}
           </Card>

           <Card title="Transport & Transfer Custody" className={selectedBatch ? 'border-2 border-agri-green shadow-xl' : 'opacity-50 pointer-events-none'}>
              {selectedBatch ? (
                <form onSubmit={handleProcess} className="space-y-4">
                  <div className="bg-agri-green-100/50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-agri-green-900 mb-1">Transporting Batch #{selectedBatch}</p>
                    <p className="text-xs text-black">Log vehicle conditions before signing handover to Retailer.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logistics Remarks</label>
                    <textarea required value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agri-green focus:border-agri-green text-black" placeholder="e.g. Transported via Cold Chain Truck MH12AB1234. Temp maintained at 4°C." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transport Cost + Markup Price (₹ per kg)</label>
                    <input type="number" required value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agri-green focus:border-agri-green text-black" placeholder="Enter marked-up price" />
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setSelectedBatch(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-agri-green hover:bg-agri-green-800 text-white rounded font-medium shadow-sm transition-colors">Sign Retailer Handoff</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-700">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select a batch from the queue to manage transit</p>
                </div>
              )}
           </Card>
        </div>
      </div>
    </>
  );
}
