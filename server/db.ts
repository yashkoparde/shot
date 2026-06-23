import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export interface User {
  usn: string;
  username: string;
  phone_number: string;
  name: string;
  department: string;
  year: string;
  bio: string;
  profilePicture: string;
  coverImage: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  passwordHash: string;
  role: 'student' | 'admin';
  status: 'active' | 'suspended';
  isVerified?: boolean;
}

export interface Post {
  id: string;
  usn: string;
  authorName: string;
  authorDept: string;
  authorPic: string;
  caption: string;
  category: 'Coding' | 'Sports' | 'Dance' | 'Music' | 'Photography' | 'Startup' | 'Fitness' | 'Art' | 'Other';
  mediaUrl: string;
  mediaType: 'image' | 'video';
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isFeatured: boolean;
  likesCount: number;
  commentsCount: number;
  talentScore: number;
  createdAt: string;
  username?: string;
}

export interface Like {
  id: string;
  postId: string;
  usn: string;
  type: 'like' | 'dislike';
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  usn: string;
  authorName: string;
  authorPic: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  usn: string;
  title: string;
  content: string;
  type: 'like' | 'comment' | 'approval' | 'rejection' | 'featured';
  read: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  posts: Post[];
  likes: Like[];
  comments: Comment[];
  notifications: Notification[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Initial seed data for that premium, fully functional out-of-the-box feel!
const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      usn: "1RV22CS001",
      username: "rohit",
      phone_number: "+919876543210",
      name: "Rohit Sharma",
      department: "Computer Science",
      year: "3rd Year",
      bio: "Full Stack Engineer & AI enthusiast. Building decentralized platforms. Hackathon winner 2026.",
      profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
      socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com"
      },
      passwordHash: "student123",
      role: "student",
      status: "active",
      isVerified: true
    },
    {
      usn: "1RV22ME045",
      username: "ananya",
      phone_number: "+919876543211",
      name: "Ananya Iyer",
      department: "Mechanical Eng",
      year: "4th Year",
      bio: "Aero Designer & Motorsports Enthusiast. Driving structural designs for collegiate Racing team.",
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      coverImage: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=1000",
      socialLinks: {
        linkedin: "https://linkedin.com",
        instagram: "https://instagram.com"
      },
      passwordHash: "student123",
      role: "student",
      status: "active",
      isVerified: true
    },
    {
      usn: "1RV23EC102",
      username: "karan",
      phone_number: "+919876543212",
      name: "Karan Johar",
      department: "Electronics",
      year: "2nd Year",
      bio: "Cinematographer and street photographer. Freezing moments in time. 📸 Lens: Sony A7IV.",
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000",
      socialLinks: {
        instagram: "https://instagram.com",
        twitter: "https://twitter.com"
      },
      passwordHash: "student123",
      role: "student",
      status: "active",
      isVerified: false
    },
    {
      usn: "ADMIN001",
      username: "dean",
      phone_number: "+919876543213",
      name: "Dean Of Student Affairs",
      department: "Administration",
      year: "Faculty",
      bio: "University Talent Moderator. Empowering students to express and excel.",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000",
      socialLinks: {},
      passwordHash: "admin123",
      role: "admin",
      status: "active"
    }
  ],
  posts: [
    {
      id: "post1",
      usn: "1RV22CS001",
      authorName: "Rohit Sharma",
      authorDept: "Computer Science",
      authorPic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      caption: "Deployed 'Heimdall Nodes' - an ultra low-latency WebRTC streaming gateway. Tested with 500 concurrent peers, latency stays under 45ms. Native Rust, fully containerized! 🦀⚡️",
      category: "Coding",
      mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
      mediaType: "image",
      status: "approved",
      isFeatured: true,
      likesCount: 142,
      commentsCount: 2,
      talentScore: 290,
      createdAt: "2026-06-10T14:32:00Z"
    },
    {
      id: "post2",
      usn: "1RV22ME045",
      authorName: "Ananya Iyer",
      authorDept: "Mechanical Eng",
      authorPic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      caption: "Our student-built single-seater Formula Student racecar undergoing carbon fiber aerodynamic simulation overlays! CFDs showing a 18% drag coefficient reduction.",
      category: "Startup",
      mediaUrl: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800",
      mediaType: "image",
      status: "approved",
      isFeatured: true,
      likesCount: 98,
      commentsCount: 1,
      talentScore: 199,
      createdAt: "2026-06-11T01:10:00Z"
    },
    {
      id: "post3",
      usn: "1RV23EC102",
      authorName: "Karan Johar",
      authorDept: "Electronics",
      authorPic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      caption: "Chasing gold hours at the university library corridors. Sony A7IV | 50mm f1.2 GM. 🏛️✨",
      category: "Photography",
      mediaUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800",
      mediaType: "image",
      status: "approved",
      isFeatured: false,
      likesCount: 45,
      commentsCount: 0,
      talentScore: 90,
      createdAt: "2026-06-09T18:22:00Z"
    }
  ],
  likes: [
    {
      id: "like1",
      postId: "post1",
      usn: "1RV22ME045",
      type: "like",
      createdAt: "2026-06-10T14:40:00Z"
    }
  ],
  comments: [
    {
      id: "comment1",
      postId: "post1",
      usn: "1RV22ME045",
      authorName: "Ananya Iyer",
      authorPic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      text: "Insane latency results, Rohit! Is this open source yet?",
      createdAt: "2026-06-10T14:45:00Z"
    }
  ],
  notifications: [
    {
      id: "notif1",
      usn: "1RV22CS001",
      title: "Post Approved!",
      content: "Your post 'Heimdall Nodes WebRTC gateway' has been approved by the Dean and is now visible in the Student Talent Hub.",
      type: "approval",
      read: true,
      createdAt: "2026-06-10T14:35:00Z"
    }
  ]
};

