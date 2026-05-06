import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Bot, User, CheckCircle, Clock } from 'lucide-react';

export default function DoubtDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDoubt = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/doubts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDoubt(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubt();
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/doubts/${id}/responses`, {
        content: reply,
        is_ai: false
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReply('');
      fetchDoubt();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskAI = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/ai/ask`, {
        question: doubt.description
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Save AI response to DB
      await axios.post(`http://localhost:5000/api/doubts/${id}/responses`, {
        content: res.data.answer,
        is_ai: true
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchDoubt();
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await axios.put(`http://localhost:5000/api/doubts/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchDoubt(); // Refresh to show new status
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!doubt) return <div className="text-center py-12">Doubt not found.</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="glass-panel p-8 mb-8 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${doubt.status === 'resolved' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{doubt.subject}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {doubt.student_name}
              </span>
              <span>•</span>
              <span>{new Date(doubt.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          {user.role === 'faculty' ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">Status:</span>
              <select 
                className={`outline-none font-semibold px-3 py-1.5 rounded-full text-sm cursor-pointer border ${doubt.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                value={doubt.status}
                onChange={handleStatusChange}
              >
                <option value="open">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          ) : (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold capitalize
              ${doubt.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {doubt.status === 'resolved' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {doubt.status === 'open' ? 'Pending' : doubt.status}
            </span>
          )}
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">{doubt.description}</p>
        </div>

        {user.role === 'student' && doubt.responses.length === 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
             <button 
                onClick={handleAskAI}
                disabled={aiLoading}
                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Bot className="w-5 h-5" />
                {aiLoading ? 'AI is thinking...' : 'Ask AI Assistant'}
              </button>
          </div>
        )}
      </div>

      <div className="space-y-6 mb-8">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Responses <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-sm">{doubt.responses.length}</span>
        </h3>

        {doubt.responses.map(res => (
          <div key={res.id} className={`p-6 rounded-2xl ${res.is_ai ? 'bg-indigo-50/50 border border-indigo-100' : 'glass-panel border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                ${res.is_ai ? 'bg-indigo-500' : res.user_role === 'faculty' ? 'bg-brand-500' : 'bg-slate-400'}`}>
                {res.is_ai ? <Bot className="w-5 h-5" /> : res.user_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                  {res.is_ai ? 'ClarityQ AI' : res.user_name}
                  {res.user_role === 'faculty' && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Faculty</span>}
                  {res.is_ai && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold">AI Bot</span>}
                </div>
                <div className="text-xs text-slate-500">{new Date(res.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="pl-13 text-slate-700 whitespace-pre-wrap leading-relaxed ml-13">
              {res.content}
            </div>
          </div>
        ))}
        {doubt.responses.length === 0 && (
          <div className="text-center py-8 text-slate-500 italic bg-slate-50 rounded-2xl border border-slate-100">
            No responses yet.
          </div>
        )}
      </div>

      {/* Reply Form */}
      <div className="glass-panel p-6">
        <form onSubmit={handleReply}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {user.role === 'faculty' ? 'Provide an Academic Response' : 'Add a Comment / Follow-up'}
          </label>
          <div className="relative">
            <textarea 
              rows="4"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all resize-none pr-16"
              placeholder="Type your response here..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            ></textarea>
            <button 
              type="submit"
              className="absolute bottom-3 right-3 bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
