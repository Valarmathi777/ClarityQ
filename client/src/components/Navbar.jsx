import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User as UserIcon, BookOpen, Layers, Bot, Users } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'}`}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden md:inline">{children}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b-0 rounded-none shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="h-6 w-6 text-brand-500 group-hover:text-brand-600 transition-colors" />
            <span className="text-2xl font-bold gradient-text tracking-tight">ClarityQ</span>
          </Link>
          
          <nav className="flex items-center gap-4 md:gap-6">
            {user ? (
              <>
                <NavLink to="/dashboard" icon={Layers}>Dashboard</NavLink>
                <NavLink to="/all-doubts" icon={BookOpen}>All Doubts</NavLink>
                <NavLink to="/common-doubts" icon={Sparkles}>Common</NavLink>
                
                {user.role === 'student' && (
                  <NavLink to="/ai-assistant" icon={Bot}>AI Assistant</NavLink>
                )}
                {user.role === 'faculty' && (
                  <NavLink to="/students" icon={Users}>Students</NavLink>
                )}

                <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 py-1.5 px-3 rounded-full">
                  <UserIcon className="w-4 h-4 text-brand-500" />
                  <span className="capitalize hidden sm:inline">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-full hover:bg-brand-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
