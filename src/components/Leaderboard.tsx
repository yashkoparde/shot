import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Code, 
  Sparkles, 
  Award, 
  Star, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Activity,
  User as UserIcon,
  Crown
} from 'lucide-react';

interface LeaderboardUser {
  usn: string;
  name: string;
  dept: string;
  pic: string;
  totalScore: number;
  categories: string[];
  postsCount: number;
  isVerified: boolean;
  username?: string;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [filterType, setFilterType] = useState<'All' | 'Coding' | 'Sports' | 'Art' | 'Startup'>('All');
  const [loading, setLoading] = useState(true);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (res.ok) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error("Failed to load global rankings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const filteredLeaders = leaderboard.filter(it => {
    if (filterType === 'All') return true;
    if (filterType === 'Coding') return it.categories.some(c => c.toLowerCase() === 'coding');
    if (filterType === 'Sports') return it.categories.some(c => c.toLowerCase() === 'sports' || c.toLowerCase() === 'fitness');
    if (filterType === 'Art') return it.categories.some(c => c.toLowerCase() === 'art' || c.toLowerCase() === 'photography' || c.toLowerCase() === 'dance' || c.toLowerCase() === 'music');
    if (filterType === 'Startup') return it.categories.some(c => c.toLowerCase() === 'startup' || c.toLowerCase() === 'other');
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 flex flex-col gap-8 text-left pb-28 relative select-none">
      
      {/* Decorative ambient lighting glow behind podiums */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-brand-lavender/4 rounded-full blur-[150px] pointer-events-none" />

      {/* CORE TITLE HEADER BLOCK */}
      <div className="border-b border-white/5 pb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl px-2 md:px-0">
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white flex items-center gap-2 md:gap-3">
            <Trophy className="w-6 h-6 md:w-7 md:h-7 text-amber-400" />
            Leaderboard
          </h1>
          <p className="text-[11px] md:text-xs text-white/50 font-light leading-relaxed">
            Rankings and status tiers are computed by the algorithmic scoring equation: <span className="text-brand-cyan font-mono">(Likes × 2) + (Comments × 3) + (Featured × 15)</span>.
          </p>
        </div>

        {/* Filter categories tabs header */}
        <div className="flex gap-2 flex-wrap bg-[#111318]/80 p-1.5 rounded-2xl border border-white/5 self-start">
          {[
            { value: 'All', label: 'Overall', icon: Crown },
            { value: 'Coding', label: 'Developers', icon: Code },
            { value: 'Sports', label: 'Athletes', icon: Trophy },
            { value: 'Art', label: 'Creatives', icon: Sparkles },
            { value: 'Startup', label: 'Founders', icon: Award },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilterType(opt.value as any)}
              className={`px-3.5 py-2 rounded-xl text-[10px] md:text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                filterType === opt.value
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <opt.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/30 font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2">
          <div className="w-2h-2 bg-white rounded-full animate-ping" />
          Loading...
        </div>
      ) : filteredLeaders.length === 0 ? (
        <div className="text-center py-20 bg-[#111318]/50 border border-white/5 rounded-3xl text-white/40 flex flex-col items-center justify-center gap-3">
          <Star className="w-10 h-10 text-white/10 animate-spin-slow" />
          <span className="text-sm font-medium">No one found in this category</span>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* THE GOLDEN PODIUMS REVEAL STAGE */}
          {filteredLeaders.length >= 1 && filterType === 'All' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end py-6 max-w-5xl mx-auto">
              
              {/* Silver Podium RANK 2 */}
              {filteredLeaders[1] ? (
                <div className="order-2 md:order-1 p-6 rounded-3xl bg-[#111318]/80 border border-white/5 backdrop-blur-xl relative flex flex-col items-center text-center group transition-all hover:border-slate-400/30 hover:bg-[#111318]">
                  
                  <div className="relative mb-4 mt-4">
                    <img src={filteredLeaders[1].pic} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-400/30 shadow-2xl" />
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-400 text-black flex items-center justify-center font-display font-black text-[10px] shadow-lg">2</div>
                  </div>

                  <div className="space-y-1 w-full">
                    <h3 className="text-base font-bold text-[#FAFAF8] truncate w-full flex items-center justify-center gap-1">
                      {filteredLeaders[1].name}
                      {filteredLeaders[1].isVerified && <ShieldCheck className="w-4 h-4 text-brand-cyan fill-brand-cyan/20 shrink-0" />}
                    </h3>
                    <p className="text-[10px] font-mono text-white/40 truncate">@{filteredLeaders[1].username || filteredLeaders[1].usn.toLowerCase()}</p>
                    <p className="text-[11px] text-white/50 font-light truncate">{filteredLeaders[1].dept}</p>
                  </div>

                  <div className="mt-4 px-4 py-1.5 bg-slate-400/10 border border-slate-400/15 rounded-full text-xs font-mono font-black text-slate-300 tracking-wider flex items-center gap-1.5">
                    {filteredLeaders[1].totalScore} PTS
                  </div>
                </div>
              ) : (
                <div className="order-2 md:order-1 hidden md:block" />
              )}

              {/* Gold Podium RANK 1 (Main spotlight) */}
              <div className="order-1 md:order-2 p-8 rounded-3xl bg-amber-400/[0.02] border border-amber-400/20 backdrop-blur-2xl relative flex flex-col items-center text-center group transition-all hover:border-amber-400/40 hover:bg-amber-400/[0.04] shadow-2xl shadow-amber-400/5 md:-translate-y-4">
                <div className="relative mb-5 mt-4">
                  <div className="absolute -inset-4 bg-amber-400/10 rounded-full blur-[15px] animate-pulse" />
                  <img src={filteredLeaders[0].pic} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-amber-400/40 shadow-2xl relative z-10" />
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-amber-400 text-black flex items-center justify-center font-display font-black text-xs shadow-xl filter z-20 animate-bounce">1</div>
                </div>

                <div className="space-y-1 w-full">
                  <h3 className="text-lg font-display font-black text-white tracking-wide truncate w-full flex items-center justify-center gap-1">
                    {filteredLeaders[0].name}
                    {filteredLeaders[0].isVerified && <ShieldCheck className="w-4.5 h-4.5 text-brand-cyan fill-brand-cyan/20 shrink-0" />}
                  </h3>
                  <p className="text-[10px] font-mono text-amber-300/60 truncate">@{filteredLeaders[0].username || filteredLeaders[0].usn.toLowerCase()}</p>
                  <p className="text-[11px] text-white/60 font-light truncate">{filteredLeaders[0].dept}</p>
                </div>

                <div className="mt-5 px-5 py-2 bg-amber-400/20 border border-amber-400/30 rounded-full text-xs font-black font-mono text-amber-300 tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  {filteredLeaders[0].totalScore} PTS
                </div>
              </div>

              {/* Bronze Podium RANK 3 */}
              {filteredLeaders[2] ? (
                <div className="order-3 p-6 rounded-3xl bg-[#111318]/80 border border-white/5 backdrop-blur-xl relative flex flex-col items-center text-center group transition-all hover:border-[#CD7F32]/30 hover:bg-[#111318]">
                  <div className="relative mb-4 mt-4">
                    <img src={filteredLeaders[2].pic} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#CD7F32]/30 shadow-2xl" />
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#CD7F32] text-black flex items-center justify-center font-display font-black text-[10px] shadow-lg">3</div>
                  </div>

                  <div className="space-y-1 w-full">
                    <h3 className="text-base font-bold text-[#FAFAF8] truncate w-full flex items-center justify-center gap-1">
                      {filteredLeaders[2].name}
                      {filteredLeaders[2].isVerified && <ShieldCheck className="w-4 h-4 text-brand-cyan fill-brand-cyan/20 shrink-0" />}
                    </h3>
                    <p className="text-[10px] font-mono text-white/40 truncate">@{filteredLeaders[2].username || filteredLeaders[2].usn.toLowerCase()}</p>
                    <p className="text-[11px] text-white/50 font-light truncate">{filteredLeaders[2].dept}</p>
                  </div>

                  <div className="mt-4 px-4 py-1.5 bg-[#CD7F32]/10 border border-[#CD7F32]/15 rounded-full text-xs font-mono font-black text-[#CD7F32]/90 tracking-wider flex items-center gap-1.5">
                    {filteredLeaders[2].totalScore} PTS
                  </div>
                </div>
              ) : (
                <div className="order-3 hidden md:block" />
              )}

            </div>
          )}

          {/* CLASSIFIED REGISTRY LEDGER */}
          <div className="w-full bg-[#111318]/60 border border-white/5 rounded-3xl md:rounded-3xl overflow-hidden backdrop-blur-xl shadow-lg">
            
            {/* Table heads */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-5 bg-[#111318] border-b border-white/5 text-[10px] uppercase font-medium tracking-wider text-white/40">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4 text-left">Creator</div>
              <div className="col-span-4 text-left">Department</div>
              <div className="col-span-1 text-center">Posts</div>
              <div className="col-span-2 text-right">Score</div>
            </div>

            {/* Table listing */}
            <div className="divide-y divide-white/5">
              {filteredLeaders.map((lead, idx) => (
                <div 
                  key={lead.usn}
                  className="flex items-center justify-between md:grid md:grid-cols-12 gap-3 px-4 md:px-6 py-4 md:py-5 transition-colors hover:bg-white/[0.02]"
                >
                  {/* Rank Badge */}
                  <div className="md:col-span-1 text-center font-mono text-xs md:text-sm font-bold text-white/60 w-6 md:w-auto shrink-0 flex items-center justify-center">
                    {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>

                  {/* Creator profile */}
                  <div className="flex-1 md:col-span-4 flex items-center justify-start gap-3 min-w-0">
                    <img src={lead.pic} className="w-10 h-10 md:w-9 md:h-9 rounded-full object-cover ring-1 ring-white/10 shrink-0" />
                    <div className="flex flex-col text-left truncate w-full min-w-0">
                      <span className="text-sm md:text-[13px] font-semibold text-white flex items-center gap-1 truncate w-full">
                        <span className="truncate">{lead.name}</span>
                        {lead.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan fill-brand-cyan/25 shrink-0" />}
                      </span>
                      <span className="text-[11px] text-white/50 truncate w-full">@{lead.username || lead.usn.toLowerCase()}</span>
                      <span className="text-[11px] text-white/40 md:hidden truncate w-full pb-0.5">{lead.dept}</span>
                    </div>
                  </div>

                  {/* Branch specialization */}
                  <div className="hidden md:block col-span-4 text-xs text-white/60 font-light text-left truncate">
                    {lead.dept}
                  </div>

                  {/* Showcase post counts */}
                  <div className="hidden md:block col-span-1 text-center text-xs text-white/50">
                    {lead.postsCount}
                  </div>

                  {/* Dynamic Score value */}
                  <div className="md:col-span-2 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-lavender text-sm shrink-0">
                    {lead.totalScore} PTS
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
