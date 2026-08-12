import { ReactNode } from "react";
import Navbar from "@/components/common/Navbar/Navbar";
import ChatAndNotifications from "@/components/shared/Chat/ChatAndNotifications";


interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div 
      className="min-h-screen flex flex-col pt-16 text-white selection:bg-purple-500 selection:text-white relative bg-black"
    >
      <Navbar />
      <main className="flex-grow relative z-10">{children}</main>
      <ChatAndNotifications />
    </div>
  );
}
