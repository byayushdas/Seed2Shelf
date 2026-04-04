import Head from "next/head";
import { useRouter } from "next/router";
import { useChain } from "@/hooks/useChain";
import { Card } from "@/components/Card";
import { Sprout, CheckCircle, ShieldCheck, Tag, HelpCircle, ArrowRight } from 'lucide-react';
import Link from "next/link";

export default function TraceBatch() {
  const router = useRouter();
  const { batchId } = router.query;
  const { getBatchById, isLoading } = useChain();

  const id = Number(batchId);
  const batch = !isNaN(id) ? getBatchById(id) : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Sprout className="w-16 h-16 text-agri-green animate-pulse mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Querying Blockchain Records...</h2>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <HelpCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Batch Not Found</h1>
        <p className="text-gray-500 mb-6 max-w-md">We couldn&apos;t find this batch ID on the Seed2Shelf network. It may be invalid or not yet processed.</p>
        <Link href="/" className="px-6 py-3 bg-agri-green text-white rounded-lg hover:bg-agri-green-800 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Verified Origin: {batch.cropType} | Seed2Shelf Trace</title>
      </Head>

      {/* Hero Header */}
      <div className="bg-agri-green-900 text-white pb-24 pt-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M54.627 0l.83.676v13.515l-11.621 6.643-11.636-6.643V.676L33.03 0h21.597zM21.597 0l.83.676v13.515L10.806 20.834-.83 14.191V.676L0 0h21.597zM54.627 30l.83.676v13.515l-11.621 6.643-11.636-6.643V30.676L33.03 30h21.597zM21.597 30l.83.676v13.515L10.806 50.834-.83 44.191V30.676L0 30h21.597zM33.03 15l.83.676v13.515l-11.621 6.643-11.636-6.643V15.676L11.433 15h21.597z\\' fill=\\'%23D4AF37\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')" }}></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-green-800 text-agri-gold text-xs font-bold mb-6 border border-agri-gold/30">
            <ShieldCheck className="w-4 h-4" /> Blockchain Verified Origin
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">{batch.cropType}</h1>
          <p className="text-agri-green-100 text-lg">Batch #{batch.id} • {batch.weightKg} kg</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-20 pb-20">
        
        {/* Verification Summary Card */}
        <Card className="mb-8 shadow-2xl border-0 !p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-agri-green-100/50 rounded-bl-full -z-10"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Grown By</p>
              <h2 className="text-2xl font-bold text-gray-900">{batch.farmer.name}</h2>
              <p className="text-gray-600 mt-1 flex items-center gap-1">
                <span className="text-xs">📍</span> {batch.gpsCoordinates}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex-shrink-0 w-full sm:w-auto text-center sm:text-right">
              <p className="text-sm font-medium text-green-800 mb-1">Farmer Received:</p>
              <p className="text-3xl font-extrabold text-agri-green">₹{batch.farmer.pricePerKg}<span className="text-lg font-medium text-green-700">/kg</span></p>
              
              {batch.retailer && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-700 font-medium">Retail Shelf Price: ₹{batch.retailer.pricePerKg}/kg</p>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mt-1">
                    {(batch.farmer.pricePerKg / batch.retailer.pricePerKg * 100).toFixed(0)}% of consumer price went to farmer
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Tag className="w-6 h-6 text-agri-gold" />
          The Transparent Journey
        </h3>

        {/* Timeline */}
        <div className="relative pl-6 sm:pl-8 py-4 border-l-2 border-gray-200 ml-4 sm:ml-6 space-y-12">
          
          {/* Phase 1: Origin */}
          <div className="relative">
            <div className="absolute -left-[43px] sm:-left-[51px] top-1 w-8 h-8 rounded-full bg-white border-4 border-agri-green flex items-center justify-center z-10 shadow-sm">
               <Sprout className="w-4 h-4 text-agri-green" />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline justify-between mb-1">
                <h4 className="text-lg font-bold text-gray-900">1. Harvested securely at source</h4>
                <div className="text-xs text-agri-green-900 font-mono bg-agri-green-100 px-2 pl-3 py-1 rounded-full">{batch.farmer.address.slice(0,10)}...</div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{new Date(batch.farmer.timestamp * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="font-medium text-gray-900 mb-2">{batch.farmer.name}</p>
                <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-2 mt-2">
                  <span className="text-gray-500">Farm Gate Price logged:</span>
                  <span className="font-bold text-agri-green">₹{batch.farmer.pricePerKg}/kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2: Processing */}
          {batch.processor && (
            <div className="relative">
              <div className="absolute -left-[43px] sm:-left-[51px] top-1 w-8 h-8 rounded-full bg-white border-4 border-agri-green flex items-center justify-center z-10 shadow-sm">
                 <CheckCircle className="w-4 h-4 text-agri-green" />
              </div>
              <div>
                <div className="flex flex-wrap items-baseline justify-between mb-1">
                  <h4 className="text-lg font-bold text-gray-900">2. Quality Graded & Processed</h4>
                  <div className="text-xs text-agri-green-900 font-mono bg-agri-green-100 px-2 pl-3 py-1 rounded-full">{batch.processor.address.slice(0,10)}...</div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{new Date(batch.processor.timestamp * 1000).toLocaleDateString('en-IN')}</p>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <p className="font-medium text-gray-900 mb-2">{batch.processor.name}</p>
                  <p className="text-sm text-gray-600 mb-3 pb-3 border-b border-gray-50 italic">"{batch.processor.remarks}"</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Processor Markup Price:</span>
                    <span className="font-bold text-gray-800">₹{batch.processor.pricePerKg}/kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phase 3: Logistics */}
          {batch.distributor && (
            <div className="relative">
              <div className="absolute -left-[43px] sm:-left-[51px] top-1 w-8 h-8 rounded-full bg-white border-4 border-agri-green flex items-center justify-center z-10 shadow-sm">
                 <ArrowRight className="w-4 h-4 text-agri-green" />
              </div>
              <div>
                <div className="flex flex-wrap items-baseline justify-between mb-1">
                  <h4 className="text-lg font-bold text-gray-900">3. Transport & Logistics Logging</h4>
                  <div className="text-xs text-agri-green-900 font-mono bg-agri-green-100 px-2 pl-3 py-1 rounded-full">{batch.distributor.address.slice(0,10)}...</div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{new Date(batch.distributor.timestamp * 1000).toLocaleDateString('en-IN')}</p>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <p className="font-medium text-gray-900 mb-2">{batch.distributor.name}</p>
                  <p className="text-sm text-gray-600 mb-3 pb-3 border-b border-gray-50 italic">"{batch.distributor.remarks}"</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Distributor Transfer Price:</span>
                    <span className="font-bold text-gray-800">₹{batch.distributor.pricePerKg}/kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

           {/* Phase 4: Retail Shelf */}
           {batch.retailer && (
             <div className="relative">
               <div className="absolute -left-[43px] sm:-left-[51px] top-1 w-8 h-8 rounded-full bg-agri-gold border-4 border-agri-gold-light flex items-center justify-center z-10 shadow-md">
                  <ShieldCheck className="w-4 h-4 text-white" />
               </div>
               <div>
                 <div className="flex flex-wrap items-baseline justify-between mb-1">
                   <h4 className="text-lg font-bold text-gray-900">4. Shelf Arrival & Escrow Release</h4>
                   <div className="text-xs text-agri-green-900 font-mono bg-agri-gold/20 border border-agri-gold/50 px-2 pl-3 py-1 rounded-full">{batch.retailer.address.slice(0,10)}...</div>
                 </div>
                 <p className="text-sm text-gray-500 mb-3">{new Date(batch.retailer.timestamp * 1000).toLocaleDateString('en-IN')}</p>
                 <div className="bg-gradient-to-br from-white to-agri-gold/5 p-5 rounded-lg border border-agri-gold/30 shadow-md">
                   <p className="font-medium text-gray-900 mb-2 text-lg">{batch.retailer.name}</p>
                   <p className="text-sm text-gray-600 mb-4 italic">"{batch.retailer.remarks}"</p>
                   <div className="flex justify-between items-center bg-white p-3 rounded border border-gray-100">
                     <span className="text-gray-600 font-medium">Final Consumer Price:</span>
                     <span className="font-extrabold text-2xl text-agri-green-900">₹{batch.retailer.pricePerKg}</span>
                   </div>
                   
                   <div className="mt-4 flex items-start gap-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <p>Receiving this batch initiated the <code className="font-mono bg-green-100 px-1 rounded">PaymentEscrow.sol</code> execution, sending the locked ₹{batch.farmer.pricePerKg * batch.weightKg} directly to <strong>{batch.farmer.name}</strong>.</p>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {!batch.retailer && (
             <div className="relative pl-6 opacity-50">
                <div className="absolute -left-[27px] sm:-left-[35px] top-1 w-4 h-4 rounded-full bg-gray-300 z-10"></div>
                <h4 className="text-lg font-medium text-gray-500">Awaiting further supply chain updates...</h4>
             </div>
           )}

        </div>
      </div>
    </>
  );
}
