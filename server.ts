import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini if key exists
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize Gemini API:", error);
  }
} else {
  console.log("No GEMINI_API_KEY found, running without AI suggestions.");
}

// ==========================================
// API ROUTES
// ==========================================

// Auth Endpoint: Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "USN or Username, and Password are required." });
  }

  const cleanIdentifier = identifier.trim().toUpperCase();
  let user = db.getUserByUSN(cleanIdentifier);
  if (!user) {
    // attempt to query by username handle
    user = db.getUsers().find(u => u.username.toUpperCase() === cleanIdentifier);
  }

  if (!user) {
    return res.status(404).json({ error: "No user found with the given USN or Username registration." });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: "Your account is suspended. Please contact student affairs." });
  }

  // Check password hash
  if (user.passwordHash !== password) {
    return res.status(401).json({ error: "Incorrect authentication password." });
  }

  res.json({
    message: "Welcome to SHOT",
    user: {
      usn: user.usn,
      username: user.username,
      phone_number: user.phone_number,
      name: user.name,
      department: user.department,
      year: user.year,
      bio: user.bio,
      profilePicture: user.profilePicture,
      coverImage: user.coverImage,
      socialLinks: user.socialLinks,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified
    }
  });
});

// Auth Endpoint: Signup
app.post('/api/auth/register', (req, res) => {
  const { usn, username, phone_number, name, department, year, bio, password } = req.body;
  if (!usn || !username || !phone_number || !name || !department || !year || !password) {
    return res.status(400).json({ error: "All student onboarding fields, including username and phone number, are mandatory." });
  }

  const normalizedUSN = usn.toUpperCase();
  const existing = db.getUserByUSN(normalizedUSN);
  if (existing) {
    return res.status(400).json({ error: `USN ${normalizedUSN} is already registered on SHOT.` });
  }

  const existingByUsername = db.getUsers().find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (existingByUsername) {
    return res.status(400).json({ error: `Username @${username} is already taken.` });
  }

  const newUser = {
    usn: normalizedUSN,
    username: username.trim().toLowerCase(),
    phone_number: phone_number.trim(),
    name,
    department,
    year,
    bio: bio || "Ready to express and inspire at Student Hub Of Talent.",
    profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200", // Default
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000", // Default
    socialLinks: {},
    passwordHash: password,
    role: 'student' as const,
    status: 'active' as const,
    isVerified: false
  };

  db.createUser(newUser);
  res.status(201).json({
    message: "Account onboarded successfully",
    user: newUser
  });
});

// Get User Detail and Stats
app.get('/api/user/:usn', (req, res) => {
  const user = db.getUserByUSN(req.params.usn.toUpperCase());
  if (!user) {
    return res.status(404).json({ error: "Onboarded details not found." });
  }

  // Fetch all approved posts by this user to compute totals
  const userPosts = db.getPosts().filter(p => p.usn === user.usn && p.status === 'approved');
  const likesCount = userPosts.reduce((sum, p) => sum + p.likesCount, 0);
  const featuredCount = userPosts.filter(p => p.isFeatured).length;
  const rankList = db.getPosts()
    .filter(p => p.status === 'approved')
    .reduce((list: any[], p) => {
      const existing = list.find(it => it.usn === p.usn);
      if (existing) {
        existing.score += p.talentScore;
      } else {
        list.push({ usn: p.usn, score: p.talentScore });
      }
      return list;
    }, [])
    .sort((a, b) => b.score - a.score);

  const rankIndex = rankList.findIndex(it => it.usn === user.usn);
  const overallRank = rankIndex === -1 ? rankList.length + 1 : rankIndex + 1;
  const overallScore = rankList.find(it => it.usn === user.usn)?.score || 0;

  res.json({
    user: {
      usn: user.usn,
      username: user.username,
      phone_number: user.phone_number,
      name: user.name,
      department: user.department,
      year: user.year,
      bio: user.bio,
      profilePicture: user.profilePicture,
      coverImage: user.coverImage,
      socialLinks: user.socialLinks,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified
    },
    stats: {
      postsCount: userPosts.length,
      likesCount,
      featuredCount,
      overallRank,
      overallScore
    }
  });
});

