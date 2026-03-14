import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-agri-green-100/30 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow flex flex-col pt-8 pb-16">
        {children}
      </main>
      <footer className="bg-agri-green-900 text-white py-6 border-t border-agri-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <p className="text-sm text-gray-300">© 2026 Seed2Shelf. Transparent Agriculture.</p>
          <div className="text-xs text-agri-gold">Powered by Ethereum Sepolia</div>
        </div>
      </footer>
    </div>
  );
}
