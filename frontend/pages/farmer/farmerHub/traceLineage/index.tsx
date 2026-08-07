import Head from "next/head";
import Link from "next/link";
import { GitBranch, ArrowLeft, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { productService } from "@/services/product";

export default function TraceLineage() {
  const [crops, setCrops] = useState<any[]>([]);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await productService.farmerApi.getCrops();
        setCrops(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCrops();
  }, []);

  return (
    <div className="min-h-screen relative text-white pt-6 pb-20">
      <Head>
        <title>Trace Lineage | Seed2Shelf</title>
      </Head>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/farmer"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              <GitBranch className="w-8 h-8 text-[#00d26a]" />
              Trace Produce Lineage
            </h1>
            <p className="text-stone-400 text-xs font-medium mt-1">
              Visualize supply chain handoff trees from your farm to processors, distributors, and consumer shelves.
            </p>
          </div>
        </div>

        <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Full Produce Lineage Search</h3>
              <p className="text-stone-400 text-xs mt-1">Look up end-to-end QR provenance graph for any harvest batch.</p>
            </div>
            <Link
              href="/home/trace-product"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d26a] hover:bg-[#00b25a] text-black font-extrabold text-xs transition shadow-lg shadow-[#00d26a]/20"
            >
              <span>Open Batch Search</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>


          {crops.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold text-white mb-4">Recent Crop Lineage Hashes</h3>
              <div className="space-y-3">
                {crops.map((crop) => (
                  <div key={crop.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-sm">{crop.cropName}</div>
                      <div className="text-stone-400 text-xs mt-1">Batch: {crop.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-mono text-indigo-300">
                        {crop.blockchainTxHash ? `${crop.blockchainTxHash.slice(0, 10)}...${crop.blockchainTxHash.slice(-8)}` : "Pending Tx"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
