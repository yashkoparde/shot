import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertOctagon, 
  RefreshCw, 
  Star, 
  Ban, 
  UserCheck, 
  ShieldAlert, 
  Sparkles, 
  Eye,
  Settings,
  Activity,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { User, Post } from '../types.ts';

interface AdminProps {
  adminUser: User;
  onLogout: () => void;
  posts: Post[];
  fetchPosts: () => Promise<void>;
}

interface AdminMetrics {
  totalUsers: number;
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  rejectedPosts: number;
}

export default function Admin({ adminUser, onLogout, posts, fetchPosts }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'Queue' | 'Students' | 'Featured'>('Queue');
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 0,
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    rejectedPosts: 0
  });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [studentAccounts, setStudentAccounts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Active interaction states
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [aiAudits, setAiAudits] = useState<Record<string, { opinion: string; loading: boolean }>>({});
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [moderationLoading, setModerationLoading] = useState<string | null>(null);

  const fetchAdminMetricsAndUsers = async () => {
    try {
      setLoading(true);
      const mRes = await fetch('/api/admin/metrics');
      const mData = await mRes.json();
      if (mRes.ok) {
        setMetrics(mData.metrics);
        setCategoryCounts(mData.categoryDistribution || {});
      }

      const uRes = await fetch('/api/admin/users');
      const uData = await uRes.json();
      if (uRes.ok) {
        setStudentAccounts(uData.users);
      }
    } catch (e) {
      console.error("Failed to sync central administrator ledger:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminMetricsAndUsers();
  }, [posts]);

  const handleModerate = async (postId: string, status: 'approved' | 'rejected') => {
    const reason = rejectionReason[postId] || "";
    if (status === 'rejected' && !reason.trim()) {
      alert("Please specify a corrective feedback reason before rejection.");
      return;
    }

    setModerationLoading(postId);
    try {
      const res = await fetch(`/api/admin/moderate/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) {
        setRejectionReason(prev => {
          const c = { ...prev };
          delete c[postId];
          return c;
        });
        await fetchPosts();
        await fetchAdminMetricsAndUsers();
      }
    } catch (error) {
      console.error("Failed to commit moderation action:", error);
    } finally {
      setModerationLoading(null);
    }
  };

  const handleAiAudit = async (postId: string) => {
    setAiAudits(prev => ({
      ...prev,
      [postId]: { opinion: "", loading: true }
    }));

    try {
      const res = await fetch(`/api/admin/ai-audit/${postId}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      setAiAudits(prev => ({
        ...prev,
        [postId]: { opinion: data.audit || "AI verification loaded.", loading: false }
      }));
    } catch (e) {
      setAiAudits(prev => ({
        ...prev,
        [postId]: { opinion: "Failed to generate AI appraisal.", loading: false }
      }));
    }
  };

  const toggleFeature = async (postId: string, isCurrentlyFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/feature/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isCurrentlyFeatured })
      });
      if (res.ok) {
        await fetchPosts();
      }
    } catch (error) {
      console.error("Failed to change Hall of Fame status:", error);
    }
  };

  const handleUserStatusToggle = async (usn: string, currentStatus: 'active' | 'suspended') => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn, status: nextStatus })
      });
      if (res.ok) {
        await fetchAdminMetricsAndUsers();
      }
    } catch (error) {
      console.error("Suspension switch failure:", error);
    }
  };

  const handleUserVerificationToggle = async (usn: string, currentVerification: boolean) => {
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn, isVerified: !currentVerification })
      });
      if (res.ok) {
        await fetchAdminMetricsAndUsers();
      }
    } catch (error) {
      console.error("University verification trigger error:", error);
    }
  };

  const pendingQueue = posts.filter(p => p.status === 'pending');
  const hallOfFamePool = posts.filter(p => p.status === 'approved');

  const filteredStudents = studentAccounts.filter(s => 
    s.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) || 
    s.usn.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchStudentQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#FAFAF8] font-sans flex flex-col pb-16 select-none relative selection:bg-brand-lavender selection:text-black">
      
      {/* Editorial glowing accents */}
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-brand-lavender/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-brand-cyan/5 rounded-full blur-[110px] pointer-events-none" />

      {/* ADMIN STAGE NAVIGATION */}
      <nav className="w-full bg-[#0B0B0D]/85 border-b border-white/5 backdrop-blur-2xl sticky top-0 z-30 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 pl-1">
            <span className="text-2xl font-display font-black tracking-[0.2em] text-[#FAFAF8] drop-shadow-[0_0_15px_rgba(239,68,68,0.75)]">
              SH<span className="text-red-600">O</span>T
            </span>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] bg-brand-lavender/10 text-brand-lavender px-2.5 py-1 rounded border border-brand-lavender/25 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 animate-pulse text-brand-lavender" /> DEAN CONTROL CENTER
            </span>
          </div>

          <div className="flex items-center gap-4 animate-fade-in">
            <button
              type="button"
              onClick={onLogout}
              className="text-[10px] text-white/50 hover:text-brand-pink border border-white/5 hover:border-brand-pink/25 px-4 py-2.5 rounded-xl font-mono tracking-widest uppercase transition-all cursor-pointer flex items-center gap-1.5 hover:bg-brand-pink/5"
            >
              EXIT PORTAL
            </button>
          </div>
        </div>
      </nav>

      {/* CORE FRAMEWORK STAGE */}
      <div className="w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10 flex-grow">
        
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {[
            { label: 'Total Users', value: metrics.totalUsers, icon: Users, color: 'text-brand-cyan' },
            { label: 'Total Posts', value: metrics.totalPosts, icon: ImageIcon, color: 'text-brand-lavender' },
            { label: 'Pending Review', value: metrics.pendingPosts, icon: RefreshCw, color: 'text-brand-pink', glow: metrics.pendingPosts > 0 },
            { label: 'Approved', value: metrics.approvedPosts, icon: CheckCircle, color: 'text-brand-lime' },
            { label: 'Rejected', value: metrics.rejectedPosts, icon: AlertOctagon, color: 'text-red-400' },
          ].map((stat) => (
            <div 
              key={stat.label}
              className={`p-4 md:p-5 rounded-2xl bg-[#111318] border border-white/5 backdrop-blur-xl flex flex-col text-left gap-1.5 transition-all ${
                stat.glow ? 'ring-1 ring-brand-pink/35 border-brand-pink/35 bg-brand-pink/[0.01]' : ''
              }`}
            >
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[8px] uppercase tracking-wider font-mono font-bold leading-tight">{stat.label}</span>
                <stat.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 ${stat.color}`} />
              </div>
              <span className="text-xl md:text-2xl font-black font-mono text-white mt-1">
                {stat.value.toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        {/* COMPREHENSIVE REGISTRY SELECTION TABS */}
        <div className="flex border-b border-white/5 pb-0.5 justify-start gap-1">
          {[
            { value: 'Queue', label: 'EVALUATION QUEUE', icon: RefreshCw, count: pendingQueue.length },
            { value: 'Students', label: 'STUDENT REGISTRY', icon: Users, count: studentAccounts.length },
            { value: 'Featured', label: 'THE CROWD DISSECTION', icon: Star, count: posts.filter(p => p.isFeatured).length },
          ].map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value as any)}
              className={`px-6 py-4.5 text-[10px] uppercase tracking-[0.2em] font-mono border-b-2 font-black cursor-pointer transition-all ${
                activeTab === tab.value 
                  ? 'border-brand-lavender text-white bg-[#111318]/40' 
                  : 'border-transparent text-white/40 hover:text-white/80'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* RENDER ACTIVE SCREEN CONTROLLER */}
        {loading ? (
          <div className="text-center py-20 text-white/30 font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 bg-brand-lavender rounded-full animate-ping" />
            Loading Administration Data...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: EVALUATION MODERATION QUEUE */}
            {activeTab === 'Queue' && (
              <motion.div 
                key="Queue" 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6 text-left"
              >
                {pendingQueue.length === 0 ? (
                  <div className="text-center py-16 bg-[#111318]/50 border border-white/5 rounded-3xl text-white/40 flex flex-col items-center justify-center gap-3 max-w-xl mx-auto w-full">
                    <CheckCircle className="w-10 h-10 text-brand-lime" />
                    <span className="text-[10px] uppercase tracking-widest font-mono">EVALUATION QUEUE STABILIZED</span>
                    <p className="text-xs text-[#FAFAF8]/35 max-w-md font-light leading-relaxed">High-fidelity moderation complete! All student submissions have cleared dean review.</p>
                  </div>
                ) : (
                  pendingQueue.map((post) => {
                    const audit = aiAudits[post.id];

                    return (
                      <div 
                        key={post.id}
                        className="p-6 rounded-3xl bg-[#111318] border border-white/5 flex flex-col md:flex-row gap-6 hover:border-white/10 transition-all relative overflow-hidden"
                      >
                        {/* Media display panel preview (Looks like Lookbook frame) */}
                        <div className="md:w-1/3 aspect-video md:aspect-auto md:h-52 rounded-2xl overflow-hidden bg-black/40 flex-shrink-0 relative border border-white/5">
                          {post.mediaType === 'image' ? (
                            <img src={post.mediaUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <video src={post.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                          )}
                          <span className="absolute top-3 left-3 px-2.5 py-1 text-[9px] bg-brand-lavender text-black font-bold rounded font-mono tracking-widest uppercase">
                            {post.category}
                          </span>
                        </div>

                        {/* Story / Actions section */}
                        <div className="flex-grow flex flex-col justify-between gap-5 text-left">
                          <div className="space-y-4">
                            
                            {/* Publisher student spec card */}
                            <div className="flex items-center gap-2.5">
                              <img src={post.authorPic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10" />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-white">{post.authorName}</span>
                                <span className="text-[9px] font-mono text-white/35 uppercase">@{post.username || post.usn.toLowerCase()} • {post.usn} • {post.authorDept}</span>
                              </div>
                            </div>

                            {/* Caption description */}
                            <p className="text-xs text-white/80 font-light leading-relaxed tracking-wider">
                              {post.caption}
                            </p>
                          </div>

                          {/* AI GEMINI ASSISTANT LOOP */}
                          <div className="flex flex-col gap-2">
                            {audit ? (
                              <div className="p-4 bg-brand-lavender/5 border border-brand-lavender/25 rounded-2xl text-[11px] font-mono leading-relaxed">
                                <span className="text-brand-lavender font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 mb-2 border-b border-brand-lavender/10 pb-1 w-full">
                                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> ASSISTANT EDITORIAL APPRAISAL CRITIQUE:
                                </span>
                                {audit.loading ? (
                                  <span className="text-white/30 animate-pulse font-bold">COMPILING DYNAMIC SEMANTIC ANALYTICS...</span>
                                ) : (
                                  <p className="text-white/70 font-light">{audit.opinion}</p>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAiAudit(post.id)}
                                className="self-start text-[9px] font-mono uppercase tracking-[0.25em] text-brand-lavender hover:underline flex items-center gap-1.5 cursor-pointer"
                              >
                                🤖 RUN DEAN AI EVALUATION PROTOCOL
                              </button>
                            )}
                          </div>

                          {/* ACTIONS ACTIONS (REMEDY INPUT / APPROVE TABS) */}
                          <div className="flex flex-col gap-4 border-t border-white/5 pt-5 mt-auto">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                              
                              <input 
                                type="text"
                                placeholder="Specify critical correction reason before issuing reject status..."
                                value={rejectionReason[post.id] || ""}
                                onChange={(e) => setRejectionReason(prev => ({ ...prev, [post.id]: e.target.value }))}
                                className="flex-grow bg-[#0B0B0D] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-pink placeholder:text-white/20 font-mono"
                              />

                              <div className="flex gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleModerate(post.id, 'rejected')}
                                  disabled={moderationLoading === post.id}
                                  className="px-4 py-3 text-[10px] font-mono tracking-widest uppercase font-bold text-brand-pink bg-brand-pink/5 hover:bg-brand-pink/10 border border-brand-pink/20 rounded-xl cursor-pointer disabled:opacity-40"
                                >
                                  REJECT WORK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleModerate(post.id, 'approved')}
                                  disabled={moderationLoading === post.id}
                                  className="px-5 py-3 text-[10px] font-mono tracking-widest uppercase font-black text-black bg-brand-cyan rounded-xl cursor-pointer disabled:opacity-40 transition-transform hover:scale-[1.01]"
                                >
                                  PUBLISH LIVE Feed
                                </button>
                              </div>

                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* VIEW 2: STUDENT MANAGEMENT DIRECTORY */}
            {activeTab === 'Students' && (
              <motion.div 
                key="Students"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4 text-left"
              >
                {/* Search Registry filter */}
                <div className="relative w-full mb-2">
                  <input
                    type="text"
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                    placeholder="Search students directory via name, major branch, or USN keys..."
                    className="w-full bg-[#111318] border border-white/5 rounded-2xl px-5 py-3.5 text-xs text-white focus:outline-none focus:border-brand-lavender placeholder:text-white/20 font-mono tracking-wider"
                  />
                </div>

                <div className="w-full bg-[#111318]/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
                  <div className="grid grid-cols-12 gap-3 px-6 py-5 bg-[#111318] border-b border-white/5 text-[9px] uppercase font-mono tracking-widest text-white/30 font-bold">
                    <div className="col-span-1 text-center">PRIVILEG_BULLET</div>
                    <div className="col-span-4">enclave student accounts</div>
                    <div className="col-span-4">specialization stream</div>
                    <div className="col-span-3 text-right">dean actions logs</div>
                  </div>

                  <div className="divide-y divide-white/5">
                    {filteredStudents.length === 0 ? (
                      <div className="text-center py-12 text-white/30 font-mono text-[10px] tracking-widest uppercase">REGISTRY CARRIER RECORD IS EMPTY</div>
                    ) : (
                      filteredStudents.map(student => (
                        <div key={student.usn} className="grid grid-cols-12 gap-3 px-6 py-4.5 items-center">
                          
                          {/* Status indicator */}
                          <div className="col-span-1 text-center flex justify-center">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                              student.status === 'active' ? 'bg-brand-lime animate-pulse' : 'bg-brand-pink'
                            }`} />
                          </div>

                          {/* Account metadata card */}
                          <div className="col-span-4 flex items-center gap-3">
                            <img src={student.profilePicture || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=200"} className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white flex items-center gap-1">
                                {student.name}
                                {student.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan fill-brand-cyan/20 shrink-0" />}
                              </span>
                              <span className="text-[9px] font-mono text-white/35 uppercase">@{student.username || student.usn.toLowerCase()} • {student.usn}</span>
                            </div>
                          </div>

                          {/* Branch block details */}
                          <div className="col-span-4 text-xs text-white/50 font-light truncate font-mono uppercase tracking-widest text-[10px]">
                            {student.department} ({student.year})
                          </div>

                          {/* Actions columns */}
                          <div className="col-span-3 flex items-center justify-end gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() => handleUserVerificationToggle(student.usn, student.isVerified)}
                              className={`px-3 py-2 text-[9px] font-mono tracking-widest uppercase rounded-xl border cursor-pointer transition-colors ${
                                student.isVerified 
                                  ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/35' 
                                  : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-white'
                              }`}
                              title={student.isVerified ? 'Deprecate verification certificate' : 'Verify student credentials certificate'}
                            >
                              VERIFY TICKS
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUserStatusToggle(student.usn, student.status)}
                              className={`px-3 py-2 text-[9px] font-mono tracking-widest uppercase rounded-xl border cursor-pointer transition-colors ${
                                student.status === 'suspended'
                                  ? 'bg-brand-pink/20 text-brand-pink border-brand-pink/35'
                                  : 'bg-white/[0.01] border-white/5 text-white/40 hover:text-brand-pink'
                              }`}
                              title={student.status === 'suspended' ? 'Authorize accounts' : 'Suspend publishing capabilities'}
                            >
                              {student.status === 'suspended' ? 'SUSPENDED' : 'BAN REELS'}
                            </button>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB VIEW 3: CROWD FEATURED MANAGER */}
            {activeTab === 'Featured' && (
              <motion.div 
                key="Featured"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4 text-left"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {hallOfFamePool.map(post => (
                    <div 
                      key={post.id}
                      className={`p-4 rounded-3xl border transition-all flex flex-col gap-4 relative overflow-hidden ${
                        post.isFeatured 
                          ? 'border-amber-400/25 bg-amber-400/[0.02]' 
                          : 'border-white/5 bg-[#111318]'
                      }`}
                    >
                      {/* Media container display */}
                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/40 relative">
                        {post.mediaType === 'image' ? (
                          <img src={post.mediaUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <video src={post.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        )}
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-[8px] bg-black/85 rounded text-brand-cyan border border-white/5 font-mono uppercase font-semibold">
                          {post.category}
                        </span>
                      </div>

                      {/* Info catalog */}
                      <div className="space-y-1 text-left flex-grow">
                        <span className="text-[11px] font-bold text-white block truncate">{post.authorName} (@{post.username || post.usn.toLowerCase()})</span>
                        <p className="text-[10px] text-white/55 font-light line-clamp-2 leading-relaxed tracking-wider">{post.caption}</p>
                      </div>

                      {/* Action toggle trigger featured */}
                      <button
                        type="button"
                        onClick={() => toggleFeature(post.id, post.isFeatured)}
                        className={`w-full py-3.5 rounded-xl text-[9px] font-mono tracking-widest uppercase border cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                          post.isFeatured
                            ? 'bg-amber-400 text-black border-amber-400 font-extrabold shadow-lg shadow-amber-400/10'
                            : 'bg-white/[0.01] border-white/10 text-white/40 hover:text-white'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${post.isFeatured ? 'fill-current' : ''}`} />
                        {post.isFeatured ? 'FEATURED LIVE' : 'PROMOTE TO HALL OF FAME'}
                      </button>

                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}

      </div>

    </div>
  );
}
