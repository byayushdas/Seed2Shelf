import Head from "next/head";
import { useRouter } from "next/router";
import { Leaf, Activity, ShieldCheck, Store, Wallet } from 'lucide-react';
import { Card } from "@/components/Card";

export default function Login() {
  const router = useRouter();

  const handleRoleSelect = (path: string) => {
    // In a real app we'd trigger wallet connect here, then route
    router.push(path);
  };

  const roles = [
    {
      id: 'farmer',
      title: 'Farmer',
      path: '/farmer',
      icon: <Leaf className="w-8 h-8 text-agri-green" />,
      description: 'Log new harvest batches and track fair pricing'
    },
    {
      id: 'processor',
      title: 'Processor',
      path: '/processor',
      icon: <Activity className="w-8 h-8 text-agri-green" />,
      description: 'Grade quality and verify batch weights'
    },
    {
      id: 'distributor',
      title: 'Distributor',
      path: '/distributor',
      icon: <ShieldCheck className="w-8 h-8 text-agri-green" />,
      description: 'Manage logistics and confirm handoffs'
    },
    {
      id: 'retailer',
      title: 'Retailer',
      path: '/retailer',
      icon: <Store className="w-8 h-8 text-agri-green" />,
      description: 'Set shelf prices and generate Consumer QR codes'
    }
  ];

  return (
    <>
      <Head>
        <title>Connect | Seed2Shelf</title>
      </Head>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-agri-green-900 mb-4">Connect to the Network</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select your role in the Seed2Shelf supply chain to connect your wallet and access your dashboard. All actions are securely recorded on-chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
             <button
               key={role.id}
               onClick={() => handleRoleSelect(role.path)}
               className="text-left w-full transition-transform hover:-translate-y-1 focus:outline-none"
             >
               <Card className="h-full border-2 border-transparent hover:border-agri-green hover:shadow-xl transition-all group">
                 <div className="flex items-start gap-4">
                   <div className="p-3 bg-agri-green-100 rounded-xl group-hover:bg-agri-green group-hover:text-white transition-colors">
                     {role.icon}
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                       {role.title}
                       <Wallet className="w-4 h-4 text-gray-300 group-hover:text-agri-gold transition-colors" />
                     </h3>
                     <p className="text-gray-600 text-sm">
                       {role.description}
                     </p>
                   </div>
                 </div>
               </Card>
             </button>
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 bg-gray-50 inline-block px-6 py-3 rounded-full border border-gray-200">
               <span className="font-semibold text-agri-green">Demo Mode:</span> Clicking a role simulates a successful Web3 Wallet connection.
            </p>
        </div>
      </div>
    </>
  );
}
