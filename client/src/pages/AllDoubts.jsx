import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MessageCircle, Clock, CheckCircle, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AllDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const { user } = useAuth();

  const fetchDoubts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/doubts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDoubts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const getStatusIcon = (status) => {
    if (status === 'resolved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  // Get unique subjects for filter
  const subjects = ['All', ...new Set(doubts.map(d => d.subject))];

  const filteredDoubts = doubts.filter(d => {
    if (subjectFilter !== 'All' && d.subject !== subjectFilter) return false;
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">All Doubts Repository</h1>
        <p className="text-slate-500 mt-1">Explore all academic queries from across the platform.</p>
      </div>

      <div className="glass-panel p-4 mb-8 flex flex-col sm:flex-row gap-4">
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
        <div className="flex-1 flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <CheckCircle className="w-5 h-5 text-slate-400" />
          <select 
            className="bg-transparent w-full outline-none text-slate-700 text-sm font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="open">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
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
                    {doubt.status === 'open' ? 'Pending' : doubt.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {doubt.subject}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4">
                  {doubt.description}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">{doubt.student_name}</span>
                  <span className="text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View <MessageCircle className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {filteredDoubts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 glass-panel">
              No doubts found matching the criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
