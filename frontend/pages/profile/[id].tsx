import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";

export default function StakeholderProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        setUser(await res.json());
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (!id || !session?.user?.id) return;
    const fetchMessages = async () => {
      const res = await fetch(`/api/messages?userId=${session.user.id}&otherUserId=${id}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    };
    fetchMessages();
    // In a real app we'd use WebSockets for real-time, for now simple polling could be added, but manual is fine for MVP.
  }, [id, session?.user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id || !id) return;

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: session.user.id,
        receiverId: id as string,
        content: newMessage
      })
    });

    if (res.ok) {
      const msg = await res.json();
      setMessages([...messages, msg]);
      setNewMessage("");
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Profile...</div>;
  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-white">User not found</div>;

  const isOwnProfile = session?.user?.id === id;

  return (
    <div className="min-h-screen relative text-white pt-10">
      <Head>
        <title>{user.name}'s Profile | Seed2Shelf</title>
      </Head>
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/1031700/pexels-photo-1031700.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
          className="w-full h-full object-cover opacity-30"
          alt=""
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="matte-glass p-10 rounded-3xl border border-white/10 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-4xl shadow-xl border-4 border-white/10">
              {user.role?.[0]}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-xl text-green-400 font-medium mb-4">{user.role}</p>
              
              {user.averageRating ? (
                <div className="flex items-center gap-1 justify-center md:justify-start">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={`text-2xl ${s <= Math.round(user.averageRating) ? 'text-yellow-400' : 'text-stone-600'}`}>★</span>
                  ))}
                  <span className="text-stone-400 ml-2">({Number(user.averageRating).toFixed(1)}/5 Rating)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 justify-center md:justify-start text-stone-400 text-sm">
                  <p>No ratings yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h3 className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-2">Wallet Address</h3>
              <p className="font-mono text-sm text-blue-400 break-all">{user.walletAddress || "Not Linked"}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h3 className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-2">Member Since</h3>
              <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        {!isOwnProfile && session?.user && (
          <div className="matte-glass p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[500px]">
            <h2 className="text-2xl font-bold mb-6 text-green-300">Direct Messages</h2>
            
            <div className="flex-grow overflow-y-auto pr-4 mb-6 custom-scrollbar space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-stone-400 mt-10 italic">No messages yet. Say hello!</p>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === session.user.id;
                  return (
                    <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl ${isMine ? 'bg-green-600/80 rounded-br-none text-white' : 'bg-white/10 rounded-bl-none text-stone-100'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-[10px] opacity-60 mt-2 block">{new Date(msg.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-4">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message to negotiate or ask questions..."
                className="flex-grow bg-white/5 border border-white/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-green-500 transition"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl transition shadow-lg"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
