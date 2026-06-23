import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MessageSquare, 
  Plus, 
  Search, 
  Image, 
  Video, 
  Bell, 
  Radio, 
  Heart, 
  Send, 
  Compass, 
  Flame, 
  LogOut, 
  Award,
  Zap,
  Tag,
  BookOpen,
  Filter,
  User as UserIcon,
  HelpCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { User, Post, Comment } from '../types.ts';
import InstagramPostCard from './InstagramPostCard.tsx';

interface FeedProps {
  user: User;
  onLogout: () => void;
  onTabChange: (tab: 'Feed' | 'Leaderboard' | 'Profile' | 'Notifications') => void;
  activeTab: string;
  posts: Post[];
  fetchPosts: () => Promise<void>;
  notificationsCount: number;
}

const CATEGORIES = [
  'All', 'Coding', 'Sports', 'Dance', 'Music', 'Photography', 'Startup', 'Fitness', 'Art', 'Other'
] as const;

const PRESET_MEDIAS = [
  { name: 'Quantum Core', url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800', type: 'image' },
  { name: 'CFD Turbo', url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800', type: 'image' },
  { name: 'Reflex Light', url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800', type: 'image' },
  { name: 'Neon Synth', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800', type: 'image' },
  { name: 'Cyber Stage', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', type: 'image' },
  { name: 'Strobe Flash', url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800', type: 'image' }
];

export default function Feed({ user, onLogout, onTabChange, activeTab, posts, fetchPosts, notificationsCount }: FeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const handleOpenPublish = () => setIsUploadOpen(true);
    window.addEventListener('open-publish-modal', handleOpenPublish);
    return () => window.removeEventListener('open-publish-modal', handleOpenPublish);
  }, []);

  // Post creation state
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<string>('Coding');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [aiOpinion, setAiOpinion] = useState('');

  // Post comment thread state
  const [activeComments, setActiveComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Reactions state (likes list)
  const [reactedPosts, setReactedPosts] = useState<Record<string, 'like' | 'dislike' | null>>({});

  useEffect(() => {
    let active = true;
    const loadReactions = async () => {
      try {
        const res = await fetch(`/api/feed/user-reactions/${user.usn}`);
        const data = await res.json();
        if (res.ok && data.reactionsMap && active) {
          setReactedPosts(data.reactionsMap);
        } else if (active) {
          const initial: Record<string, 'like' | 'dislike' | null> = {};
          posts.forEach(p => {
            initial[p.id] = null; 
          });
          setReactedPosts(initial);
        }
      } catch (err) {
        console.error("Failed to load user reactions:", err);
      }
    };
    loadReactions();
    return () => {
      active = false;
    };
  }, [posts, user.usn]);

  // Handle post submit
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');
    setAiOpinion('');

    if (!caption.trim()) {
      setUploadError("Please enrich with a luxury details summary.");
      return;
    }

    try {
      const res = await fetch('/api/feed/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usn: user.usn,
          caption,
          category,
          mediaUrl: mediaUrl || PRESET_MEDIAS[0].url,
          mediaType
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Post publication failed");

      setUploadSuccess(data.message);
      if (data.aiRecommendation) {
        setAiOpinion(data.aiRecommendation);
      }

      await fetchPosts();
      
      setTimeout(() => {
        setIsUploadOpen(false);
        setCaption('');
        setMediaUrl('');
        setUploadSuccess('');
        setAiOpinion('');
      }, 3500);

    } catch (err: any) {
      setUploadError(err.message || "Failed to catalog creative asset.");
    }
  };

  // Toggle feedback reactions
  const handleReaction = async (postId: string, type: 'like' | 'dislike') => {
    try {
      const res = await fetch(`/api/feed/post/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn: user.usn, type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reaction post error");

      setReactedPosts(prev => ({
        ...prev,
        [postId]: prev[postId] === type ? null : type
      }));

      await fetchPosts();
    } catch (error) {
      console.error("Failed to post reaction:", error);
    }
  };

  const openPostDetails = async (post: Post) => {
    setSelectedPost(post);
    try {
      const res = await fetch(`/api/feed/post/${post.id}/comments`);
      const data = await res.json();
      if (res.ok) {
        setActiveComments(data.comments);
      }
    } catch (error) {
      console.error("Failed to load conversation boards:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedPost) return;
    setSubmittingComment(true);

    try {
      const res = await fetch(`/api/feed/post/${selectedPost.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn: user.usn, text: commentText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCommentText('');
      setActiveComments(prev => [...prev, data.comment]);
      setSelectedPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);

      await fetchPosts();
    } catch (error) {
      console.error("Comment dispatch failed:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const isCatMatch = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const isSearchMatch = p.caption.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return isCatMatch && isSearchMatch;
  });

  return (
    <div className="bg-[#0B0B0D]/50 text-[#FAFAF8] font-sans flex flex-col relative selection:bg-brand-cyan selection:text-black">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-cyan/4 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] bg-brand-lavender/4 rounded-full blur-[120px] pointer-events-none" />

      {/* MAIN MAGAZINE PRESENTATION PANEL */}
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 flex-grow">
        
        {/* TOP EXHIBITS: SHOWN AFTER LOGIN */}
        {posts && posts.length > 0 && (
          <div className="space-y-4 text-left select-none">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" />
              <h2 className="text-[11px] font-mono tracking-[0.25em] text-white font-black uppercase">
                TOP TRENDING EXHIBITS
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...posts]
                .filter(p => p.status === 'approved')
                .sort((a, b) => b.talentScore - a.talentScore)
                .slice(0, 3)
                .map((post) => (
                  <div
                    key={`top-${post.id}`}
                    onClick={() => openPostDetails(post)}
                    className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#111318] border border-white/10 hover:border-brand-cyan/45 cursor-pointer group shadow-2xl transition-all duration-300"
                  >
                    {post.mediaType === 'image' ? (
                      <img 
                        src={post.mediaUrl} 
                        alt={post.caption} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <video 
                        src={post.mediaUrl} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Beautiful dark minimal label projection */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-left">
                      <span className="text-[8px] font-mono tracking-widest text-brand-cyan uppercase font-bold">
                        ★ {post.category}
                      </span>
                      <h3 className="text-xs font-bold text-white line-clamp-1 mt-1 leading-tight group-hover:text-brand-cyan transition-colors">
                        {post.caption}
                      </h3>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[9px] text-[#FAFAF8]/50 font-mono">
                        <span className="truncate max-w-[120px] uppercase">BY {post.authorName}</span>
                        <span className="text-brand-cyan font-black">⚡️ {post.talentScore}</span>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* CONTROLS BAR: SEARCH & DYNAMIC FILTER SLIDERS */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between border-b border-white/5 pb-6">
          
          <div className="flex items-center gap-3 flex-grow max-w-2xl">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search talent posts, campus handles, USN catalog, departments..."
                className="w-full bg-[#111318]/70 border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-brand-cyan transition-colors placeholder:text-white/30 font-mono tracking-wider"
              />
            </div>
            
            {/* Quick Publish launcher button */}
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-brand-cyan hover:bg-brand-cyan/95 text-black font-display font-black text-xs tracking-widest uppercase flex items-center gap-1.5 transition-all shadow-lg shadow-brand-cyan/20 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              PUBLISH POSTER
            </button>
          </div>

          {/* Slideline categories carousel */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-[9px] font-mono tracking-widest uppercase whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-brand-cyan text-black border-brand-cyan font-bold shadow-lg shadow-brand-cyan/10' 
                    : 'bg-[#111318] border-white/5 text-white/40 hover:text-white hover:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* THE ADDICTIVE VERTICAL SWIPE LAYOUT */}
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-16 bg-[#111318]/40 border border-white/5 rounded-3xl gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Radio className="w-6 h-6 text-white/20 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white/50 tracking-wider font-mono">TIMELINE IS QUIET</h3>
              <p className="text-xs text-white/35 max-w-sm font-light">Be the first to publish an amazing portfolio project, athletic trophy highlight, or photography set.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 md:gap-12 pb-12 w-full max-w-lg mx-auto">
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <InstagramPostCard
                  key={post.id}
                  post={post}
                  user={user}
                  onReaction={handleReaction}
                  userReaction={reactedPosts[post.id] || null}
                  onOpenLightbox={openPostDetails}
                  fetchPosts={fetchPosts}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>


      {/* PUBLISH NEW POST MODAL */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0D]/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="relative w-full max-w-xl bg-[#111318] border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-8 overflow-hidden text-left"
            >
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-600/10 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-xl font-display font-bold tracking-tight text-white flex items-center gap-2">
                    Publish to SHOT
                  </h2>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setIsUploadOpen(false); setUploadError(''); setUploadSuccess(''); setAiOpinion(''); }}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {uploadError && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl mb-6">
                  {uploadError}
                </div>
              )}
              {uploadSuccess && (
                <div className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl mb-6">
                  {uploadSuccess}
                </div>
              )}

              <form onSubmit={handleCreatePost} className="flex flex-col gap-5">
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase font-mono text-white/50">Description</label>
                  <textarea 
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Describe your work..." 
                    rows={3}
                    required
                    className="w-full bg-[#0B0B0D] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase font-mono text-white/50">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#0B0B0D] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors appearance-none"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase font-mono text-white/50">Media Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaType('image')}
                        className={`py-2 px-3 text-sm rounded-xl transition-colors cursor-pointer ${
                          mediaType === 'image' 
                            ? 'bg-white text-black font-semibold' 
                            : 'bg-[#0B0B0D] border border-white/10 text-white/50 hover:text-white'
                        }`}
                      >
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaType('video')}
                        className={`py-2 px-3 text-sm rounded-xl transition-colors cursor-pointer ${
                          mediaType === 'video' 
                            ? 'bg-white text-black font-semibold' 
                            : 'bg-[#0B0B0D] border border-white/10 text-white/50 hover:text-white'
                        }`}
                      >
                        Video
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preset media library cards */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs uppercase font-mono text-white/50 flex justify-between items-center">
                    <span>Presets</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_MEDIAS.map(lib => (
                      <button
                        key={lib.name}
                        type="button"
                        onClick={() => { setMediaUrl(lib.url); setMediaType('image'); }}
                        className={`py-2 px-3 text-[10px] uppercase font-mono border rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-center truncate ${
                          mediaUrl === lib.url ? 'border-white text-white bg-white/5' : 'border-white/5 text-white/40'
                        }`}
                      >
                        {lib.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs uppercase font-mono text-white/50">Media URL</label>
                  <input 
                    type="url" 
                    value={mediaUrl} 
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://" 
                    className="w-full bg-[#0B0B0D] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-4 py-3.5 rounded-xl bg-white text-black font-bold text-sm uppercase transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  Publish
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* POST DETAILEX LIGHTBOARDS & DISCUSSION OVERLAYS */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0D]/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="relative w-full max-w-4xl bg-[#111318] border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row h-[85vh] text-left"
            >
              
              {/* Media viewer (Left Column) */}
              <div className="md:w-3/5 bg-black/60 flex items-center justify-center relative overflow-hidden h-1/2 md:h-full group">
                {selectedPost.mediaType === 'image' ? (
                  <img 
                    src={selectedPost.mediaUrl} 
                    alt="Lightbox visual layout" 
                    className="w-full h-full object-contain" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <video 
                    src={selectedPost.mediaUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-contain"
                  />
                )}
                
                {/* Floating category plate */}
                <span className="absolute top-4 left-4 px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase bg-brand-cyan text-black font-bold rounded">
                  {selectedPost.category}
                </span>
              </div>

              {/* Engagement ledger (Right Column) */}
              <div className="md:w-2/5 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5 h-1/2 md:h-full overflow-hidden text-left bg-[#111318]/90">
                
                {/* Author specifications */}
                <div className="flex flex-col gap-4 border-b border-white/5 pb-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={selectedPost.authorPic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                        alt="Publisher Identity Avatar" 
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{selectedPost.authorName}</span>
                        <span className="text-[9px] font-mono text-brand-cyan">@{selectedPost.username || selectedPost.usn.toLowerCase()} • {selectedPost.authorDept}</span>
                      </div>
                    </div>
                    {/* Close button */}
                    <button 
                      type="button" 
                      onClick={() => setSelectedPost(null)}
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all text-xs font-mono cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-white/70 font-light leading-relaxed tracking-wider">
                    {selectedPost.caption}
                  </p>
                </div>

                {/* Commentary List */}
                <div className="flex-grow overflow-y-auto py-4 space-y-4 pr-1">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-brand-cyan font-bold flex items-center gap-1.5 pb-2 border-b border-white/5 flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" /> SUPPORTIVE STUDENT COMMENTARY ({activeComments.length})
                  </span>
                  
                  {activeComments.length === 0 ? (
                    <div className="text-center py-12 text-white/20 font-mono text-[10px] tracking-widest uppercase">
                      NO COMMENTARY RECORDED YET
                    </div>
                  ) : (
                    activeComments.map(c => (
                      <div key={c.id} className="flex gap-2.5 text-xs text-left">
                        <img 
                          src={c.authorPic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                          alt="Commenter identity avatar" 
                          className="w-7 h-7 rounded-lg object-cover flex-shrink-0 ring-1 ring-white/10" 
                        />
                        <div className="flex flex-col gap-1 w-full bg-[#0B0B0D] border border-white/5 p-3 rounded-2xl">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-white">{c.authorName}</span>
                            <span className="text-[8px] text-white/30 font-mono">{c.usn}</span>
                          </div>
                          <p className="text-[#FAFAF8]/70 font-light leading-relaxed tracking-wide text-[11px]">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Submission panel for supportive student notes */}
                <form onSubmit={handleCommentSubmit} className="border-t border-white/5 pt-4 mt-auto flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add high-faith support comments..."
                      required
                      className="flex-grow bg-[#0B0B0D] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-brand-cyan placeholder:text-white/20 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="p-3 rounded-xl bg-brand-cyan text-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
                    >
                      <Send className="w-4 h-4 text-black" />
                    </button>
                  </div>
                </form>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
