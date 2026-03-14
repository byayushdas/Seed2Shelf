import { useChain } from "@/hooks/useChain";
import { Card } from "@/components/Card";
import { Activity, ArrowRightLeft, PlusCircle } from "lucide-react";

export function WalletHistory() {
  const { walletActivity, account } = useChain();

  if (!account) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Activity className="w-6 h-6 text-agri-gold" />
        Immutable Wallet History
      </h2>
      <Card className="p-0 overflow-hidden border border-gray-200">
        {walletActivity.length === 0 ? (
          <div className="p-8 text-center text-gray-800">
            No on-chain activity found for this wallet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {walletActivity.map((activity, index) => (
              <div key={`${activity.id}-${index}`} className="p-6 hover:bg-agri-green-50/30 transition-colors flex items-start gap-4">
                <div className={`p-3 rounded-xl flex-shrink-0 ${activity.type === 'REGISTER' ? 'bg-green-100 text-agri-green' : 'bg-blue-100 text-blue-600'}`}>
                   {activity.type === 'REGISTER' ? <PlusCircle className="w-5 h-5" /> : <ArrowRightLeft className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex flex-wrap items-center justify-between mb-1 gap-2">
                      <h4 className="font-bold text-gray-900">{activity.type === 'REGISTER' ? 'Batch Logged' : 'Custody Transfer'}</h4>
                      <span className="text-xs text-gray-800 font-mono">{new Date(activity.timestamp * 1000).toLocaleString('en-IN')}</span>
                   </div>
                   <p className="text-sm text-black mb-2">{activity.description}</p>
                   {activity.amount && (
                      <p className="text-sm font-semibold text-agri-green">Asset Value Flow: ₹{activity.amount}</p>
                   )}
                   <div className="text-xs text-gray-700 font-mono mt-2 bg-gray-50 p-2 rounded truncate">
                      Chain Ref: {activity.batchId}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
