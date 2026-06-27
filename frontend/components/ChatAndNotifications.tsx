import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ChatAndNotifications() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [activeChatUserName, setActiveChatUserName] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch conversations (Inbox)
  useEffect(() => {
    if (!session?.user?.id || !isOpen || activeChatUserId) return;
    
    const fetchInbox = async () => {
      const res = await fetch(`/api/messages/inbox?userId=${session.user.id}`);
      if (res.ok) {
        setConversations(await res.json());
      }
    };
    fetchInbox();
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [session?.user?.id, isOpen, activeChatUserId]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!session?.user?.id || !activeChatUserId || !isOpen) return;
    
    const fetchMsgs = async () => {
      const res = await fetch(`/api/messages?userId=${session.user.id}&otherUserId=${activeChatUserId}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 5000);
    return () => clearInterval(interval);
  }, [session?.user?.id, activeChatUserId, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUserId) return;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: session?.user?.id, receiverId: activeChatUserId, content: newMessage })
    });

    setNewMessage("");
    // Re-fetch immediately
    const res = await fetch(`/api/messages?userId=${session?.user?.id}&otherUserId=${activeChatUserId}`);
    setMessages(await res.json());
  };

  if (!session?.user || session.user.role === "CUSTOMER") return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 transition-transform hover:scale-105 border-2 border-white/20"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-stone-200 flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-green-700 text-white p-4 font-bold flex justify-between items-center">
            {activeChatUserId ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveChatUserId(null)} className="text-xl hover:text-green-300">←</button>
                <span>{activeChatUserName}</span>
              </div>
            ) : (
              <span>Messages</span>
            )}
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-stone-200 text-xl font-normal">&times;</button>
          </div>
          
          {/* Body */}
          {!activeChatUserId ? (
            // INBOX VIEW
            <div className="flex-grow overflow-y-auto bg-stone-50">
              {conversations.length === 0 ? (
                 <p className="text-center text-sm text-stone-400 mt-10 p-4">No conversations yet. Go to a user's profile to send them a message.</p>
              ) : (
                conversations.map(conv => (
                  <div 
                    key={conv.id} 
                    onClick={() => { setActiveChatUserId(conv.id); setActiveChatUserName(conv.name); }}
                    className="p-4 border-b border-stone-200 hover:bg-stone-100 cursor-pointer transition flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-stone-800">{conv.name}</span>
                      <span className="text-[10px] text-stone-400">{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="text-sm text-stone-500 truncate">{conv.lastMessage}</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            // CHAT VIEW
            <>
              <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-stone-50">
                {messages.length === 0 ? (
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
                  className="flex-grow text-sm border-stone-300 rounded-lg px-3 py-2 border focus:outline-green-500 text-black"
                />
                <button type="submit" disabled={!newMessage.trim()} className="bg-green-600 disabled:bg-stone-300 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
