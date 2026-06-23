import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Linkedin, 
  Instagram, 
  ShieldCheck, 
  Save, 
  Calendar, 
  GraduationCap, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Globe,
  Settings,
  Grid,
  Sparkles,
  Award,
  ArrowRight
} from 'lucide-react';
import { User, Post } from '../types.ts';

interface ProfileProps {
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
  posts: Post[];
}

interface ProfileStats {
  postsCount: number;
  likesCount: number;
  featuredCount: number;
  overallRank: number;
  overallScore: number;
}

export default function Profile({ user, onProfileUpdate, posts }: ProfileProps) {
  const [personalPosts, setPersonalPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    postsCount: 0,
    likesCount: 0,
    featuredCount: 0,
    overallRank: 0,
    overallScore: 0
  });

  const [activeSegment, setActiveSegment] = useState<'creations' | 'settings'>('creations');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Editorial inputs
  const [editName, setEditName] = useState(user.name);
  const [editDept, setEditDept] = useState(user.department);
  const [editYear, setEditYear] = useState(user.year);
  const [editBio, setEditBio] = useState(user.bio);
  const [editPic, setEditPic] = useState(user.profilePicture);
  const [editCover, setEditCover] = useState(user.coverImage);
  const [github, setGithub] = useState(user.socialLinks.github || '');
  const [linkedin, setLinkedin] = useState(user.socialLinks.linkedin || '');
  const [instagram, setInstagram] = useState(user.socialLinks.instagram || '');
  
  const fetchPersonalStats = async () => {
    try {
      const res = await fetch(`/api/user/${user.usn}`);
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        onProfileUpdate(data.user);
      }
    } catch (e) {
      console.error("Failed to sync personal brand stats:", e);
    }
  };

  useEffect(() => {
    fetchPersonalStats();
  }, [user.usn, posts]);

  useEffect(() => {
    const list = posts.filter(p => p.usn === user.usn);
    setPersonalPosts(list);
  }, [posts, user.usn]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/user/${user.usn}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          department: editDept,
          year: editYear,
          bio: editBio,
          profilePicture: editPic,
          coverImage: editCover,
          socialLinks: { github, linkedin, instagram }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Brand specification cataloged.");
        onProfileUpdate(data.user);
        await fetchPersonalStats();
        setTimeout(() => {
          setActiveSegment('creations');
          setSuccessMsg('');
        }, 1200);
      }
    } catch (error) {
      console.error("Profile sync failure:", error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10 text-left pb-28 relative select-none">
      
      {/* Editorial glowing background filters */}
      <div className="absolute top-[20%] right-0 w-[350px] h-[350px] bg-brand-cyan/4 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-0 w-[300px] h-[300px] bg-brand-[#A78BFA]/4 rounded-full blur-[120px] pointer-events-none" />

      {/* STUNNING HIGH-END PERSONAL BRAND CANVAS COVER */}
      <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden bg-[#111318] border border-white/5 shadow-2xl">
        <img 
          src={user.coverImage || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=85&w=1600"} 
          alt="Personal cover banner specification" 
          className="w-full h-full object-cover brightness-50"
        />
        
        {/* Soft elegant gradient shadow covering lower edge */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B0B0D] to-transparent pointer-events-none" />

        {/* Absolute configuration action elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 z-10">
          <button
            type="button"
            onClick={() => setActiveSegment(activeSegment === 'creations' ? 'settings' : 'creations')}
            className={`px-6 py-3.5 text-xs uppercase font-mono tracking-widest font-bold rounded-xl transition-all border cursor-pointer flex items-center gap-2 ${
              activeSegment === 'settings' 
                ? 'bg-brand-cyan text-black border-brand-cyan shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                : 'bg-black/40 backdrop-blur-md text-white border-white/20 hover:bg-white/20 hover:border-white/40 shadow-xl'
            }`}
          >
            <Settings className="w-5 h-5" />
            {activeSegment === 'settings' ? 'CLOSE SPECIFICATION' : 'CONFIGURE BRAND'}
          </button>
        </div>
      </div>

      {/* BRAND ARCHITECTURE TITLE LINE */}
      <div className="relative -mt-16 md:-mt-20 px-4 md:px-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6 z-10 w-full">
        
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-left">
          <img 
            src={user.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"} 
            alt="Student Brand Portrait" 
            className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover ring-4 ring-[#0B0B0D] bg-neutral-900 shadow-2xl" 
          />
          
          <div className="flex flex-col py-2 gap-1.5 items-center md:items-start max-w-full">
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
              <span className="text-2xl md:text-4xl font-display font-black uppercase text-[#FAFAF8] tracking-tight break-all">
                {user.name}
              </span>
              {user.isVerified && <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-brand-cyan fill-brand-cyan/20 shrink-0" />}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 md:gap-x-3 gap-y-1.5 text-[10px] md:text-xs font-mono text-white/50 w-full px-2 md:px-0">
              <span className="text-brand-cyan uppercase tracking-wider truncate">@{user.username || user.usn.toLowerCase()}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-brand-lavender whitespace-nowrap">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-[120px] md:max-w-none">{user.department}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-4 h-4 text-brand-pink shrink-0" />
                {user.year}
              </span>
            </div>
          </div>
        </div>

        {/* Social Network Access vectors display */}
        <div className="flex items-center gap-4 bg-[#111318]/50 p-3 rounded-2xl border border-white/5 self-center">
          {user.socialLinks.github ? (
            <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-[#0B0B0D] hover:bg-brand-cyan hover:text-black flex items-center justify-center text-white/50 transition-colors">
              <Github className="w-4.5 h-4.5" />
            </a>
          ) : (
            <span className="w-9 h-9 rounded-xl border border-white/5 flex items-center justify-center text-white/10"><Github className="w-4.5 h-4.5" /></span>
          )}
          {user.socialLinks.linkedin ? (
            <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-[#0B0B0D] hover:bg-brand-cyan hover:text-black flex items-center justify-center text-white/50 transition-colors">
              <Linkedin className="w-4.5 h-4.5" />
            </a>
          ) : (
            <span className="w-9 h-9 rounded-xl border border-white/5 flex items-center justify-center text-white/10"><Linkedin className="w-4.5 h-4.5" /></span>
          )}
          {user.socialLinks.instagram ? (
            <a href={user.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-[#0B0B0D] hover:bg-brand-cyan hover:text-black flex items-center justify-center text-white/50 transition-colors">
              <Instagram className="w-4.5 h-4.5" />
            </a>
          ) : (
            <span className="w-9 h-9 rounded-xl border border-white/5 flex items-center justify-center text-white/10"><Instagram className="w-4.5 h-4.5" /></span>
          )}
        </div>
      </div>

      {/* CORE BENTO STATS & ACTIVE SEGMENT VIEWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column info space: Bio / Bento score indicators */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          
          {/* USER BIO CARD */}
          <div className="p-6 rounded-3xl bg-[#111318]/70 border border-white/5 backdrop-blur-xl space-y-3">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#22D3EE] font-bold">BRAND DESCRIPTION STATEMENT</span>
            <p className="text-xs text-white/75 font-light leading-relaxed tracking-wider">
              {user.bio || "This student hasn't documented their core talent description statement on the network yet."}
            </p>
          </div>

          {/* LUXURIOUS INDEX MATRIX (BENTO BOX STYLE STATS) */}
          <div className="p-6 rounded-3xl bg-[#111318]/70 border border-white/5 backdrop-blur-xl space-y-5">
            <span className="text-[9px] uppercase font-mono tracking-widest text-white/30 font-bold block border-b border-white/5 pb-2">SCOREBOARD ARCHIVE ANALYTICS</span>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#0B0B0D] p-3 rounded-2xl border border-white/5 text-center flex flex-col justify-center">
                <span className="text-xl font-black text-[#FAFAF8] font-mono">{stats.postsCount.toString().padStart(2, '0')}</span>
                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest mt-1">Releases</span>
              </div>
              <div className="bg-[#0B0B0D] p-3 rounded-2xl border border-brand-cyan/20 text-center flex flex-col justify-center">
                <span className="text-xl font-black text-brand-cyan font-mono">{stats.overallScore}</span>
                <span className="text-[8px] font-mono text-brand-cyan/60 uppercase tracking-widest mt-1">Points</span>
              </div>
              <div className="bg-[#0B0B0D] p-3 rounded-2xl border border-amber-400/20 text-center flex flex-col justify-center">
                <span className="text-xl font-black text-amber-300 font-mono">#{stats.overallRank}</span>
                <span className="text-[8px] font-mono text-amber-300/50 uppercase tracking-widest mt-1">Ranking</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-white/50 bg-[#0B0B0D] border border-white/5 p-3 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-white/20 text-[8px] tracking-wider font-bold block">SUPPORT_FAITH</span>
                <span className="text-[#FAFAF8] font-bold text-xs">{stats.likesCount} HEARTS</span>
              </div>
              <div className="space-y-0.5 border-l border-white/5 pl-4">
                <span className="text-white/20 text-[8px] tracking-wider font-bold block">HALL_OF_FAME</span>
                <span className="text-amber-400 font-bold text-xs">{stats.featuredCount} SPECIALS</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right column view space: List creations or settings specifications */}
        <div className="col-span-1 lg:col-span-8">
          
          <AnimatePresence mode="wait">
            {activeSegment === 'settings' ? (
              
              /* BRAND CONFIGURATION FORM SPECIFICATION */
              <motion.form 
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onSubmit={handleUpdate}
                className="p-6 rounded-3xl bg-[#111318] border border-white/10 backdrop-blur-xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div>
                    <h3 className="text-sm font-display font-black tracking-widest uppercase text-white/95">BRAND CONFIGURATION CONTROL</h3>
                    <p className="text-[8px] text-white/30 font-mono uppercase tracking-widest mt-0.5">Define portfolio tags, covers and personal handles</p>
                  </div>
                  <button type="button" onClick={() => setActiveSegment('creations')} className="text-white/40 text-xs hover:text-white cursor-pointer select-none">✕</button>
                </div>

                {successMsg && (
                  <div className="p-3 bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs rounded-xl font-mono text-center mb-1">
                    ✓ STATE_SUCCESS_CODE: {successMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] uppercase font-mono text-white/50 tracking-widest">Public Portfolio Name</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      required 
                      className="bg-[#0B0B0D] border border-white/10 text-xs rounded-xl px-3 py-3 text-white focus:outline-none focus:border-brand-cyan" 
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] uppercase font-mono text-white/50 tracking-widest">Major Academic Branch</label>
                    <input 
                      type="text" 
                      value={editDept} 
                      onChange={(e) => setEditDept(e.target.value)} 
                      required 
                      className="bg-[#0B0B0D] border border-white/10 text-xs rounded-xl px-3 py-3 text-white focus:outline-none focus:border-brand-cyan" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9px] uppercase font-mono text-white/50 tracking-widest">Talent Domain Overview</label>
                  <textarea 
                    value={editBio} 
                    onChange={(e) => setEditBio(e.target.value)} 
                    rows={2} 
                    className="bg-[#0B0B0D] border border-white/10 text-xs rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-cyan resize-none font-light leading-relaxed" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] uppercase font-mono text-white/50 tracking-widest">Avatar Picture Source Url</label>
                    <input 
                      type="url" 
                      value={editPic} 
                      onChange={(e) => setEditPic(e.target.value)} 
                      className="bg-[#0B0B0D] border border-white/10 text-xs rounded-xl px-3 py-3 text-white focus:outline-none focus:border-brand-cyan font-mono" 
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] uppercase font-mono text-white/50 tracking-widest">Cover Banner Source Url</label>
                    <input 
                      type="url" 
                      value={editCover} 
                      onChange={(e) => setEditCover(e.target.value)} 
                      className="bg-[#0B0B0D] border border-white/10 text-xs rounded-xl px-3 py-3 text-white focus:outline-none focus:border-brand-cyan font-mono" 
                    />
                  </div>
                </div>

                {/* Social media connections */}
                <div className="grid grid-cols-3 gap-3 text-left">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-mono text-white/40 tracking-widest">GitHub Repository Url</label>
                    <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} className="bg-[#0B0B0D] border border-white/10 text-xs rounded-xl px-3 py-2.5 text-white focus:outline-none font-mono" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-mono text-white/40 tracking-widest">LinkedIn Profile Url</label>
                    <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="bg-[#0B0B0D] border border-white/10 text-xs rounded-xl px-3 py-2.5 text-white focus:outline-none font-mono" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-mono text-[#FAFAF8]/30 tracking-widest">Instagram Link</label>
                    <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="bg-[#0B0B0D] border border-white/10 text-xs rounded-xl px-3 py-2.5 text-white focus:outline-none font-mono" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 mt-2 rounded-xl bg-brand-cyan text-black font-display font-black text-xs tracking-widest uppercase hover:scale-[1.01] transition-transform shadow-lg shadow-brand-cyan/10 cursor-pointer"
                >
                  SYNCHRONIZE PUBLIC SPECIFICATIONS ➔
                </button>
              </motion.form>

            ) : (
              
              /* LIST PERSONAL PORTFOLIO EXHIBITIONS (MOVIE POSTER AESTHETICS) */
              <motion.div 
                key="creations"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-mono tracking-widest font-bold text-brand-cyan uppercase">MY MOVIE POSTER PORTFOLIO ({personalPosts.length})</span>
                  <span className="text-[9px] font-mono text-[#FAFAF8]/30 lowercase">catalog listings</span>
                </div>

                {personalPosts.length === 0 ? (
                  <div className="text-center py-16 bg-[#111318]/40 border border-white/5 rounded-3xl text-white/30 font-mono text-xs max-w-lg mx-auto w-full flex flex-col items-center gap-2">
                    <Award className="w-8 h-8 text-neutral-800 animate-pulse" />
                    <span>NO EXHIBITS LISTED YET</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {personalPosts.map(p => (
                      <div 
                        key={p.id}
                        className="p-4 rounded-3xl bg-[#111318]/80 border border-white/5 flex flex-col gap-4 relative overflow-hidden group hover:border-white/12 transition-all shadow-xl"
                      >
                        {/* Styled poster element */}
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/40 relative">
                          {p.mediaType === 'image' ? (
                            <img src={p.mediaUrl} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" referrerPolicy="no-referrer" />
                          ) : (
                            <video src={p.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                          )}

                          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                            <span className="px-2.5 py-1 text-[8px] bg-[#0B0B0D]/80 border border-white/5 rounded-md text-brand-cyan font-mono tracking-widest uppercase">
                              {p.category}
                            </span>
                            {p.isFeatured && (
                              <span className="px-2.5 py-1 text-[8px] bg-amber-400 text-black font-extrabold rounded-md font-mono tracking-widest uppercase animate-pulse">
                                🏆 FEATURED
                              </span>
                            )}
                          </div>

                          {/* Dynamic review alerts */}
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/85 px-3 py-1 rounded-xl text-[9px] font-mono border border-white/5 z-10">
                            {p.status === 'pending' ? (
                              <span className="text-orange-400 flex items-center gap-1 font-bold uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5 animate-spin" /> PENDING REVIEW
                              </span>
                            ) : p.status === 'approved' ? (
                              <span className="text-brand-lime flex items-center gap-1 font-bold uppercase tracking-widest">
                                <CheckCircle className="w-3.5 h-3.5" /> STAGE LIVE
                              </span>
                            ) : (
                              <span className="text-brand-pink flex items-center gap-1 font-bold uppercase tracking-widest">
                                <AlertTriangle className="w-3.5 h-3.5 text-brand-pink" /> ADJUSTMENT REQ
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Story caption */}
                        <p className="text-xs text-white/70 font-light leading-relaxed tracking-wider line-clamp-3">
                          {p.caption}
                        </p>

                        {/* Editorial dean corrections */}
                        {p.status === 'rejected' && p.rejectionReason && (
                          <div className="p-3 rounded-2xl bg-brand-pink/5 border border-brand-pink/15 text-[10px] text-brand-pink">
                            ⚠️ <span className="font-bold text-[10px] md:text-xs">Adjustment Required:</span> {p.rejectionReason}
                          </div>
                        )}

                        {/* Interactions summaries */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-white/30 font-mono text-[9px] tracking-widest font-semibold uppercase">
                          <div className="flex gap-3">
                            <span>❤️ {p.likesCount} HEARTS</span>
                            <span>💬 {p.commentsCount} NOTES</span>
                          </div>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-[#A78BFA] font-bold">
                            POINTS_ACC_⚡_{p.talentScore}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
