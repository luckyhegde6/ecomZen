# ecomZen

[![Netlify Status](https://api.netlify.com/api/v1/badges/ecomzen/deploy-status)](https://app.netlify.com/sites/ecomzen/deploys)
[**Live Demo**](https://ecomzen.netlify.app)

A production-ready E-commerce starter built with Next.js, TypeScript, Tailwind CSS, and Prisma/PostgreSQL. Designed for performance, scalability, and developer experience.

## Overview

ecomZen is a modern e-commerce solution that includes:
- **Storefront**: Responsive product browsing, cart management, and checkout.
- **Admin Panel**: Product management (CRUD), order viewing, and dashboard.
- **Authentication**: Secure user and admin access via NextAuth.
- **Database**: Robust data modeling with Prisma and PostgreSQL.

## Architecture

The project follows a modular and scalable architecture:

- **Frontend**: Next.js (App Router & Pages Router hybrid) for server-side rendering and static generation.
- **Styling**: Tailwind CSS for rapid, utility-first UI development.
- **Backend**: Next.js API Routes handling business logic and database interactions.
- **Database**: PostgreSQL managed via Prisma ORM for type-safe database access.
- **Deployment**: Configured for seamless deployment on Netlify with CI/CD capabilities.

## Local Setup Guide

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL installed and running locally, or a cloud instance (e.g., Supabase, Neon)
- npm, pnpm, or yarn

### 2. Clone and Install
```bash
git clone https://github.com/luckyhegde6/ecomZen.git
cd ecomZen
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory. You can copy the example:
```bash
cp .env.example .env
```
Ensure your `.env` contains the following (update values as needed):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecomzen"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-it"
```

### 4. Database Setup
Initialize the database schema:
```bash
npx prisma generate
npx prisma migrate dev --name init
```
(Optional) Seed the database if a seed script is available:
```bash
npm run seed
```

### 5. Run Development Server
Start the application:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.
Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

### 6. Build for Production
To verify the production build locally:
```bash
npm run build
npm start
```

## Deployment

This project is configured for easy deployment on **Netlify**.

1.  Connect your GitHub repository to Netlify.
2.  Set the `DATABASE_URL` and `NEXTAUTH_SECRET` in Netlify's **Site settings > Environment variables**.
3.  The `netlify.toml` file handles the build configuration automatically.

## Project Layout
```
/app          # Next.js App Router components (Admin, API)
/pages        # Next.js Pages Router (Storefront legacy/hybrid)
/components   # Reusable UI components
/lib          # Utilities (Prisma client, helpers)
/prisma       # Database schema and migrations
/public       # Static assets
/styles       # Global styles and Tailwind config
```