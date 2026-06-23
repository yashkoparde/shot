import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Post, Notification } from './types.ts';
import Loader from './components/Loader.tsx';
import Landing from './components/Landing.tsx';
import Feed from './components/Feed.tsx';
import Leaderboard from './components/Leaderboard.tsx';
import Profile from './components/Profile.tsx';
import { Bell, CheckCircle2, Heart, MessageSquare, Star, ArrowLeft, Trash2, Calendar, Radio, Compass, Flame, User as UserIcon, LogOut, Plus } from 'lucide-react';

export default function App() {
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'Feed' | 'Leaderboard' | 'Profile' | 'Notifications'>('Feed');
  
  // Backing records state
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Sync global approved posts feed
  const fetchPosts = async () => {
    try {
      const qParams = new URLSearchParams();
      if (sessionUser) {
        qParams.append('usn', sessionUser.usn);
        qParams.append('role', sessionUser.role);
      }
      const res = await fetch(`/api/feed/posts?${qParams.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error("Failed to sync client posts records:", e);
    }
  };

  // Sync notifications archive for student alerts
  const fetchNotifications = async () => {
    if (!sessionUser || sessionUser.role !== 'student') return;
    try {
      setNotifLoading(true);
      const res = await fetch(`/api/notifications/${sessionUser.usn}`);
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to load user notifications:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  // Mark all alerts read
  const markNotificationsRead = async () => {
    if (!sessionUser) return;
    try {
      await fetch(`/api/notifications/${sessionUser.usn}/read`, { method: 'POST' });
      await fetchNotifications();
    } catch (e) {
      console.error("Failed to sync read status:", e);
    }
  };

  useEffect(() => {
    if (sessionUser) {
      fetchPosts();
      fetchNotifications();

      // Setup polling loops to sync social updates and notifications in real-time !
      const interval = setInterval(() => {
        fetchPosts();
        fetchNotifications();
      }, 25000);

      return () => clearInterval(interval);
    }
  }, [sessionUser]);

  // Handle logout
  const handleLogout = () => {
    setSessionUser(null);
    setActiveTab('Feed');
  };

  // Triggered when student alters core fields (Avatar edit sync)
  const handleProfileUpdate = (updated: User) => {
    setSessionUser(updated);
  };

  return (
    <div className="bg-brand-charcoal min-h-screen text-[#FAFAF8] select-none font-sans antialiased">
      <AnimatePresence mode="wait">
        
        {/* 1. CINEMATIC ACCELERATING LOADING RUNNER SCREEN */}
        {loadingProgress ? (
          <motion.div key="loader">
            <Loader onComplete={() => setLoadingProgress(false)} />
          </motion.div>
        ) : !sessionUser ? (
          
          /* 2. GLORIOUS GLASSMORPH APPLE HERO LANDING PAGE */
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Landing 
              onLoginSuccess={(user) => setSessionUser(user)} 
              onAdminOpen={() => {}} // Unlocked natively via USN logins
            />
          </motion.div>
        ) : sessionUser.role === 'admin' ? (
          
          /* 3. SECURE SEPARATE DEAN MODERATION DASHBOARD */
          <motion.div 
            key="admin_stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DynamicAdminPortal 
              adminUser={sessionUser} 
              onLogout={handleLogout} 
              posts={posts} 
              fetchPosts={fetchPosts} 
            />
          </motion.div>
        ) : (
          
          /* 4. CHOSEN TAB VIEWER - STUDENT SOCIAL CORE FEED */
          <motion.div 
            key="student_stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen bg-brand-charcoal text-[#FAFAF8] overflow-x-hidden w-full relative"
          >
            {/* SINGLE UNIFIED PERSISTENT STICKY HUD HEADER */}
            <nav className="w-full bg-[#0B0B0D]/90 border-b border-white/5 backdrop-blur-2xl sticky top-0 z-40 px-6 py-4 select-none animate-fade-in relative flex items-center justify-between">
              
              {/* Brand Name absolutely centered */}
              <div className="absolute left-1/2 -translate-x-1/2">
                <span 
                  onClick={() => setActiveTab('Feed')}
                  className="text-2xl font-display font-black tracking-[0.25em] text-[#FAFAF8] select-none cursor-pointer filter hover:drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] active:scale-95 transition-all block"
                >
                  SH<span className="text-red-600 font-black">O</span>T
                </span>
              </div>

              {/* SICK ICON-BASED FEED/LEADERBOARD SEGMENTATION (hidden on mobile) */}
              <div className="hidden md:flex items-center gap-2 bg-[#111318]/60 p-1 rounded-2xl border border-white/5 shadow-2xl z-10">
                {[
                  { name: 'Feed', icon: Compass, id: 'tab-feed', label: 'Timeline' },
                  { name: 'Leaderboard', icon: Flame, id: 'tab-leaderboard', label: 'Leaderboard' },
                  { name: 'Profile', icon: UserIcon, id: 'tab-profile', label: 'My Brand' },
                  { name: 'Notifications', icon: Bell, id: 'tab-notifications', label: 'Alerts', hasBadge: notifications.filter(n => !n.read).length > 0 },
                ].map((tab) => (
                  <button
                    key={tab.name}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.name as any);
                      if (tab.name === 'Notifications') markNotificationsRead();
                    }}
                    className={`p-2.5 rounded-xl relative transition-all duration-350 group flex items-center justify-center cursor-pointer ${
                      activeTab === tab.name 
                        ? 'bg-red-600/15 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)] scale-102' 
                        : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 transition-transform group-hover:scale-105" />
                    
                    {tab.hasBadge && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black border border-[#0B0B0D]">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}

                    {/* Tooltip on hover */}
                    <span className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/95 border border-white/10 px-2.5 py-1 rounded-xl text-[8px] font-mono tracking-wider font-extrabold uppercase opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl whitespace-nowrap z-50 text-[#FAFAF8]">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Nav Right Section (Profile details) - ensure z-10 to stay clickable and visible over centered logo if needed, and push left space to push items right when center is absolute */}
              <div className="flex items-center gap-3 z-10 ml-auto">
                  {/* Avatar card info */}
                  <div 
                    onClick={() => setActiveTab('Profile')}
                    className="hidden sm:flex items-center gap-2.5 bg-[#111318]/60 border border-white/5 pl-3 pr-2.5 py-1.5 rounded-2xl cursor-pointer hover:border-white/10 select-none text-left"
                  >
                    <div className="flex flex-col text-right">
                      <span className="text-[11px] font-bold text-white tracking-tight">{sessionUser.name}</span>
                      <span className="text-[8px] font-mono text-brand-cyan uppercase tracking-wider">@{sessionUser.username || sessionUser.usn.toLowerCase()}</span>
                    </div>
                    <img 
                      src={sessionUser.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                      alt="Student Avatar creator" 
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/10" 
                    />
                  </div>
                </div>

            </nav>

            {/* MAIN CONTENT VIEW CONTAINER */}
            <div className="flex-grow">
              {activeTab === 'Feed' ? (
                <Feed 
                  user={sessionUser} 
                  onLogout={handleLogout} 
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    if (tab === 'Notifications') markNotificationsRead();
                  }} 
                  activeTab={activeTab} 
                  posts={posts} 
                  fetchPosts={fetchPosts}
                  notificationsCount={notifications.filter(n => !n.read).length}
                />
              ) : (
                <div className="pb-24">
                  {activeTab === 'Leaderboard' && <Leaderboard />}
                  {activeTab === 'Profile' && (
                    <Profile 
                      user={sessionUser} 
                      onProfileUpdate={handleProfileUpdate} 
                      posts={posts} 
                    />
                  )}
                  {activeTab === 'Notifications' && (
                    <NotificationsPane 
                      notifications={notifications} 
                      onBack={() => setActiveTab('Feed')} 
                      onClear={markNotificationsRead}
                      loading={notifLoading}
                    />
                  )}
                </div>
              )}
            </div>

            {/* UNIFIED MOBILE LOWER RAIL BAR */}
            <div className="flex md:hidden border-t border-white/5 bg-[#0B0B0D]/95 backdrop-blur-md fixed bottom-0 left-0 right-0 z-40 py-2.5 justify-around shadow-2xl items-center px-4">
              {[
                { name: 'Feed', icon: Compass },
                { name: 'Leaderboard', icon: Flame },
              ].map((tab) => (
                <button
                  key={tab.name}
                  type="button"
                  onClick={() => setActiveTab(tab.name as any)}
                  className={`relative p-2 rounded-xl flex items-center justify-center transition-all ${
                    activeTab === tab.name ? 'text-red-500 scale-105' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                </button>
              ))}

              {/* Central Publish Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('Feed');
                  window.dispatchEvent(new CustomEvent('open-publish-modal'));
                }}
                className="relative p-2.5 rounded-2xl bg-white text-black flex items-center justify-center -mt-4 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all outline-none"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>

              {[
                { name: 'Notifications', icon: Bell, hasBadge: notifications.filter(n => !n.read).length > 0 },
                { name: 'Profile', icon: UserIcon },
              ].map((tab) => (
                <button
                  key={tab.name}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.name as any);
                    if (tab.name === 'Notifications') markNotificationsRead();
                  }}
                  className={`relative p-2 rounded-xl flex items-center justify-center transition-all ${
                    activeTab === tab.name ? 'text-red-500 scale-105' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.hasBadge && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white font-mono text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-[#0B0B0D]">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------
// SECURE DYNAMIC ADMINISTRATIVE IMPORT PORTAL MODULE
// -------------------------------------------------------------
import AdminComponent from './components/Admin.tsx';

function DynamicAdminPortal({ adminUser, onLogout, posts, fetchPosts }: { 
  adminUser: User; 
  onLogout: () => void; 
  posts: Post[]; 
  fetchPosts: () => Promise<void>;
}) {
  return (
    <AdminComponent 
      adminUser={adminUser} 
      onLogout={onLogout} 
      posts={posts} 
      fetchPosts={fetchPosts} 
    />
  );
}

// -------------------------------------------------------------
// STUDENT NOTIFICATIONS INBOX COMPONENT
// -------------------------------------------------------------
interface NotificationsPaneProps {
  notifications: Notification[];
  onBack: () => void;
  onClear: () => void;
  loading: boolean;
}

function NotificationsPane({ notifications, onBack, onClear, loading }: NotificationsPaneProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 flex flex-col gap-6 md:gap-8 text-left pb-28 relative select-none">
      
      <div className="border-b border-white/5 pb-4 md:pb-6 flex items-center justify-between">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <button 
            type="button"
            onClick={onBack}
            className="w-fit p-1.5 md:p-2 hover:bg-white/5 border border-white/5 rounded-xl text-white/50 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Back</span>
          </button>
          <h1 className="text-xl md:text-2xl font-display font-black tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-brand-cyan" /> Notifications
          </h1>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-white/40 hover:text-brand-pink font-mono tracking-widest uppercase flex items-center gap-1.5 transition-all cursor-pointer bg-white/5 md:bg-transparent md:border border-white/5 p-2 rounded-xl md:hover:bg-brand-pink/5"
          >
            <Trash2 className="w-4 h-4 text-brand-pink" /> <span className="hidden md:inline">Mark all read</span>
          </button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="text-center py-20 text-white/40 font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-brand-cyan rounded-full animate-ping" />
          Loading...
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 md:py-20 bg-[#111318]/40 border border-white/5 rounded-[2rem] text-white/30 font-mono text-xs max-w-lg mx-auto w-full flex flex-col items-center gap-3 shadow-lg px-4">
          <Bell className="w-8 h-8 text-white/10" />
          <span className="text-[10px] tracking-widest uppercase">No notifications</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:gap-4">
          {notifications.map(notif => {
            const isRead = notif.read;

            return (
              <div 
                key={notif.id}
                className={`p-4 md:p-5 rounded-[1.5rem] md:rounded-3xl border flex gap-3 md:gap-4 items-start text-left transition-all ${
                  isRead 
                    ? 'bg-[#111318]/40 border-white/5 opacity-60' 
                    : 'bg-[#111318] border-white/10 shadow-lg'
                }`}
              >
                <div className="shrink-0 p-2 md:p-2.5 rounded-xl bg-[#0B0B0D] border border-white/5 md:border-white/10 mt-0.5">
                  {notif.type === 'like' && <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-pink fill-brand-pink/20" />}
                  {notif.type === 'comment' && <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-cyan" />}
                  {notif.type === 'approval' && <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-lime" />}
                  {notif.type === 'rejection' && <Bell className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-pink" />}
                  {notif.type === 'featured' && <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400 fill-amber-400/20" />}
                </div>

                <div className="flex flex-col gap-1 md:gap-1.5 w-full min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-3">
                    <span className="text-[13px] md:text-sm font-bold text-[#FAFAF8] truncate w-full">{notif.title}</span>
                    <span className="text-[9px] md:text-[8px] text-white/40 font-mono flex items-center gap-1 md:gap-1.5 uppercase tracking-wider shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-xs text-white/70 font-light leading-relaxed tracking-wide">
                    {notif.content}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
