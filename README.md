# Car Parts E-commerce Platform

A modern e-commerce platform for automotive parts built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🚗 Automotive parts catalog with advanced search
- 🔐 User authentication and account management
- 🛒 Shopping cart and checkout system
- 📱 Responsive design for all devices
- ⚡ Fast and optimized performance
- 🔒 Secure payment processing

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (see [SETUP.md](./SETUP.md) for detailed configuration)

### Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
4. **Important**: Configure your environment variables following the [Setup Guide](./SETUP.md)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

> **Note**: For full functionality, you'll need to configure Supabase, Shopier payment gateway, and email settings. See [SETUP.md](./SETUP.md) for detailed instructions.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/          # Next.js app router pages
├── components/   # Reusable React components
├── hooks/        # Custom React hooks
├── lib/          # Configuration and utilities
├── services/     # API and business logic
├── types/        # TypeScript type definitions
└── utils/        # Helper functions
```

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

The app will automatically deploy on every push to the main branch.
