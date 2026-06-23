import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  ThumbsDown, 
  Send, 
  Award, 
  Trash2,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { User, Post, Comment } from '../types.ts';

interface InstagramPostCardProps {
  key?: string;
  post: Post;
  user: User;
  onReaction: (postId: string, type: 'like' | 'dislike') => Promise<void>;
  userReaction: 'like' | 'dislike' | null;
  onOpenLightbox: (post: Post) => any;
  fetchPosts: () => Promise<void>;
}

export default function InstagramPostCard({ 
  post, 
  user, 
  onReaction, 
  userReaction, 
  onOpenLightbox,
  fetchPosts
}: InstagramPostCardProps) {
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [inlineCommentText, setInlineCommentText] = useState('');
  const [submittingInlineComment, setSubmittingInlineComment] = useState(false);
  
  // Custom bespoke click/tap poof particle engine to avoid copyright while keeping it 100% satisfying
  const [particles, setParticles] = useState<{ id: number; angle: number; distance: number; size: number; color: string }[]>([]);
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const clickTrackRef = useRef<number>(0);
  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const res = await fetch(`/api/feed/post/${post.id}/comments`);
        const data = await res.json();
        if (res.ok && active) {
          setLocalComments(data.comments);
        }
      } catch (err) {
        console.error("Failed comments sync:", err);
      } finally {
        if (active) setCommentsLoading(false);
      }
    };
    fetchComments();
    return () => {
      active = false;
    };
  }, [post.id, post.commentsCount]);

  // Handle particle poof pop explosion
  const triggerPoofExplosion = () => {
    const geminiHues = [
      '#EF4444', // Hot Bloody Red
      '#F43F5E', // Rose Spark
      '#D946EF', // Fuchsia Flare
      '#06B6D4', // Cyan Beam
      '#3B82F6', // Neon Electric Blue
      '#A855F7'  // Violet Glime
    ];
    
    // Create 12 custom drifting lights shooting in a radial fashion
    const pool = Array.from({ length: 12 }).map((_, i) => ({
      id: Math.random(),
      angle: (i * 30) + (Math.random() * 15 - 7.5),
      distance: 35 + Math.random() * 55,
      size: 4 + Math.random() * 6,
      color: geminiHues[Math.floor(Math.random() * geminiHues.length)]
    }));
    setParticles(pool);
    
    // Clear particles after animation completes
    setTimeout(() => {
      setParticles([]);
    }, 850);
  };

  // Safe reaction trigger with poof feedback
  const handleLikeClick = async () => {
    triggerPoofExplosion();
    await onReaction(post.id, 'like');
  };

  const handleDislikeClick = async () => {
    await onReaction(post.id, 'dislike');
  };

  // Double tap to like, just like instagram!
  const handleMediaTouchOrClick = async (e: React.MouseEvent) => {
    const time = Date.now();
    const delay = 300; // milliseconds double-click tolerance
    if (time - clickTrackRef.current < delay) {
      // It's a double click!
      if (userReaction !== 'like') {
        triggerPoofExplosion();
        setDoubleTapHeart(true);
        setTimeout(() => setDoubleTapHeart(false), 900);
        await onReaction(post.id, 'like');
      } else {
        // Just trigger poof without removing reaction if already liked
        triggerPoofExplosion();
        setDoubleTapHeart(true);
        setTimeout(() => setDoubleTapHeart(false), 900);
      }
    }
    clickTrackRef.current = time;
  };

  // Post inline comments immediately
  const handleInlineCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineCommentText.trim() || submittingInlineComment) return;
    setSubmittingInlineComment(true);

    try {
      const res = await fetch(`/api/feed/post/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn: user.usn, text: inlineCommentText })
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setLocalComments(prev => [...prev, data.comment]);
        setInlineCommentText('');
        await fetchPosts();
      }
    } catch (error) {
      console.error("Failed posting inline note:", error);
    } finally {
      setSubmittingInlineComment(false);
    }
  };

  const handleMessageIconClick = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", damping: 24 }}
      className="break-inside-avoid relative rounded-3xl bg-[#0B0B0D] border border-white/5 flex flex-col group hover:border-white/10 transition-all duration-300 shadow-2xl relative overflow-hidden text-left"
    >
      {/* Decorative vertical border stripes for students posts with top talents */}
      {post.isFeatured && (
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-red-600 via-brand-pink to-brand-lavender animate-pulse z-10" />
      )}

      {/* HEADER SECTION (Instagram Style author layout on top of card) */}
      <div className="p-4 flex items-center justify-between bg-black/20 border-b border-white/[0.03] z-10">
        <div className="flex items-center gap-2.5">
          <img 
            src={post.authorPic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
            alt="Student Avatar creator" 
            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0" 
          />
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-white tracking-tight leading-tight flex items-center gap-1">
              {post.authorName}
              {post.isFeatured && <Award className="w-3.5 h-3.5 text-red-500 animate-pulse flex-shrink-0" />}
            </span>
            <span className="text-[8px] font-mono text-brand-pink uppercase tracking-wider">
              {post.authorDept} • @{post.username || post.usn.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Category Pill Tag */}
        <span className="px-2.5 py-1 text-[8px] font-mono font-bold tracking-widest text-[#FAFAF8] bg-white/5 rounded-full border border-white/10 select-none uppercase">
          {post.category}
        </span>
      </div>

      {/* MEDIA CONTENT CONTAINER */}
      <div 
        onClick={handleMediaTouchOrClick}
        className="relative w-full bg-black/60 overflow-hidden cursor-pointer flex items-center justify-center aspect-square select-none group/media"
      >
        {post.mediaType === 'image' ? (
          <img 
            src={post.mediaUrl} 
            alt="Student Talent Entry" 
            className="w-full h-full object-cover group-hover/media:scale-102 transition-transform duration-500" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <video 
            src={post.mediaUrl} 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover group-hover/media:scale-102 transition-transform duration-500"
          />
        )}

        {/* Double-tap flashy overlay heart inside media */}
        <AnimatePresence>
          {doubleTapHeart && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: [1, 1.4, 1] }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute inset-x-0 inset-y-0 m-auto w-24 h-24 flex items-center justify-center bg-black/30 rounded-full backdrop-blur-xs z-50 pointer-events-none"
            >
              <Heart className="w-16 h-16 fill-red-600 text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.85)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Radial "Poof" Particle Burst canvas simulation overlay */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          <AnimatePresence>
            {particles.map((p) => {
              const radians = (p.angle * Math.PI) / 180;
              const targetX = Math.cos(radians) * p.distance;
              const targetY = Math.sin(radians) * p.distance;

              return (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 0.3, opacity: 1 }}
                  animate={{ 
                    x: targetX, 
                    y: targetY, 
                    scale: [0.3, 1.4, 0], 
                    opacity: [1, 0.9, 0] 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.1, 0.8, 0.25, 1.0] }}
                  className="absolute rounded-full pointer-events-none shadow-lg"
                  style={{ 
                    left: '50%', 
                    top: '50%', 
                    width: `${p.size}px`, 
                    height: `${p.size}px`, 
                    backgroundColor: p.color,
                    boxShadow: `0 0 10px ${p.color}`,
                    transform: 'translate(-50%, -50%)' 
                  }}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Floating Expand Specification Spec plate */}
        <div 
          onClick={(e) => { e.stopPropagation(); onOpenLightbox(post); }}
          className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-[#0B0B0D]/80 border border-white/5 backdrop-blur-xs text-[8px] font-mono tracking-widest text-[#FAFAF8]/80 uppercase hover:bg-white hover:text-black hover:border-white transition-all overflow-hidden z-20"
        >
          SPECS ➔
        </div>
      </div>

      {/* QUICK ATTENTION-GETTING SOCIAL INTERACTIONS BAR */}
      <div className="p-4 pb-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            {/* Liker */}
            <div className="relative">
              <button
                type="button"
                onClick={handleLikeClick}
                className={`p-1.5 rounded-full bg-white/[0.02] border hover:border-red-500/20 active:scale-95 transition-all cursor-pointer ${
                  userReaction === 'like' ? 'border-red-500/10' : 'border-white/5'
                }`}
              >
                <Heart 
                  className={`w-4 h-4 transition-all duration-300 ${
                    userReaction === 'like' 
                      ? 'fill-red-600 text-red-600 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' 
                      : 'text-[#FAFAF8]/50 hover:text-white'
                  }`} 
                />
              </button>
            </div>

            {/* Disliker */}
            <button
              type="button"
              onClick={handleDislikeClick}
              className={`p-1.5 rounded-full bg-white/[0.02] border hover:border-brand-lavender/30 active:scale-95 transition-all cursor-pointer ${
                userReaction === 'dislike' ? 'border-brand-lavender/25' : 'border-white/5'
              }`}
            >
              <ThumbsDown 
                className={`w-4 h-4 transition-all duration-300 ${
                  userReaction === 'dislike' 
                    ? 'text-brand-lavender fill-brand-lavender/15 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' 
                    : 'text-[#FAFAF8]/50 hover:text-white'
                }`} 
              />
            </button>

            {/* Inline Comment Opener (triggers focus) */}
            <button
              type="button"
              onClick={handleMessageIconClick}
              className="p-1.5 rounded-full bg-white/[0.02] border border-white/5 hover:border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#FAFAF8]/50 hover:text-[#FAFAF8]" />
            </button>
          </div>

          {/* Social Proof Stats points weight indicator */}
          <div className="flex items-center gap-1 font-mono text-[9px]">
            <span className="text-white/30 uppercase font-black">TALENT SCALE:</span>
            <span className="font-extrabold tracking-widest text-white px-2 py-0.5 rounded-lg border border-white/5 bg-white/[0.02] text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-brand-pink to-brand-lavender">
              ⚡️ {post.talentScore}
            </span>
          </div>
        </div>

        {/* LIKES COUNT AND SCOREBOARD PROOFS */}
        <div className="text-[10px] font-mono text-white/50 tracking-wide text-left">
          <span>{post.likesCount} student vibes recorded</span>
        </div>

        {/* STORY OVERLAYS (Caption block) */}
        <div className="text-xs text-left leading-relaxed text-white/90">
          <span className="font-bold mr-1.5 text-white">@{post.username || post.usn.toLowerCase()}</span>
          <span className="font-light text-white/80">{post.caption}</span>
        </div>

        {/* FEEDBACK INLINE LIST (Shows the latest 2 comments on the card) */}
        <div className="space-y-1.5 pt-1.5 border-t border-white/[0.03]">
          
          {commentsLoading && localComments.length === 0 ? (
            <div className="text-[8px] font-mono text-white/25 uppercase tracking-widest py-1">
              fetching feedback loop...
            </div>
          ) : localComments.length === 0 ? (
            <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest leading-relaxed py-1">
              no feedback notes. type yours now 👇
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-brand-pink uppercase tracking-widest block font-bold mb-1">
                STUDENT FEEDBACK COGNITIVE CHAT ({localComments.length})
              </span>
              {localComments.slice(-2).map((c) => (
                <div key={c.id} className="text-[11px] leading-relaxed flex items-start gap-1 justify-between">
                  <div>
                    <span className="font-semibold text-white/80 mr-1.5 hover:underline cursor-pointer">
                      @{c.usn.toLowerCase()}
                    </span>
                    <span className="text-white/60 font-light">{c.text}</span>
                  </div>
                </div>
              ))}
              {localComments.length > 2 && (
                <button 
                  onClick={() => onOpenLightbox(post)}
                  className="text-[9px] font-mono text-brand-pink/75 hover:text-brand-pink underline tracking-wide uppercase pt-1 inline-block"
                >
                  view all {localComments.length} commentary notes ➔
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QUICK INLINE COMMENT BOX FOOTER */}
      <form 
        onSubmit={handleInlineCommentSubmit} 
        className="mt-auto border-t border-white/[0.04] bg-black/10 flex items-center px-4 py-2"
      >
        <input
          ref={commentInputRef}
          type="text"
          value={inlineCommentText}
          onChange={(e) => setInlineCommentText(e.target.value)}
          placeholder="Write deep feedback vibe..."
          required
          disabled={submittingInlineComment}
          className="flex-grow bg-transparent border-none text-[11px] text-white focus:outline-none placeholder:text-white/20 font-mono py-1 pr-2 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={submittingInlineComment || !inlineCommentText.trim()}
          className="text-brand-pink bg-transparent focus:outline-none hover:scale-105 active:scale-95 transition-all text-[10px] font-mono font-black uppercase tracking-widest py-1 px-1 cursor-pointer disabled:opacity-30"
        >
          {submittingInlineComment ? 'SENDING...' : <Send className="w-3.5 h-3.5 text-brand-pink" />}
        </button>
      </form>
    </motion.div>
  );
}