// Edit Profile
app.post('/api/user/:usn/edit', (req, res) => {
  const { name, department, year, bio, profilePicture, coverImage, socialLinks } = req.body;
  const usn = req.params.usn.toUpperCase();
  const existing = db.getUserByUSN(usn);
  if (!existing) {
    return res.status(404).json({ error: "User profile not registered." });
  }

  const updated = db.updateUser(usn, {
    name,
    department,
    year,
    bio,
    profilePicture,
    coverImage,
    socialLinks
  });

  res.json({ message: "Profile synchronized with SHOT", user: updated });
});

// Feed posts
app.get('/api/feed/posts', (req, res) => {
  const { category, search, usn, role } = req.query;
  let list = db.getPosts();

  // If regular student view, show ONLY approved posts, EXCEPT if looking at their own posts
  if (role !== 'admin') {
    list = list.filter(p => p.status === 'approved' || (usn && p.usn === (usn as string).toUpperCase()));
  }

  if (category && category !== 'All') {
    list = list.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(p => 
      p.caption.toLowerCase().includes(q) || 
      p.authorName.toLowerCase().includes(q) || 
      p.usn.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Sort by latest post by default
  list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ posts: list });
});

// Create Post Client Side
app.post('/api/feed/post', async (req, res) => {
  const { usn, caption, category, mediaUrl, mediaType } = req.body;
  if (!usn || !caption || !category) {
    return res.status(400).json({ error: "Caption, category and publisher identification are required." });
  }

  const user = db.getUserByUSN(usn.toUpperCase());
  if (!user) {
    return res.status(404).json({ error: "Active publisher validation failed." });
  }

  const postId = 'post_' + Math.random().toString(36).substr(2, 9);
  
  const newPost = {
    id: postId,
    usn: user.usn,
    authorName: user.name,
    authorDept: user.department,
    authorPic: user.profilePicture,
    caption,
    category: category as any,
    mediaUrl: mediaUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
    mediaType: (mediaType || 'image') as 'image' | 'video',
    status: 'pending' as const, // EVERY UPLOAD DRAFTS PENDING MODERATION!
    isFeatured: false,
    likesCount: 0,
    commentsCount: 0,
    talentScore: 0,
    createdAt: new Date().toISOString()
  };

  db.createPost(newPost);

  // If Gemini API is online, draft automated reviewer audit notes!
  let aiRecommendation = "";
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this student talent post content. 
        Category: ${category}
        Caption: "${caption}"
        
        Is it fully compliant with appropriate college campus decoration? 
        If yes, write a supportive brief 1-sentence endorsement recommend for the Dean to approve.
        If no, write a 1-sentence warning describing the issue. Mark at the beginning [APPROVE] or [FLAG].`,
      });
      aiRecommendation = response.text || "";
    } catch (e) {
      console.error("Failed to generate audit helper recommendation:", e);
    }
  }

  res.status(201).json({
    message: "Thank you! Your talent showcase is submitted. Pending Dean moderation review.",
    post: newPost,
    aiRecommendation
  });
});

// Toggle Post Feed Action (likes / dislikes)
app.post('/api/feed/post/:id/like', (req, res) => {
  const { usn, type } = req.body; // type: 'like' | 'dislike'
  const postId = req.params.id;

  if (!usn || !type) {
    return res.status(400).json({ error: "USN and reaction type are required." });
  }

  try {
    const result = db.toggleLike(postId, usn.toUpperCase(), type);
    const updatedPost = db.getPostById(postId);
    res.json({ message: "Reaction processed successfully", result, post: updatedPost });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// User Reactions Lookup Map API
app.get('/api/feed/user-reactions/:usn', (req, res) => {
  const reactionsMap = db.getUserReactions(req.params.usn);
  res.json({ reactionsMap });
});

// Comments Core API
app.get('/api/feed/post/:id/comments', (req, res) => {
  const comments = db.getCommentsForPost(req.params.id);
  res.json({ comments });
});

app.post('/api/feed/post/:id/comment', (req, res) => {
  const { usn, text } = req.body;
  const postId = req.params.id;

  if (!usn || !text) {
    return res.status(400).json({ error: "Credential verification and comment string are required." });
  }

  try {
    const comment = db.addComment(postId, usn.toUpperCase(), text);
    const updatedPost = db.getPostById(postId);
    res.status(201).json({ message: "Comment published", comment, post: updatedPost });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Notifications Alert API
app.get('/api/notifications/:usn', (req, res) => {
  const notifications = db.getNotifications(req.params.usn.toUpperCase());
  res.json({ notifications });
});

app.post('/api/notifications/:usn/read', (req, res) => {
  db.markNotificationsAsRead(req.params.usn.toUpperCase());
  res.json({ message: "Alert inbox set to cleared." });
});

// Leaderboard scoring calculations
app.get('/api/leaderboard', (req, res) => {
  const posts = db.getPosts().filter(p => p.status === 'approved');
  const users = db.getUsers().filter(u => u.role === 'student');

  // Group scores by contributor
  const scoreMap: Record<string, {
    usn: string;
    name: string;
    dept: string;
    pic: string;
    totalScore: number;
    categories: string[];
    postsCount: number;
    isVerified: boolean;
  }> = {};

  users.forEach(u => {
    scoreMap[u.usn] = {
      usn: u.usn,
      name: u.name,
      dept: u.department,
      pic: u.profilePicture,
      totalScore: 0,
      categories: [],
      postsCount: 0,
      isVerified: !(!u.isVerified)
    };
  });

  posts.forEach(p => {
    if (!scoreMap[p.usn]) {
      // Lazy construct if user was seeded differently
      scoreMap[p.usn] = {
        usn: p.usn,
        name: p.authorName,
        dept: p.authorDept,
        pic: p.authorPic,
        totalScore: 0,
        categories: [],
        postsCount: 0,
        isVerified: false
      };
    }
    
    scoreMap[p.usn].totalScore += p.talentScore;
    scoreMap[p.usn].postsCount++;
    if (!scoreMap[p.usn].categories.includes(p.category)) {
      scoreMap[p.usn].categories.push(p.category);
    }
  });

  const sortedLeaderboard = Object.values(scoreMap)
    .sort((a, b) => b.totalScore - a.totalScore)
    // Filter out students who haven't generated any approved talents yet if desired, or keep as potential list
    .filter(it => it.postsCount > 0);

  res.json({ leaderboard: sortedLeaderboard });
});

// ==========================================
// DEAN MODERATION & ADMIN SERVICES API (Protected conceptually by frontend)
// ==========================================

// Get Admin analytical statistics
app.get('/api/admin/metrics', (req, res) => {
  const users = db.getUsers();
  const posts = db.getPosts();

  const totalUsers = users.filter(u => u.role === 'student').length;
  const totalPosts = posts.length;
  const pendingPosts = posts.filter(p => p.status === 'pending').length;
  const approvedPosts = posts.filter(p => p.status === 'approved').length;
  const rejectedPosts = posts.filter(p => p.status === 'rejected').length;

  // Compute category distributions
  const categoryStats = posts.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  res.json({
    metrics: {
      totalUsers,
      totalPosts,
      pendingPosts,
      approvedPosts,
      rejectedPosts
    },
    categoryDistribution: categoryStats
  });
});

// AI Audits Queue helper analysis
app.post('/api/admin/ai-audit/:postId', async (req, res) => {
  const post = db.getPostById(req.params.postId);
  if (!post) return res.status(404).json({ error: "Post details expired." });

  if (!ai) {
    return res.json({ audit: "Gemini AI review queue is offline. Configure GEMINI_API_KEY inside Settings > Secrets." });
  }

  try {
    const prompt = `Perform an objective, executive editorial assessment for an official College Talent Showcase moderation review.
    Student Name: ${post.authorName} (USN: ${post.usn})
    Proposed Talent Category: ${post.category}
    Showcase Caption: "${post.caption}"
    
    Produce a concise 2-sentence response detailing:
    1. Safety rating [Safe, Neutral, Warning, Profane, Off-Topic]
    2. Suggested decision: "Approve for Student Feed" or "Request Correction"
    3. Suggested encouragement or feedback. Ensure it is written professionally as a Dean's automated assistant.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ audit: response.text });
  } catch (e: any) {
    res.status(500).json({ error: "AI reasoning failure", info: e.message });
  }
});

