import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Users, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to ClarityQ",
      subtitle: "The Future of Academic Support",
      description: "A centralized platform connecting students and faculty. Say goodbye to delayed responses and scattered communication.",
      color: "from-brand-500 to-indigo-600",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
    },
    {
      title: "AI-Powered Assistance",
      subtitle: "24/7 Academic Support",
      description: "Our integrated AI assistant provides instant answers to basic queries, ensuring you never have to wait to keep learning.",
      color: "from-indigo-500 to-purple-600",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Continuous Learning",
      subtitle: "Knowledge Base at Your Fingertips",
      description: "Explore previously answered questions. Our structured repository acts as a live academic blog for continuous discovery.",
      color: "from-purple-500 to-pink-600",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full h-[calc(100vh-6rem)] min-h-[600px] flex flex-col gap-8 pb-8">
      {/* Hero Slider */}
      <div className="relative w-full h-[60%] rounded-3xl overflow-hidden shadow-2xl glass-panel group">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-10000 hover:scale-105"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8 text-white">
              <span className="text-sm font-semibold tracking-wider uppercase mb-3 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                {slide.subtitle}
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="max-w-2xl text-lg md:text-xl font-medium text-slate-100 mb-8 drop-shadow-md">
                {slide.description}
              </p>
              <Link 
                to="/register" 
                className={`bg-gradient-to-r ${slide.color} text-white px-8 py-3.5 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2`}
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ))}
        
        {/* Slider dots */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-3 rounded-full transition-all duration-300 ${
                idx === activeSlide ? 'w-8 bg-white' : 'w-3 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features section mimicking a blog highlights */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <FeatureCard 
          icon={<Bot className="w-8 h-8 text-indigo-500" />}
          title="Instant AI Answers"
          description="Get immediate responses to basic queries before consulting faculty, powered by advanced AI."
        />
        <FeatureCard 
          icon={<Users className="w-8 h-8 text-brand-500" />}
          title="Direct Faculty Access"
          description="Escalate complex doubts directly to your professors and receive structured, detailed explanations."
        />
        <FeatureCard 
          icon={<BookOpen className="w-8 h-8 text-purple-500" />}
          title="Knowledge Repository"
          description="Browse past doubts and solutions in our community-driven academic blog system."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass-panel p-8 flex flex-col items-start gap-4 hover:-translate-y-1 hover:shadow-2xl transition-all cursor-pointer group">
      <div className="p-4 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
      <div className="mt-auto pt-4 flex items-center text-brand-600 font-semibold group-hover:gap-2 transition-all">
        Learn more <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
}
