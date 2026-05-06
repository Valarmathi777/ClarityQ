import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, User } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function AiAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your ClarityQ AI Assistant. How can I help you with your academic queries today?", isAi: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Faculty should not access this
  if (user?.role === 'faculty') {
    return <Navigate to="/dashboard" />;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, isAi: false }]);
    setInput('');
    setLoading(true);

    try {
      // Reusing the AI ask endpoint
      const res = await axios.post('http://localhost:5000/api/ai/ask', {
        question: userMsg
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setMessages(prev => [...prev, { id: Date.now() + 1, text: res.data.answer, isAi: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I am having trouble connecting to the server.", isAi: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-10rem)]">
      <div className="mb-6 flex items-center gap-3">
        <Bot className="w-8 h-8 text-indigo-500" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Assistant</h1>
          <p className="text-slate-500 mt-1">Instant answers and academic support, 24/7.</p>
        </div>
      </div>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white
                ${msg.isAi ? 'bg-indigo-500' : 'bg-brand-500'}`}>
                {msg.isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl ${msg.isAi ? 'bg-indigo-50/80 border border-indigo-100 text-slate-700' : 'bg-brand-600 text-white shadow-md'}`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[80%] mr-auto">
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-indigo-500 text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              className="w-full pl-4 pr-14 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
