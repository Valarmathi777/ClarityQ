import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, MessageCircle, Clock, CheckCircle, Filter } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ subject: '', description: '' });
  const [subjectFilter, setSubjectFilter] = useState('All');

  const fetchDoubts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/doubts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Dashboard logic:
      // Student: show only their own doubts
      // Faculty: show all OPEN (pending) doubts
      const relevantDoubts = res.data.filter(d => {
        if (user.role === 'student') {
          return d.student_id === user.id;
        } else {
          return d.status === 'open';
        }
      });

      setDoubts(relevantDoubts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, [user]);

  const handleCreateDoubt = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/doubts', newDoubt, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowModal(false);
      setNewDoubt({ subject: '', description: '' });
      fetchDoubts();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'resolved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const subjects = ['All', ...new Set(doubts.map(d => d.subject))];
  const filteredDoubts = doubts.filter(d => subjectFilter === 'All' || d.subject === subjectFilter);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {user.role === 'student' ? 'Manage your posted doubts.' : 'Manage pending student queries.'}
          </p>
        </div>

        {user.role === 'student' && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-brand-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <PlusCircle className="w-5 h-5" />
            Ask a Doubt
          </button>
        )}
      </div>

      {doubts.length > 0 && (
        <div className="glass-panel p-4 mb-8 flex flex-col sm:flex-row gap-4 max-w-sm">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              className="bg-transparent w-full outline-none text-slate-700 text-sm font-medium"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              {subjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoubts.map(doubt => (
          <Link to={`/doubts/${doubt.id}`} key={doubt.id} className="block group">
            <div className="glass-panel p-6 h-full border border-slate-100 hover:border-brand-200 transition-all hover:shadow-lg relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${doubt.status === 'resolved' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {new Date(doubt.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-full capitalize">
                  {getStatusIcon(doubt.status)}
                  {doubt.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                {doubt.subject}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-3 mb-4">
                {doubt.description}
              </p>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">{user.role === 'student' ? 'You' : doubt.student_name}</span>
                <span className="text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View <MessageCircle className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
        {filteredDoubts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 glass-panel">
            {user.role === 'student' ? "You haven't posted any doubts yet." : "No pending queries."}
          </div>
        )}
      </div>

      {/* Modal for posting doubt */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Ask a New Doubt</h2>
            <form onSubmit={handleCreateDoubt} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject / Topic</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Understanding React Hooks"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                  value={newDoubt.subject}
                  onChange={(e) => setNewDoubt({ ...newDoubt, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea 
                  required
                  rows="5"
                  placeholder="Explain your doubt in detail..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all resize-none"
                  value={newDoubt.description}
                  onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Post Doubt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
