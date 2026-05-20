import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    '@base-ui/react',
    '@dnd-kit/core',
    '@dnd-kit/sortable',
    '@dnd-kit/utilities',
    '@supabase/ssr',
    '@supabase/supabase-js',
    'class-variance-authority',
    'clsx',
    'lucide-react',
    'tailwind-merge',
  ],
};

export default nextConfig;
