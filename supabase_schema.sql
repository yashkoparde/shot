-- =========================================================
-- SHOT (Student Hub Of Talent) Production Database Schema 
-- Dialect: PostgreSQL (Supabase Compatible)
-- =========================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. Create CUSTOM TYPES
create type user_role as enum ('student', 'admin');
create type account_status as enum ('active', 'suspended');
create type post_status as enum ('pending', 'approved', 'rejected');
create type reaction_type as enum ('like', 'dislike');
create type notification_type as enum ('like', 'comment', 'approval', 'rejection', 'featured');
create type media_type as enum ('image', 'video');

-- 2. Create TABLES

-- USERS TABLE
create table if not exists public.users (
    usn varchar(20) primary key, -- The primary identifier for students and admins
    username varchar(100) unique, -- Custom student handle
    phone_number varchar(50), -- Private mobile/verification number
    name varchar(255) not null,
    department varchar(100) not null,
    year varchar(50) not null,
    bio text default 'Ready to express and inspire at Student Hub Of Talent.',
    profile_picture text default 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    cover_image text default 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000',
    social_links jsonb default '{}'::jsonb,
    password_hash text not null, -- Raw encrypted client sync bcrypt/sha hash
    role user_role default 'student'::user_role,
    status account_status default 'active'::account_status,
    is_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- POSTS (Talents / Achievements / Flexes) TABLE
create table if not exists public.posts (
    id uuid default gen_random_uuid() primary key,
    usn varchar(20) references public.users(usn) on delete cascade not null,
    caption text not null,
    category varchar(100) not null,
    media_url text not null,
    media_type media_type default 'image'::media_type,
    status post_status default 'pending'::post_status not null,
    rejection_reason text,
    is_featured boolean default false not null,
    likes_count integer default 0 not null,
    comments_count integer default 0 not null,
    talent_score integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LIKES & REACTIONS TABLE (Allows likes or dislikes, enforces unique user feedback)
create table if not exists public.likes (
    id uuid default gen_random_uuid() primary key,
    post_id uuid references public.posts(id) on delete cascade not null,
    usn varchar(20) references public.users(usn) on delete cascade not null,
    type reaction_type default 'like'::reaction_type not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_post_user_reaction unique (post_id, usn)
);

-- COMMENTS TABLE
create table if not exists public.comments (
    id uuid default gen_random_uuid() primary key,
    post_id uuid references public.posts(id) on delete cascade not null,
    usn varchar(20) references public.users(usn) on delete cascade not null,
    text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTIFICATIONS TABLE
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    usn varchar(20) references public.users(usn) on delete cascade not null, -- Recipient
    title varchar(255) not null,
    content text not null,
    type notification_type not null,
    read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- =========================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH and LEADERBOARD
-- =========================================================

create index if not exists idx_users_role_status on public.users(role, status);
create index if not exists idx_posts_status_category on public.posts(status, category);
create index if not exists idx_posts_talent_score_desc on public.posts(talent_score desc);
create index if not exists idx_posts_usn on public.posts(usn);
create index if not exists idx_likes_post_user on public.likes(post_id, usn);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_notifications_usn_read on public.notifications(usn, read);


-- =========================================================
-- TRIGGERS TO CALCULATE TALENT SCORES AUTOMATICALLY
-- =========================================================

-- Function to re-calculate a post's likes and comments counts, and overall talent score
create or replace function public.recalculate_post_stats() 
returns trigger as $$
declare
    v_likes integer;
    v_comments integer;
    v_featured boolean;
    v_post_id uuid;
begin
    -- Determine which post ID needs re-evaluation
    if TG_OP = 'DELETE' then
        v_post_id := OLD.post_id;
    else
        v_post_id := NEW.post_id;
    end if;

    -- Count total positive likes
    select count(*) into v_likes from public.likes where post_id = v_post_id and type = 'like';
    -- Count comments
    select count(*) into v_comments from public.comments where post_id = v_post_id;
    -- Check if featured
    select is_featured into v_featured from public.posts where id = v_post_id;

    -- Update post metrics. Talent Score Formula: Likes * 2 + Comments * 3 + (Featured * 10)
    update public.posts
    set 
        likes_count = v_likes,
        comments_count = v_comments,
        talent_score = (v_likes * 2) + (v_comments * 3) + (case when is_featured then 10 else 0 end)
    where id = v_post_id;

    return null;
end;
$$ language plpgsql security definer;

-- Trigger on likes adjustments
create trigger trigger_likes_count_change
after insert or update or delete on public.likes
for each row execute function public.recalculate_post_stats();

-- Trigger on comments adjustments
create trigger trigger_comments_count_change
after insert or delete on public.comments
for each row execute function public.recalculate_post_stats();


-- Function to update score when post featured status changes
create or replace function public.recalculate_featured_post_score()
returns trigger as $$
begin
    if NEW.is_featured <> OLD.is_featured then
        NEW.talent_score := (NEW.likes_count * 2) + (NEW.comments_count * 3) + (case when NEW.is_featured then 10 else 0 end);
    end if;
    return NEW;
end;
$$ language plpgsql;

create trigger trigger_posts_featured_status_change
before update of is_featured on public.posts
for each row execute function public.recalculate_featured_post_score();


-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;

-- 1. USERS POLICIES
-- Anyone can see basic user records (to show profiles/scores in hub)
create policy "Enable read access for all authenticated profiles" 
on public.users for select 
using (true);

-- Users can only adjust their own profile detail keys
create policy "Enable update of own user stats" 
on public.users for update
using (auth.jwt() ->> 'sub' = usn)
with check (auth.jwt() ->> 'sub' = usn);

-- Allowed signup profiles
create policy "Enable custom onboarding insertion"
on public.users for insert
with check (true);

-- 2. POSTS POLICIES
-- Students can only read approved postings OR their own pending creations
create policy "Students can view approved feed or own posts" 
on public.posts for select 
using (
    status = 'approved' 
    or usn = (auth.jwt() ->> 'sub') 
    or (select role from public.users where usn = (auth.jwt() ->> 'sub')) = 'admin'
);

-- Students can insert posts (draft pending moderator sanction)
create policy "Students can submit new talent posts" 
on public.posts for insert 
with check (
    usn = (auth.jwt() ->> 'sub') 
    and status = 'pending'
);

-- Admins carry full access to update or moderate posts
create policy "Admins have full write control on posts"
on public.posts for all
using ((select role from public.users where usn = (auth.jwt() ->> 'sub')) = 'admin')
with check ((select role from public.users where usn = (auth.jwt() ->> 'sub')) = 'admin');

-- 3. LIKES & REACTIONS POLICIES
create policy "Authenticated users can read reactions"
on public.likes for select
using (true);

create policy "Users can react to posts"
on public.likes for insert
with check (usn = (auth.jwt() ->> 'sub'));

create policy "Users can undo reactions"
on public.likes for delete
using (usn = (auth.jwt() ->> 'sub'));

-- 4. COMMENTS POLICIES
create policy "Anyone can read comments"
on public.comments for select
using (true);

create policy "Students can post comments"
on public.comments for insert
with check (usn = (auth.jwt() ->> 'sub'));

create policy "Students can delete their own comments"
on public.comments for delete
using (usn = (auth.jwt() ->> 'sub'));

-- 5. NOTIFICATIONS POLICIES
create policy "Users can view their own notification inbox"
on public.notifications for select
using (usn = (auth.jwt() ->> 'sub'));

create policy "Users can read/update their notification states"
on public.notifications for update
using (usn = (auth.jwt() ->> 'sub'))
with check (usn = (auth.jwt() ->> 'sub'));
