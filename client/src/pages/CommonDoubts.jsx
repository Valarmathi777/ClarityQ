import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, CheckCircle, Flame } from 'lucide-react';

export default function CommonDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/doubts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // Mock common doubts by filtering resolved ones and slicing top ones
        const resolvedDoubts = res.data.filter(d => d.status === 'resolved');
        setDoubts(resolvedDoubts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoubts();
  }, []);

  return (
    <div className="animate-fade-in pb-12">
      <div className="mb-8 flex items-center gap-3">
        <Flame className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Common Doubts</h1>
          <p className="text-slate-500 mt-1">Frequently asked and resolved queries for quick reference.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doubts.map(doubt => (
            <Link to={`/doubts/${doubt.id}`} key={doubt.id} className="block group">
              <div className="glass-panel p-6 h-full border border-slate-100 hover:border-orange-200 transition-all hover:shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {doubt.subject}
                  </h3>
                  <span className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Resolved
                  </span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4">
                  {doubt.description}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                  <span>Asked by {doubt.student_name}</span>
                  <span className="text-orange-600 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Solution <MessageCircle className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {doubts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 glass-panel">
              No common doubts available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
