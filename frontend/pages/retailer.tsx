import Head from "next/head";
import { useState } from "react";
import { useChain } from "@/hooks/useChain";
import { WalletHistory } from "@/components/WalletHistory";
import { Card, StatCard } from "@/components/Card";
import { Store, QrCode, Tag, CheckCircle2, Truck } from 'lucide-react';
import Link from "next/link";
import { QRCodeSVG } from 'qrcode.react';

export default function RetailerDashboard() {
  const { batches, isLoading, transferCustody } = useChain();
  
  const incomingBatches = batches.filter(b => b.status === "With Distributor" || b.status === "Dispatched by Distributor");
  const shelfBatches = batches.filter(b => b.retailer?.address === "0xdef1234567890abcdef1234567890abcdef12345");

  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [shelfPrice, setShelfPrice] = useState("");
  const [showQRFor, setShowQRFor] = useState<string | null>(null);

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatch) {
      // In this system, retailer is the last node before consumer
      await transferCustody(selectedBatch, "0x000... (End of Chain)", Number(shelfPrice), remarks);
      alert("Batch received, shelf price set. Verification contract unlocked escrow for farmer! (Demo Simulation)");
      setSelectedBatch(null);
    }
  };

  const getUrl = () => {
     if (typeof window !== 'undefined') {
         return window.location.origin;
     }
     return 'https://seed2shelf.demo';
  }

  return (
    <>
      <Head>
        <title>Retailer Dashboard | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Retailer Dashboard</h1>
          <p className="text-gray-800 mt-1">FreshMart Supermarket. Connected via 0xdef1...2345</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            label="Arriving Shipments" 
            value={incomingBatches.length} 
            icon={<Truck className="w-6 h-6" />}
          />
          <StatCard 
            label="Active Shelf Items" 
            value={shelfBatches.length} 
            icon={<Store className="w-6 h-6" />}
          />
          <StatCard 
            label="Avg Shelf Margin" 
            value="18%" 
            icon={<Tag className="w-6 h-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
           <Card title="Receive Shipments (Releases Escrow)">
             {isLoading ? (
               <div className="text-center py-4 text-gray-800 animate-pulse">Fetching on-chain data...</div>
             ) : (
               <div className="space-y-4">
                 {incomingBatches.map(batch => (
                   <div key={batch.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <span className="text-sm font-bold text-agri-green">Batch #{batch.id}</span>
                         <h4 className="font-medium text-gray-900">{batch.cropType} <span className="text-sm font-normal text-gray-800">({batch.weightKg} kg)</span></h4>
                       </div>
                       <button 
                         onClick={() => setSelectedBatch(batch.id)}
                         className="px-3 py-1 bg-agri-gold/10 text-agri-green-900 text-sm font-medium rounded hover:bg-agri-gold hover:text-white transition-colors"
                       >
                         Confirm Receipt
                       </button>
                     </div>
                     <p className="text-xs text-gray-800">Logistics by: {batch.distributor?.name}</p>
                   </div>
                 ))}
                 {incomingBatches.length === 0 && (
                   <div className="text-center py-8 text-gray-800">No pending shipments.</div>
                 )}
               </div>
             )}
           </Card>

           <Card title="Verify & Set Shelf Price" className={selectedBatch ? 'border-2 border-agri-green shadow-xl' : 'opacity-50 pointer-events-none'}>
              {selectedBatch ? (
                <form onSubmit={handleReceive} className="space-y-4">
                  <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4 flex items-start gap-3 border border-green-200">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Escrow Release Warning</p>
                      <p className="text-xs mt-1">Signing this receipt will trigger the <code>PaymentEscrow.sol</code> contract to release locked funds directly to the farmer&apos;s wallet.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Remarks (Quality Check)</label>
                    <textarea required value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agri-green focus:border-agri-green text-black" placeholder="e.g. Received in good condition. Packaged for retail 1kg bags." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Final Shelf Price (₹ per kg)</label>
                    <input type="number" required value={shelfPrice} onChange={e => setShelfPrice(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agri-green focus:border-agri-green text-black" placeholder="Final consumer price" />
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setSelectedBatch(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-agri-green hover:bg-agri-green-800 text-white rounded font-medium shadow-sm transition-colors">Confirm & Release Funds</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-700">
                  <Store className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select a shipment to confirm receipt and set pricing</p>
                </div>
              )}
           </Card>
        </div>

        <Card title="In-Store Inventory & QR Generation">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shelfBatches.map(batch => (
                <div key={batch.id} className="border border-gray-200 rounded-lg p-5 hover:border-agri-gold transition-colors relative">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="font-bold text-gray-900">{batch.cropType}</h3>
                       <p className="text-sm text-gray-800">Batch #{batch.id}</p>
                     </div>
                     <span className="bg-agri-green-100 text-agri-green-900 text-xs font-bold px-2.5 py-1 rounded">
                       ₹{batch.retailer?.pricePerKg}/kg
                     </span>
                   </div>
                   
                   <p className="text-xs text-black mb-4 line-clamp-2">Origin: {batch.farmer.name}</p>
                   
                   {showQRFor === batch.id ? (
                     <div className="flex flex-col items-center p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                       <QRCodeSVG value={`${getUrl()}/trace/${batch.id}`} size={140} level="M" includeMargin={true} />
                       <div className="mt-3 flex gap-2 w-full">
                         <button onClick={() => setShowQRFor(null)} className="flex-1 text-xs border border-gray-300 px-2 py-1.5 rounded hover:bg-gray-50">Hide</button>
                         <Link href={`/trace/${batch.id}`} className="flex-1 text-xs bg-agri-green text-white px-2 py-1.5 rounded text-center hover:bg-agri-green-800">View Demo</Link>
                       </div>
                     </div>
                   ) : (
                     <button 
                       onClick={() => setShowQRFor(batch.id)}
                       className="w-full flex items-center justify-center gap-2 py-3 border border-agri-green text-agri-green rounded-lg hover:bg-agri-green hover:text-white transition-colors"
                     >
                       <QrCode className="w-5 h-5" />
                       Generate Trace QR
                     </button>
                   )}
                </div>
              ))}
              {shelfBatches.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-800 bg-gray-50 rounded-lg">No active inventory on shelves.</div>
              )}
           </div>
        </Card>
      </div>
    </>
  );
}
