import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DoubtDetail from './pages/DoubtDetail';
import AllDoubts from './pages/AllDoubts';
import CommonDoubts from './pages/CommonDoubts';
import AiAssistant from './pages/AiAssistant';
import StudentsList from './pages/StudentsList';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/doubts/:id" element={<ProtectedRoute><DoubtDetail /></ProtectedRoute>} />
              <Route path="/all-doubts" element={<ProtectedRoute><AllDoubts /></ProtectedRoute>} />
              <Route path="/common-doubts" element={<ProtectedRoute><CommonDoubts /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><StudentsList /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
