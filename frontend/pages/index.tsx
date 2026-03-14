import Head from "next/head";
import Link from 'next/link';
import { ShieldCheck, Leaf, ArrowRight, Activity, Wallet } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Head>
        <title>Seed2Shelf | Transparent Agricultural Supply Chain</title>
        <meta name="description" content="A blockchain-based agricultural supply chain transparency platform built for the Indian market." />
      </Head>
      
      {/* Hero Section */}
      <section className="relative w-full bg-agri-green-900 border-b-4 border-agri-gold overflow-hidden">
        {/* Hexagonal overlay pattern for Web3 feel */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M54.627 0l.83.676v13.515l-11.621 6.643-11.636-6.643V.676L33.03 0h21.597zM21.597 0l.83.676v13.515L10.806 20.834-.83 14.191V.676L0 0h21.597zM54.627 30l.83.676v13.515l-11.621 6.643-11.636-6.643V30.676L33.03 30h21.597zM21.597 30l.83.676v13.515L10.806 50.834-.83 44.191V30.676L0 30h21.597zM33.03 15l.83.676v13.515l-11.621 6.643-11.636-6.643V15.676L11.433 15h21.597z\\' fill=\\'%23D4AF37\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')" }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-agri-green-800 border border-agri-gold/30 text-agri-gold text-sm font-medium mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agri-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-agri-gold"></span>
            </span>
            Live on Sepolia Testnet
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            From the <span className="text-agri-gold">Seed</span> to the <span className="text-agri-green-100">Shelf</span>
          </h1>
          
          <p className="mt-4 max-w-2xl text-xl text-agri-green-100 mx-auto mb-10">
            A blockchain-based agricultural supply chain guaranteeing fair prices for farmers and total transparency for consumers.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link href="/login" className="flex items-center gap-2 bg-agri-gold hover:bg-agri-gold-light text-agri-green-900 px-8 py-4 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg shadow-agri-gold/20">
              <Wallet className="w-5 h-5" />
              Enter DApp
            </Link>
            <Link href="/trace/1" className="flex items-center gap-2 bg-transparent border-2 border-agri-gold/50 text-agri-gold hover:bg-agri-gold/10 px-8 py-4 rounded-lg font-bold transition-all">
              <Activity className="w-5 h-5" />
              Trace Demo Batch
            </Link>
          </div>
        </div>
      </section>

      {/* 5-Step Supply Chain Visualization */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Trustless Supply Chain</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Smart contracts automatically log batch handoffs, track price deltas, and hold payments in escrow, preventing exploitation at every node.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative">
            {/* Connecting Line (hidden on mobile) */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-agri-green via-agri-gold to-agri-green -translate-y-1/2 z-0 opacity-30"></div>
            
            <div className="supply-node">
              <div className="w-20 h-20 rounded-full bg-agri-green-100 border-4 border-agri-green text-agri-green flex items-center justify-center z-10 relative mb-4 shadow-lg shadow-agri-green/20">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-center">1. Farmer</h3>
              <p className="text-xs text-center text-gray-500 mt-1">Logs harvest,<br/>sets farm-gate price</p>
            </div>

            <ArrowRight className="text-gray-300 w-6 h-6 rotate-90 md:rotate-0" />

            <div className="supply-node">
              <div className="w-20 h-20 rounded-full bg-agri-green-100 border-4 border-agri-green text-agri-green flex items-center justify-center z-10 relative mb-4 shadow-lg shadow-agri-green/20">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-center">2. Processor</h3>
              <p className="text-xs text-center text-gray-500 mt-1">Cleans, grades,<br/>confirms receipt</p>
            </div>

            <ArrowRight className="text-gray-300 w-6 h-6 rotate-90 md:rotate-0" />

            <div className="supply-node">
              <div className="w-20 h-20 rounded-full bg-agri-green-100 border-4 border-agri-green text-agri-green flex items-center justify-center z-10 relative mb-4 shadow-lg shadow-agri-green/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-center">3. Distributor</h3>
              <p className="text-xs text-center text-gray-500 mt-1">Transports,<br/>logs logicstics</p>
            </div>

            <ArrowRight className="text-gray-300 w-6 h-6 rotate-90 md:rotate-0" />

            <div className="supply-node">
              <div className="w-20 h-20 rounded-full bg-agri-green-100 border-4 border-agri-green text-agri-green flex items-center justify-center z-10 relative mb-4 shadow-lg shadow-agri-green/20">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-center">4. Retailer</h3>
              <p className="text-xs text-center text-gray-500 mt-1">Sets shelf price,<br/>prints QR codes</p>
            </div>

            <ArrowRight className="text-gray-300 w-6 h-6 rotate-90 md:rotate-0" />

             <div className="supply-node">
              <div className="w-20 h-20 rounded-full bg-agri-gold-light border-4 border-agri-gold text-agri-green-900 flex items-center justify-center z-10 relative mb-4 shadow-lg shadow-agri-gold/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-center">5. Consumer</h3>
              <p className="text-xs text-center text-gray-500 mt-1">Scans QR,<br/>sees full chain</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CSS helper for the grid layout */}
      <style dangerouslySetInnerHTML={{__html:`
        .supply-node { display: flex; flex-direction: column; items-center; justify-center; z-index: 10; width: 120px; align-items: center; }
      `}}/>
    </>
  );
}