// Supabase lazy credentials read
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

class LocalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = INITIAL_DATA;
    this.ensureDirectory();
    this.load();
    if (isSupabaseConfigured) {
      this.syncFromSupabase();
    }
  }

  private ensureDirectory() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          users: parsed.users || INITIAL_DATA.users,
          posts: parsed.posts || INITIAL_DATA.posts,
          likes: parsed.likes || INITIAL_DATA.likes,
          comments: parsed.comments || INITIAL_DATA.comments,
          notifications: parsed.notifications || INITIAL_DATA.notifications,
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.error("Failed to load local DB, falling back to base templates:", err);
      this.data = INITIAL_DATA;
    }
  }

  private save() {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error("Failed to save local DB:", err);
    }
  }

  // --- Bi-directional Supabase Syncer ---
  private async syncFromSupabase() {
    if (!supabase) return;
    try {
      console.log("[Supabase Status] Syncing live clusters into memory layer...");

      // 1. Sync onboarded students
      const { data: dbUsers, error: uErr } = await supabase.from('users').select('*');
      if (!uErr && dbUsers) {
        dbUsers.forEach((u: any) => {
          const mapped: User = {
            usn: u.usn,
            username: u.username || '',
            phone_number: u.phone_number || '',
            name: u.name,
            department: u.department,
            year: u.year,
            bio: u.bio || '',
            profilePicture: u.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            coverImage: u.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000',
            socialLinks: u.social_links || {},
            passwordHash: u.password_hash,
            role: u.role || 'student',
            status: u.status || 'active',
            isVerified: u.is_verified || false
          };
          const rawIdx = this.data.users.findIndex(x => x.usn === mapped.usn);
          if (rawIdx === -1) {
            this.data.users.push(mapped);
          } else {
            this.data.users[rawIdx] = mapped;
          }
        });
      }

      // 2. Sync public exhibits
      const { data: dbPosts, error: pErr } = await supabase.from('posts').select('*');
      if (!pErr && dbPosts) {
        dbPosts.forEach((p: any) => {
          const author = this.data.users.find(u => u.usn === p.usn);
          const mapped: Post = {
            id: String(p.id),
            usn: p.usn,
            authorName: author?.name || 'Student',
            authorDept: author?.department || 'Digital Media',
            authorPic: author?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            caption: p.caption || '',
            category: p.category || 'Other',
            mediaUrl: p.media_url || '',
            mediaType: p.media_type || 'image',
            status: p.status || 'pending',
            rejectionReason: p.rejection_reason || undefined,
            isFeatured: p.is_featured || false,
            likesCount: p.likes_count || 0,
            commentsCount: p.comments_count || 0,
            talentScore: p.talent_score || 0,
            createdAt: p.created_at || new Date().toISOString(),
            username: author?.username || ''
          };
          const rawIdx = this.data.posts.findIndex(x => x.id === mapped.id);
          if (rawIdx === -1) {
            this.data.posts.push(mapped);
          } else {
            this.data.posts[rawIdx] = mapped;
          }
        });
      }

      // 3. Sync likes
      const { data: dbLikes, error: lErr } = await supabase.from('likes').select('*');
      if (!lErr && dbLikes) {
        dbLikes.forEach((l: any) => {
          const mapped: Like = {
            id: String(l.id),
            postId: String(l.post_id),
            usn: l.usn,
            type: l.type || 'like',
            createdAt: l.created_at || new Date().toISOString()
          };
          const rawIdx = this.data.likes.findIndex(x => x.id === mapped.id);
          if (rawIdx === -1) {
            this.data.likes.push(mapped);
          } else {
            this.data.likes[rawIdx] = mapped;
          }
        });
      }

      // 4. Sync feedback comments
      const { data: dbComments, error: cErr } = await supabase.from('comments').select('*');
      if (!cErr && dbComments) {
        dbComments.forEach((c: any) => {
          const author = this.data.users.find(u => u.usn === c.usn);
          const mapped: Comment = {
            id: String(c.id),
            postId: String(c.post_id),
            usn: c.usn,
            authorName: author?.name || 'Student',
            authorPic: author?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            text: c.text || '',
            createdAt: c.created_at || new Date().toISOString()
          };
          const rawIdx = this.data.comments.findIndex(x => x.id === mapped.id);
          if (rawIdx === -1) {
            this.data.comments.push(mapped);
          } else {
            this.data.comments[rawIdx] = mapped;
          }
        });
      }

      // 5. Sync inbox notifications
      const { data: dbNotifs, error: nErr } = await supabase.from('notifications').select('*');
      if (!nErr && dbNotifs) {
        dbNotifs.forEach((n: any) => {
          const mapped: Notification = {
            id: String(n.id),
            usn: n.usn,
            title: n.title,
            content: n.content,
            type: n.type || 'like',
            read: n.read || false,
            createdAt: n.created_at || new Date().toISOString()
          };
          const rawIdx = this.data.notifications.findIndex(x => x.id === mapped.id);
          if (rawIdx === -1) {
            this.data.notifications.push(mapped);
          } else {
            this.data.notifications[rawIdx] = mapped;
          }
        });
      }

      this.save();
      console.log("[Supabase Status] Synchronized states successfully.");
    } catch(err) {
      console.error("[Supabase Warning] Remote link idle or uninitialized:", err);
    }
  }

  // --- Background Upserters ---
  private async pushUser(user: User) {
    if (!supabase) return;
    try {
      await supabase.from('users').upsert({
        usn: user.usn,
        username: user.username,
        phone_number: user.phone_number,
        name: user.name,
        department: user.department,
        year: user.year,
        bio: user.bio,
        profile_picture: user.profilePicture,
        cover_image: user.coverImage,
        social_links: user.socialLinks,
        password_hash: user.passwordHash,
        role: user.role,
        status: user.status,
        is_verified: user.isVerified
      });
    } catch(e) {
      console.error("Upsert user background failure:", e);
    }
  }

  private async pushPost(post: Post) {
    if (!supabase) return;
    try {
      // Ensure we push a valid UUID if it is uuid-based or let Supabase assign
      const pushId = post.id.startsWith('post') ? undefined : post.id;
      const row: any = {
        usn: post.usn,
        caption: post.caption,
        category: post.category,
        media_url: post.mediaUrl,
        media_type: post.mediaType,
        status: post.status,
        rejection_reason: post.rejectionReason || null,
        is_featured: post.isFeatured,
        likes_count: post.likesCount,
        comments_count: post.commentsCount,
        talent_score: post.talentScore
      };
      if (pushId) {
        row.id = pushId;
      }
      await supabase.from('posts').upsert(row);
    } catch(e) {
      console.error("Upsert post background failure:", e);
    }
  }

  private async pushLike(postId: string, usn: string, type: 'like' | 'dislike', wasDeleted = false) {
    if (!supabase) return;
    try {
      if (wasDeleted) {
        // If it starts with a local prefix, we can match on relational keys
        await supabase.from('likes').delete().match({ usn, post_id: postId.startsWith('post') ? undefined : postId });
      } else {
        await supabase.from('likes').upsert({
          post_id: postId.startsWith('post') ? undefined : postId,
          usn,
          type
        });
      }
    } catch(e) {
      console.error("Upsert reaction background failure:", e);
    }
  }

  private async pushComment(comment: Comment) {
    if (!supabase) return;
    try {
      await supabase.from('comments').upsert({
        post_id: comment.postId.startsWith('post') ? undefined : comment.postId,
        usn: comment.usn,
        text: comment.text
      });
    } catch(e) {
      console.error("Upsert comment background failure:", e);
    }
  }

  private async pushNotification(notif: Notification) {
    if (!supabase) return;
    try {
      await supabase.from('notifications').upsert({
        usn: notif.usn,
        title: notif.title,
        content: notif.content,
        type: notif.type,
        read: notif.read
      });
    } catch(e) {
      console.error("Upsert notification background failure:", e);
    }
  }

  // --- Users Operations ---
  getUsers(): User[] {
    this.load();
    return this.data.users;
  }

  getUserByUSN(usn: string): User | undefined {
    this.load();
    return this.data.users.find(u => u.usn === usn);
  }

  createUser(user: User): User {
    this.load();
    this.data.users.push(user);
    this.save();
    this.pushUser(user);
    return user;
  }

  updateUser(usn: string, updates: Partial<User>): User | undefined {
    this.load();
    const index = this.data.users.findIndex(u => u.usn === usn);
    if (index === -1) return undefined;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    
    // Cascade updates
    if (updates.name || updates.profilePicture || updates.department) {
      this.data.posts.forEach((p, idx) => {
        if (p.usn === usn) {
          if (updates.name) this.data.posts[idx].authorName = updates.name;
          if (updates.profilePicture) this.data.posts[idx].authorPic = updates.profilePicture;
          if (updates.department) this.data.posts[idx].authorDept = updates.department;
        }
      });
      this.data.comments.forEach((c, idx) => {
        if (c.usn === usn) {
          if (updates.name) this.data.comments[idx].authorName = updates.name;
          if (updates.profilePicture) this.data.comments[idx].authorPic = updates.profilePicture;
        }
      });
    }
    
    this.save();
    this.pushUser(this.data.users[index]);
    return this.data.users[index];
  }

  // --- Posts Operations ---
  getPosts(): Post[] {
    this.load();
    return this.data.posts;
  }

  getPostById(id: string): Post | undefined {
    this.load();
    return this.data.posts.find(p => p.id === id);
  }

  createPost(post: Post): Post {
    this.load();
    this.data.posts.push(post);
    this.save();
    this.pushPost(post);
    return post;
  }

  updatePost(id: string, updates: Partial<Post>): Post | undefined {
    this.load();
    const index = this.data.posts.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.data.posts[index] = { ...this.data.posts[index], ...updates } as Post;
    
    // Compute talentScore inside memory
    const p = this.data.posts[index];
    const likesValue = p.likesCount * 2;
    const commentsValue = p.commentsCount * 3;
    const featuredValue = p.isFeatured ? 10 : 0;
    p.talentScore = likesValue + commentsValue + featuredValue;
    
    this.save();
    this.pushPost(p);
    return p;
  }

  // --- Likes Operations ---
  getUserReactions(usn: string): Record<string, 'like' | 'dislike'> {
    this.load();
    const map: Record<string, 'like' | 'dislike'> = {};
    const upperUsn = usn.toUpperCase();
    this.data.likes.forEach(l => {
      if (l.usn.toUpperCase() === upperUsn) {
        map[l.postId] = l.type;
      }
    });
    return map;
  }

  getLikesForPost(postId: string): Like[] {
    this.load();
    return this.data.likes.filter(l => l.postId === postId);
  }

  toggleLike(postId: string, usn: string, type: 'like' | 'dislike'): { liked: boolean; deleted: boolean; status: string } {
    this.load();
    const existing = this.data.likes.find(l => l.postId === postId && l.usn === usn);
    const postIndex = this.data.posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      throw new Error("Post not found");
    }

    if (existing) {
      if (existing.type === type) {
        this.data.likes = this.data.likes.filter(l => l.id !== existing.id);
        if (type === 'like' && this.data.posts[postIndex].likesCount > 0) {
          this.data.posts[postIndex].likesCount--;
        }
        this.recomputeTalentScore(postId);
        this.save();
        this.pushLike(postId, usn, type, true);
        return { liked: false, deleted: true, status: 'removed' };
      } else {
        existing.type = type;
        if (type === 'like') {
          this.data.posts[postIndex].likesCount++;
        } else if (this.data.posts[postIndex].likesCount > 0) {
          this.data.posts[postIndex].likesCount--;
        }
        this.recomputeTalentScore(postId);
        this.save();
        this.pushLike(postId, usn, type, false);
        return { liked: true, deleted: false, status: 'swapped' };
      }
    } else {
      const id = 'like_' + Math.random().toString(36).substring(2, 11);
      const newL = {
        id,
        postId,
        usn,
        type,
        createdAt: new Date().toISOString()
      };
      this.data.likes.push(newL);
      if (type === 'like') {
        this.data.posts[postIndex].likesCount++;
        const recipient = this.data.posts[postIndex].usn;
        const liker = this.data.users.find(u => u.usn === usn);
        if (recipient !== usn && liker) {
          this.createNotification({
            id: 'notif_' + Math.random().toString(36).substring(2, 11),
            usn: recipient,
            title: "Post Liked! ❤️",
            content: `${liker.name} liked your talent post.`,
            type: "like",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      }
      this.recomputeTalentScore(postId);
      this.save();
      this.pushLike(postId, usn, type, false);
      return { liked: type === 'like', deleted: false, status: 'added' };
    }
  }

  private recomputeTalentScore(postId: string) {
    const post = this.data.posts.find(p => p.id === postId);
    if (post) {
      const likesValue = post.likesCount * 2;
      const commentsValue = post.commentsCount * 3;
      const featuredValue = post.isFeatured ? 10 : 0;
      post.talentScore = likesValue + commentsValue + featuredValue;
    }
  }

  // --- Comments Operations ---
  getCommentsForPost(postId: string): Comment[] {
    this.load();
    return this.data.comments.filter(c => c.postId === postId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  addComment(postId: string, usn: string, text: string): Comment {
    this.load();
    const user = this.getUserByUSN(usn);
    if (!user) throw new Error("User validation error");

    const id = 'comment_' + Math.random().toString(36).substring(2, 11);
    const comment: Comment = {
      id,
      postId,
      usn,
      authorName: user.name,
      authorPic: user.profilePicture,
      text,
      createdAt: new Date().toISOString()
    };

    this.data.comments.push(comment);

    const postIndex = this.data.posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      this.data.posts[postIndex].commentsCount++;
      this.recomputeTalentScore(postId);

      const recipient = this.data.posts[postIndex].usn;
      if (recipient !== usn) {
        this.createNotification({
          id: 'notif_' + Math.random().toString(36).substring(2, 11),
          usn: recipient,
          title: "New Comment 💬",
          content: `${user.name} commented on your post: "${text.substring(0, 40)}"`,
          type: "comment",
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    this.save();
    this.pushComment(comment);
    return comment;
  }

  // --- Notifications Operations ---
  getNotifications(usn: string): Notification[] {
    this.load();
    return this.data.notifications.filter(n => n.usn === usn).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notif: Notification): Notification {
    this.load();
    this.data.notifications.push(notif);
    this.save();
    this.pushNotification(notif);
    return notif;
  }

  markNotificationsAsRead(usn: string): void {
    this.load();
    this.data.notifications.forEach((n, idx) => {
      if (n.usn === usn) {
        this.data.notifications[idx].read = true;
      }
    });
    this.save();
    if (supabase) {
      supabase.from('notifications').update({ read: true }).match({ usn }).then(() => {});
    }
  }
}

export const db = new LocalDatabase();