// Moderate post status: Approve | Reject
app.post('/api/admin/moderate/:id', (req, res) => {
  const { status, reason } = req.body; // status: 'approved' | 'rejected', reason: string (optional feedback)
  const postId = req.params.id;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Moderation decision parameter status must be approved or rejected." });
  }

  const post = db.getPostById(postId);
  if (!post) {
    return res.status(404).json({ error: "Showcase post records mismatch." });
  }

  db.updatePost(postId, {
    status: status as any,
    rejectionReason: status === 'rejected' ? (reason || "Does not meet standard showcase guidelines.") : undefined
  });

  // Notify student publisher
  const notifyTitle = status === 'approved' ? "Your Talent Post is Live! 🎉" : "Talent Submission Feedback ⚠️";
  const notifyContent = status === 'approved' 
    ? `Congratulations! Dean approved your talent post under ${post.category}. It is trending in the hub.` 
    : `Your talent submission under ${post.category} was status updated: REJECTED. Reason: ${reason || 'Incomplete guidelines support'}`;

  db.createNotification({
    id: 'notif_' + Math.random().toString(36).substr(2, 9),
    usn: post.usn,
    title: notifyTitle,
    content: notifyContent,
    type: status === 'approved' ? "approval" : "rejection",
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `Showcase successfully marked as ${status}. Post status modified.`, post: db.getPostById(postId) });
});

