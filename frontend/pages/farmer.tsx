import Head from "next/head";
import { useState } from "react";
import { useChain } from "@/hooks/useChain";
import { Card, StatCard } from "@/components/Card";
import { Plus, Leaf, Clock, CheckCircle2 } from 'lucide-react';
import Link from "next/link";

export default function FarmerDashboard() {
  const { batches, isLoading, logHarvestBatch } = useChain();
  
  // Filter batches for the mock farmer (hardcoded for demo)
  const myBatches = batches.filter(b => b.farmer.name === "Ramesh Patil");
  
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [cropType, setCropType] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [gps, setGps] = useState("18.5204° N, 73.8567° E"); // Default to farm location
  const [pricePerKg, setPricePerKg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logHarvestBatch({ cropType, weightKg, gps, pricePerKg });
    setShowForm(false);
    alert("Batch registered on-chain successfully! (Demo Simulation)");
  };

  return (
    <>
      <Head>
        <title>Farmer Dashboard | Seed2Shelf</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, Ramesh Patil. Connected via 0x1234...5678</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-agri-green hover:bg-agri-green-800 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Log New Harvest'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            label="Total Weight Sold" 
            value="1,500 kg" 
            icon={<Leaf className="w-6 h-6" />}
            trend="12% vs last season"
          />
          <StatCard 
            label="Pending Escrow Payments" 
            value="₹45,000" 
            icon={<Clock className="w-6 h-6" />}
          />
          <StatCard 
            label="Successful Handoffs" 
            value="24" 
            icon={<CheckCircle2 className="w-6 h-6" />}
          />
        </div>

        {/* Registration Form */}
        {showForm && (
          <Card className="mb-8 border-l-4 border-l-agri-gold" title="Register New Harvest Batch (Smart Contract: BatchRegistry.sol)">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                  <input type="text" required value={cropType} onChange={e => setCropType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agri-green focus:border-agri-green" placeholder="e.g. Organic Toor Dal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input type="number" required value={weightKg} onChange={e => setWeightKg(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agri-green focus:border-agri-green" placeholder="500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Gate Price (₹ per kg)</label>
                  <input type="number" required value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agri-green focus:border-agri-green" placeholder="60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPS Origin</label>
                  <input type="text" required value={gps} onChange={e => setGps(e.target.value)} className="w-full px-4 py-2 border border-agri-green-800 bg-gray-50 text-gray-600 rounded-md" readOnly />
                  <p className="text-xs text-gray-500 mt-1">Auto-detected from registered farm profile</p>
                </div>
              </div>
              <div className="flex justify-end border-t pt-4">
                 <button type="submit" className="bg-agri-gold hover:bg-agri-gold-light text-agri-green-900 font-bold px-8 py-3 rounded-lg shadow transition-colors">
                   Sign & Register Batch
                 </button>
              </div>
            </form>
          </Card>
        )}

        {/* Batch History */}
        <Card title="My Harvest Batches">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 animate-pulse">Fetching on-chain data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Batch ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Crop</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Weight</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">My Price</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myBatches.map(batch => (
                    <tr key={batch.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-agri-green">#{batch.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{batch.cropType}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{batch.weightKg} kg</td>
                      <td className="px-6 py-4 text-sm text-gray-700">₹{batch.farmer.pricePerKg}/kg</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          batch.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/trace/${batch.id}`} className="text-agri-gold hover:text-agri-green-900 text-sm font-medium underline underline-offset-2">
                           Trace Journey
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {myBatches.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No batches logged yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
