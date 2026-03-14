import Link from 'next/link';
import { Sprout } from 'lucide-react';
import { useRouter } from 'next/router';
import { useChain } from '@/hooks/useChain';

export default function Navbar() {
  const router = useRouter();
  const { account, connectWallet } = useChain();

  // Simple active link styling helper
  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className="bg-agri-green-900/80 backdrop-blur-md border-b border-agri-green-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <Sprout className="h-8 w-8 text-agri-gold transition-transform group-hover:scale-110" />
              <span className="text-white font-bold text-xl tracking-tight">Seed<span className="text-agri-gold">2</span>Shelf</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link 
                href="/farmer" 
                className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${isActive('/farmer') ? 'text-agri-gold border-b-2 border-agri-gold' : 'text-gray-300 hover:text-white'}`}
              >
                Farmer
              </Link>
              <Link 
                href="/processor" 
                className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${isActive('/processor') ? 'text-agri-gold border-b-2 border-agri-gold' : 'text-gray-300 hover:text-white'}`}
              >
                Processor
              </Link>
              <Link 
                href="/distributor" 
                className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${isActive('/distributor') ? 'text-agri-gold border-b-2 border-agri-gold' : 'text-gray-300 hover:text-white'}`}
              >
                Distributor
              </Link>
              <Link 
                href="/retailer" 
                className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${isActive('/retailer') ? 'text-agri-gold border-b-2 border-agri-gold' : 'text-gray-300 hover:text-white'}`}
              >
                Retailer
              </Link>
            </div>
          </div>
          <div className="flex items-center">
             {account ? (
                <div className="ml-4 px-4 py-2 bg-agri-gold text-agri-green-900 rounded-md text-sm font-medium border border-agri-gold shadow-md">
                   {account.slice(0, 6)}...{account.slice(-4)}
                </div>
             ) : (
                <button 
                  onClick={connectWallet}
                  className="ml-4 px-4 py-2 border border-agri-gold text-agri-gold rounded-md text-sm font-medium hover:bg-agri-gold hover:text-agri-green-900 transition-colors cursor-pointer"
                >
                  Connect Wallet
                </button>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
}
