import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  Phone, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Lock,
  Compass,
  ArrowRight,
  Award,
  Zap,
  Code,
  Trophy,
  Sparkles
} from 'lucide-react';
import { User, Post } from '../types.ts';

interface LandingProps {
  onLoginSuccess: (user: User) => void;
  onAdminOpen: () => void;
}

export default function Landing({ onLoginSuccess }: LandingProps) {
  const [activeModal, setActiveModal] = useState<'login' | 'register' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Login credentials state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register credentials state
  const [regName, setRegName] = useState('');
  const [regUsn, setRegUsn] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regYear, setRegYear] = useState('1st Year');
  const [regBio, setRegBio] = useState('');
  const [regPass, setRegPass] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync feed posts to show on landing immediately
  useEffect(() => {
    const fetchLandingPosts = async () => {
      try {
        const res = await fetch('/api/feed/posts');
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error("Failed to showcase landing feeds:", err);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchLandingPosts();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: identifier.trim(), 
          password 
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failure");
      }
      
      setSuccessMsg("Welcome back.");
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Credential authentication error.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usn: regUsn.trim(),
          username: regUsername.trim(),
          phone_number: regPhone.trim(),
          name: regName.trim(),
          department: regDept.trim(),
          year: regYear,
          bio: regBio.trim(),
          password: regPass
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration error");
      }

      setSuccessMsg("Onboarded! Please verify with your credentials.");
      setTimeout(() => {
        setIdentifier(regUsername); // Prefill with the newly registered username
        setPassword(regPass);
        setActiveModal('login');
        setErrorMsg('');
        setSuccessMsg('');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit student credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#FAFAF8] flex flex-col justify-between overflow-x-hidden font-sans select-none">
      
      {/* MINIMAL STICKY HEADER */}
      <header className="w-full bg-[#000000]/90 border-b border-white/5 backdrop-blur-2xl sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-display font-black tracking-[0.25em] text-[#FAFAF8] drop-shadow-[0_0_15px_rgba(239,68,68,0.75)] select-none">
              SH<span className="text-red-600">O</span>T
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => {
                setActiveModal('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-[10px] bg-[#FAFAF8] hover:bg-white text-black font-semibold tracking-widest uppercase px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Sign In
            </button>
            <button 
              type="button" 
              onClick={() => {
                setActiveModal('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-[10px] border border-white/10 hover:bg-white/5 text-white/80 font-mono tracking-widest uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Join
            </button>
          </div>
        </div>
      </header>

      {/* CHOSEN SHOWCASE: DIRECT TIMELINE, NO BANNER TEXT */}
      <main className="w-full max-w-7xl mx-auto px-6 py-4 flex-grow">
        
        {postsLoading ? (
          <div className="text-center py-24 text-white/20 font-mono text-[10px] tracking-widest uppercase">
            Loading...
          </div>
        ) : posts.length === 0 ? (
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-10 py-10 px-4">
            {/* Header Section */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white bg-clip-text">
                Welcome to <span className="text-red-500">Conjecture</span>
              </h1>
              <p className="text-sm text-white/60 max-w-lg mx-auto leading-relaxed font-light">
                The premier social showcase platform for college prodigies. Post your best projects, art exhibits, startup concepts, and sport milestones.
              </p>
            </div>

            {/* Premium Categories Empty State Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-[#0B0B0D] border border-white/5 flex flex-col gap-3 justify-between hover:border-red-500/20 transition-all text-left">
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Coding & Space Tech</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-light">
                    Share your GitHub repositories, prototype links, web designs, or smart contract snapshots.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#0B0B0D] border border-white/5 flex flex-col gap-3 justify-between hover:border-red-500/20 transition-all text-left">
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Grand Sports Arena</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-light">
                    Post your tournament highlights, varsity achievements, runner-up photos, and club trophies.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#0B0B0D] border border-white/5 flex flex-col gap-3 justify-between hover:border-red-500/20 transition-all text-left">
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-2">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Art & Media Showcase</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-light">
                    Display your graphic design projects, photography, illustrations, portraits, or music files.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#0B0B0D] border border-white/5 flex flex-col gap-3 justify-between hover:border-red-500/20 transition-all text-left">
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-2">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Startups & Ventures</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-light">
                    Broadcast your pitch decks, minimum viable products, venture concepts, or product mockups.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to action section */}
            <div className="p-8 rounded-[2rem] bg-gradient-to-tr from-red-600/10 to-transparent border border-white/5 text-center space-y-4 shadow-xl">
              <h2 className="text-lg md:text-xl font-bold text-white">Be the first to step into the Spotlight</h2>
              <p className="text-xs text-white/55 max-w-sm mx-auto leading-relaxed font-light">
                Connect with peers across departments, submit your creations to clear Dean evaluation boards, and claim rank positions on the hall of fame.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => {
                    setActiveModal('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                >
                  Create Your Student Profile <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="text-center md:text-left mb-6">
              <h2 className="text-3xl font-display font-bold tracking-tight text-white">
                Explore.
              </h2>
            </div>

            {/* Addictive Social Media feed layout */}
            <div className="flex flex-col gap-8 md:gap-12 pb-12 w-full max-w-lg mx-auto">
              {posts.map((post, index) => {
                const uniqueHashtag = `#${post.category.toLowerCase()}`;

                return (
                  <div
                    key={post.id}
                    onClick={() => setActiveModal('login')}
                    className="w-full relative rounded-[2rem] bg-[#0A0A0C] border border-white/5 flex flex-col group hover:border-red-500/40 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)] transition-all duration-300 shadow-2xl overflow-hidden cursor-pointer selection:bg-red-500/10"
                  >
                    
                    {/* Glowing highlight ribbon for top score posts */}
                    {post.talentScore > 50 && (
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 animate-pulse z-20" />
                    )}

                    {/* Author / Creator Header Row overlaying image */}
                    <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-[#F23A3A] to-[#F59E0B]">
                          <img 
                            src={post.authorPic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                            alt={post.authorName} 
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-black"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col text-left drop-shadow-md">
                          <span className="text-sm font-bold text-white leading-tight flex items-center gap-1.5 object-cover">
                            {post.authorName}
                            {post.isFeatured && (
                              <span className="text-red-500 text-[10px] animate-pulse">●</span>
                            )}
                          </span>
                          <span className="text-xs font-mono text-white/90 drop-shadow-sm font-medium">
                            @{post.username || post.usn.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Highly interactive media body (Full immersive aspect) */}
                    <div className="relative w-full aspect-[4/5] bg-black">
                      {post.mediaType === 'image' ? (
                        <img 
                          src={post.mediaUrl} 
                          alt="Campus Portfolio Exhibit" 
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <video 
                          src={post.mediaUrl} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                        />
                      )}

                      {/* Content overlay */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-5 pt-12 flex flex-col justify-end transition-all">
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-red-600/80 text-white font-mono text-[10px] font-bold rounded-md uppercase tracking-wider backdrop-blur-sm">
                            {post.category}
                          </span>
                        </div>

                        {/* Achievement Story / Caption text */}
                        <p className="text-sm text-white/95 font-medium leading-relaxed tracking-wide line-clamp-3 mb-4 drop-shadow-md">
                          {post.caption}
                        </p>

                        <div className="flex items-center justify-between border-t border-white/10 pt-4">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-white/80 group-hover:text-red-500 transition-colors">
                              <Heart className="w-6 h-6 fill-transparent" />
                              <span className="text-sm font-mono font-bold">{post.likesCount}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                              <MessageSquare className="w-6 h-6" />
                              <span className="text-sm font-mono font-bold">{post.commentsCount}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-red-500">
                            <Zap className="w-5 h-5 text-red-500 fill-current" />
                            <span className="text-sm font-mono tracking-wider font-extrabold">
                              {post.talentScore} <span className="text-red-500/50">PTS</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* CLEAN FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/20 font-mono text-[10px] uppercase">
        <span>SHOT © 2026</span>
      </footer>

      {/* AUTHENTICATION OVERLAYS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0D]/95 backdrop-blur-md">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-[#0A0A0C] border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4 text-left">
                <div>
                  <h2 className="text-lg font-display font-bold text-white uppercase tracking-wider">
                    {activeModal === 'login' ? 'Sign In' : 'Create Account'}
                  </h2>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setActiveModal(null); setErrorMsg(''); setSuccessMsg(''); }}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Status Alert Panels */}
              {errorMsg && (
                <div className="text-[10px] text-brand-pink bg-brand-pink/5 border border-brand-pink/20 px-3 py-2 rounded-xl mb-4 font-mono text-left">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="text-[10px] text-brand-lime bg-brand-lime/5 border border-brand-lime/20 px-3 py-2 rounded-xl mb-4 font-mono text-left">
                  {successMsg}
                </div>
              )}

              {/* LOGIN FORM VIEW */}
              {activeModal === 'login' && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-white/40">Username or USN</label>
                    <input 
                      type="text" 
                      value={identifier} 
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter username" 
                      required
                      className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-white/40">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        required
                        className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm uppercase cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    {loading ? 'Authenticating...' : 'Login'}
                  </button>

                  <div className="text-center mt-4 pt-4 border-t border-white/5">
                    <button 
                      type="button"
                      onClick={() => { setActiveModal('register'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="w-full text-center bg-transparent hover:bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1 items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <span className="text-white font-display font-bold text-lg tracking-wide">
                        Create an account
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {/* REGISTER VIEW */}
              {activeModal === 'register' && (
                <form onSubmit={handleRegister} className="flex flex-col gap-4 text-left max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-white/40">USN</label>
                    <input 
                      type="text" 
                      value={regUsn} 
                      onChange={(e) => setRegUsn(e.target.value)}
                      placeholder="e.g. 1RV22CS004" 
                      required
                      className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 uppercase transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-white/40">Username</label>
                    <input 
                      type="text" 
                      value={regUsername} 
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="username" 
                      required
                      className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-white/40">Full Name</label>
                    <input 
                      type="text" 
                      value={regName} 
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Full name" 
                      required
                      className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-white/40">Phone Number</label>
                    <input 
                      type="tel" 
                      value={regPhone} 
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+919876543210" 
                      required
                      className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-mono text-white/40">Department</label>
                      <input 
                        type="text" 
                        value={regDept} 
                        onChange={(e) => setRegDept(e.target.value)}
                        placeholder="CS, ME..." 
                        required
                        className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-mono text-white/40">Year</label>
                      <select 
                        value={regYear} 
                        onChange={(e) => setRegYear(e.target.value)}
                        className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-white/40">Bio</label>
                    <textarea 
                      value={regBio} 
                      onChange={(e) => setRegBio(e.target.value)}
                      placeholder="Say something nice..." 
                      rows={2}
                      className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-white/40">Password</label>
                    <input 
                      type="password" 
                      value={regPass} 
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="••••••••" 
                      required
                      className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm uppercase cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    {loading ? 'Creating...' : "Create Account"}
                  </button>

                  <div className="text-center mt-2 pt-2 border-t border-white/5">
                    <button 
                      type="button"
                      onClick={() => { setActiveModal('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-white/60 hover:text-white text-sm transition-colors py-2"
                    >
                      Already have an account? Sign In
                    </button>
                  </div>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
