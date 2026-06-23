# SHOT (Student Hub Of Talent) Deployment & Configuration Guide

This guide details the integration parameters, environment setup, and security controls needed to deploy SHOT in a production environment (such as Vercel + Supabase).

---

## 1. Database Setup (Supabase)

To link the Student Hub Of Talent application to a production PostgreSQL database hosted on Supabase:

1. **Create Project**: Sign in to the [Supabase Dashboard](https://supabase.com) and create a brand new project.
2. **Execute Database DDL Script**: 
   - Navigate to the **SQL Editor** tab on the left sidebar.
   - Click **New Query**.
   - Copy the entire contents of the `/supabase_schema.sql` file generated in the workspace root and paste it into the editor.
   - Click **Run** to execute the script. This compiles:
     - Enums (`user_role`, `post_status`, `reaction_type`, etc.)
     - Table schemas (`users`, `posts`, `likes`, `comments`, `notifications`)
     - Complete indexes for leaderboard querying speed
     - Database triggers to automatically adjust talent scores and likes/comments counts
     - Active Row Level Security (RLS) tables and network verification policies.

---

## 2. Authentication Configuration (Supabase Auth)

SHOT uses **USN** (University Seat Number) as the primary identifier instead of typical email addresses, combined with standard password validation:

1. In Supabase, navigate to **Project Settings > Authentication**.
2. Go to **Providers** and make sure **Email** is enabled.
3. Because USNs act as unique primary keys, SHOT's Express or client gateway maps `USN` inputs securely. If you want email verification bypassed for instant private campus rollouts, **Disable "Confirm Email"** inside the email provider configuration. This triggers frictionless onboarding!

---

## 3. Environment Variables Configuration

Create a production `.env` file or bind these environment variables inside your serverless host (such as Vercel, Render, or Google Cloud Run):

```env
# ==========================================
# Server Configuration
# ==========================================
NODE_ENV=production
PORT=3000
APP_URL="https://shot-talent.vercel.app"

# ==========================================
# Gemini AI Configuration (Server-Side Secret)
# ==========================================
# Required for generating post categorization recommendations, and 
# automated safety checks on student captions on the moderation queue.
GEMINI_API_KEY="AIzaSyYourProductionGeminiKeyGoesHere"

# ==========================================
# Supabase Backend Configuration (If swapping away from on-disk sqlite mock)
# ==========================================
SUPABASE_URL="https://your-supabase-id.supabase.co"
SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-high-clearance-secret-service-role-key"
```

---

## 4. Deploying Frontend and Backend

### A. Vercel / Cloud Run (Full-Stack Deployment)
Since this is a full-stack node application packing both Vite (React Client) and Express server endpoints:

1. Import your project code into Vercel or your Docker/Cloud Run workspace.
2. Configure the build scripts inside Vercel or package settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start` (points to `node dist/server.cjs`)
3. Add the environment variables specified in Section 3.
4. Deploy!

### B. Directory Compiles
- `/dist`: Stores compiled HTML/JS/CSS client-side bundle.
- `/dist/server.cjs`: Self-contained compiled server bundle constructed by `esbuild` for ultra-fast startup times without node ES resolution failures.
