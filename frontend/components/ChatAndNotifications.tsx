import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ChatAndNotifications() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserId, setOtherUserId] = useState(""); // For MVP, we'll imagine a dropdown or input to select recipient

  // Fetch messages every 10 seconds for real-time feel MVP
  useEffect(() => {
    if (!session?.user?.id || !otherUserId || !isOpen) return;
    
    const fetchMsgs = async () => {
      const res = await fetch(`/api/messages?userId=${session.user.id}&otherUserId=${otherUserId}`);
      const data = await res.json();
      setMessages(data);
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 10000);
    return () => clearInterval(interval);
  }, [session, otherUserId, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId) return;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: session?.user?.id, receiverId: otherUserId, content: newMessage })
    });

    setNewMessage("");
    // Re-fetch immediately
    const res = await fetch(`/api/messages?userId=${session?.user?.id}&otherUserId=${otherUserId}`);
    setMessages(await res.json());
  };

  if (!session?.user || session.user.role === "CUSTOMER") return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 transition-transform hover:scale-105"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-stone-200 flex flex-col h-[500px]">
          <div className="bg-green-700 text-white p-4 font-bold flex justify-between items-center">
            <span>Messages & Notifications</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-stone-200 text-xl font-normal">&times;</button>
          </div>
          
          <div className="p-3 border-b border-stone-100 bg-stone-50">
            <input 
              type="text" 
              placeholder="Paste Recipient ID..." 
              value={otherUserId}
              onChange={(e) => setOtherUserId(e.target.value)}
              className="w-full text-sm border-stone-300 rounded-lg px-3 py-2 border focus:outline-green-500"
            />
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-stone-50">
            {!otherUserId ? (
              <p className="text-center text-sm text-stone-400 mt-10">Enter a user ID above to start chatting.</p>
            ) : messages.length === 0 ? (
               <p className="text-center text-sm text-stone-400 mt-10">No messages yet.</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === session.user.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${msg.senderId === session.user.id ? "bg-green-600 text-white rounded-br-none" : "bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-sm"}`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-stone-100 flex gap-2">
            <input 
              type="text" 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-grow text-sm border-stone-300 rounded-lg px-3 py-2 border focus:outline-green-500"
            />
            <button type="submit" disabled={!otherUserId || !newMessage.trim()} className="bg-green-600 disabled:bg-stone-300 text-white px-4 py-2 rounded-lg text-sm font-bold">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
