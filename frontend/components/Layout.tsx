import { ReactNode } from "react";
import Navbar from "./Navbar";
import ChatAndNotifications from "./ChatAndNotifications";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <ChatAndNotifications />
      <footer className="glass-dark text-white/60 p-6 text-center text-sm border-t-0 border-white/10 mt-12 backdrop-blur-md bg-stone-900/40">
        &copy; {new Date().getFullYear()} Seed2Shelf. All rights reserved. Blockchain verifyable supply chains.
      </footer>
    </div>
  );
}