// Feature post (toggle Hall of Fame)
app.post('/api/admin/feature/:id', (req, res) => {
  const { isFeatured } = req.body;
  const postId = req.params.id;

  const post = db.getPostById(postId);
  if (!post) {
    return res.status(404).json({ error: "Selected post not found." });
  }

  db.updatePost(postId, { isFeatured: !(!isFeatured) });

  if (isFeatured) {
    db.createNotification({
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      usn: post.usn,
      title: "Featured in Hall of Fame! 🏆",
      content: `Incredible! Your talent post has been featured in the SHOT official Hall of Fame by Student Affairs.`,
      type: "featured",
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  res.json({ message: "Featured metrics saved", post: db.getPostById(postId) });
});

// Admin list accounts
app.get('/api/admin/users', (req, res) => {
  const users = db.getUsers().filter(u => u.role === 'student');
  res.json({ users });
});

// Change user registration status: Ban/Suspend/Verify
app.post('/api/admin/users/status', (req, res) => {
  const { usn, status, isVerified } = req.body;
  if (!usn) return res.status(400).json({ error: "USN is mandatory." });

  const target = db.getUserByUSN(usn.toUpperCase());
  if (!target) return res.status(404).json({ error: "Target student not registered." });

  const updates: Partial<typeof target> = {};
  if (status && ['active', 'suspended'].includes(status)) {
    updates.status = status as any;
  }
  if (typeof isVerified === 'boolean') {
    updates.isVerified = isVerified;
  }

  const updatedUser = db.updateUser(usn.toUpperCase(), updates);

  res.json({ message: "Student account synchronized successfully", user: updatedUser });
});

// ==========================================
// VITE OR STATIC FRONTEND SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite Dev Mode server routing...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving build outputs for high deployment performance...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SHOT Application server boot active on: http://localhost:${PORT}`);
  });
}

startServer();
