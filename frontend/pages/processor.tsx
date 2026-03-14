import Head from "next/head";
import { useState } from "react";
import { useChain } from "@/hooks/useChain";
import { Card, StatCard } from "@/components/Card";
import { Activity, Beaker, Truck, Search } from 'lucide-react';
import Link from "next/link";

export default function ProcessorDashboard() {
  const { batches, isLoading, transferCustody } = useChain();
  
  // Batches that are with the processor or expected to arrive
  const incomingBatches = batches.filter(b => b.status === "At Processor" || b.status === "Dispatched by Farmer");
  const processedBatches = batches.filter(b => b.processor?.address === "0xabcdef1234567890abcdef1234567890abcdef12");

  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatch) {
      await transferCustody(selectedBatch, "0x7890abc... (Distributor Address)", Number(newPrice), remarks);
      alert("Batch processed, price updated, and custody transferred to Distributor on-chain! (Demo Simulation)");
      setSelectedBatch(null);
    }
  };

  return (
    <>
      <Head>
        <title>Processor Dashboard | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Processor Dashboard</h1>
          <p className="text-gray-800 mt-1">AgriPro Processors Ltd. Connected via 0xabcd...ef12</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            label="Pending Processing" 
            value={incomingBatches.length} 
            icon={<Activity className="w-6 h-6" />}
          />
          <StatCard 
            label="Total Processed" 
            value="342" 
            icon={<Beaker className="w-6 h-6" />}
            trend="8% this month"
          />
          <StatCard 
            label="Avg Value Add" 
            value="+22%" 
            icon={<Truck className="w-6 h-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Incoming / Pending Batches List */}
           <Card title="Incoming Batches for Processing">
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
                         Process
                       </button>
                     </div>
                     <p className="text-xs text-gray-800">From: {batch.farmer.name} (₹{batch.farmer.pricePerKg}/kg)</p>
                   </div>
                 ))}
                 {incomingBatches.length === 0 && (
                   <div className="text-center py-8 text-gray-800">No incoming batches.</div>
                 )}
               </div>
             )}
           </Card>

           {/* Processing Action Panel */}
           <Card title="Process & Transfer Custody" className={selectedBatch ? 'border-2 border-agri-green shadow-xl' : 'opacity-50 pointer-events-none'}>
              {selectedBatch ? (
                <form onSubmit={handleProcess} className="space-y-4">
                  <div className="bg-agri-green-100/50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-agri-green-900 mb-1">Processing Batch #{selectedBatch}</p>
                    <p className="text-xs text-black">Ensure grading and cleaning logs are uploaded before signing.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality Remarks / Grading</label>
                    <textarea required value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agri-green focus:border-agri-green text-black" placeholder="e.g. Cleaned, sorted, moisture tracked < 10%. Premium grade." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Selling Price (₹ per kg)</label>
                    <input type="number" required value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agri-green focus:border-agri-green text-black" placeholder="Enter marked-up price" />
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setSelectedBatch(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-agri-green hover:bg-agri-green-800 text-white rounded font-medium shadow-sm transition-colors">Sign Custody Transfer</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-700">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select a batch from the queue to process</p>
                </div>
              )}
           </Card>
        </div>
        
        {/* Processed History */}
        <div className="mt-8">
          <Card title="Recently Processed">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-sm font-semibold text-black">Batch ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-black">Crop</th>
                    <th className="px-6 py-4 text-sm font-semibold text-black">Markup Price</th>
                    <th className="px-6 py-4 text-sm font-semibold text-black">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedBatches.map(batch => (
                    <tr key={batch.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-agri-green">#{batch.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{batch.cropType}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">₹{batch.processor?.pricePerKg}/kg</td>
                      <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate">{batch.processor?.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
