export interface User {
  usn: string;
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
  role: 'student' | 'admin';
  status: 'active' | 'suspended';
  isVerified?: boolean;
  username?: string;
  phone_number?: string;
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

export type FeedTab = 'Feed' | 'Leaderboard' | 'Profile' | 'Notifications';
