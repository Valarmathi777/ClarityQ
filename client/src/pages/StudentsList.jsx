import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Mail } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function StudentsList() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  if (user?.role !== 'faculty') {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/students', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="animate-fade-in pb-12">
      <div className="mb-8 flex items-center gap-3">
        <Users className="w-8 h-8 text-brand-500" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Students Directory</h1>
          <p className="text-slate-500 mt-1">View all enrolled students on the platform.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
            <div key={student.id} className="glass-panel p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xl">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-lg font-bold text-slate-800 truncate">{student.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{student.email}</span>
                </div>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 glass-panel">
              No students found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
