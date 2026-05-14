/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Proxy all API routes to the Express backend
      { source: '/auth/:path*', destination: 'http://localhost:4000/auth/:path*' },
      { source: '/cards/:path*', destination: 'http://localhost:4000/cards/:path*' },
      { source: '/buy', destination: 'http://localhost:4000/buy' },
      { source: '/buyer/:path*', destination: 'http://localhost:4000/buyer/:path*' },
      { source: '/seller/:path*', destination: 'http://localhost:4000/seller/:path*' },
      { source: '/exchange-rates', destination: 'http://localhost:4000/exchange-rates' },
      { source: '/health', destination: 'http://localhost:4000/health' },
      { source: '/download/:path*', destination: 'http://localhost:4000/download/:path*' },
      { source: '/alchemy-webhook', destination: 'http://localhost:4000/alchemy-webhook' },
      { source: '/uploads/:path*', destination: 'http://localhost:4000/uploads/:path*' },
      // Admin REST API routes (not the AdminJS panel itself)
      { source: '/admin/cards/:path*', destination: 'http://localhost:4000/admin/cards/:path*' },
      { source: '/admin/refund', destination: 'http://localhost:4000/admin/refund' },
      { source: '/admin/add-card', destination: 'http://localhost:4000/admin/add-card' },
      { source: '/admin/profit/:path*', destination: 'http://localhost:4000/admin/profit/:path*' },
    ];
  },
};

export default nextConfig;
