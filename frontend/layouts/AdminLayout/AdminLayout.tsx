import { ReactNode } from "react";
import Navbar from "@/components/common/Navbar/Navbar";
import ChatAndNotifications from "@/components/shared/Chat/ChatAndNotifications";
import bgImage from "@/assets/images/bg.png";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div 
      className="min-h-screen flex flex-col pt-16 text-white selection:bg-purple-500 selection:text-white relative bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    >
      <Navbar />
      <main className="flex-grow relative z-10">{children}</main>
      <ChatAndNotifications />
    </div>
  );
}
