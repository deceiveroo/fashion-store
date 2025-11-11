/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ 1. Убираем `domains` — deprecated. Оставляем только `remotePatterns`
  images: {
    remotePatterns: [
      // Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Google profile pics
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      // Local dev uploads (http://localhost:3000/uploads/...)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      // picsum.photos, placeholder.com и др.
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },

  // ✅ 2. `eslint` больше не поддерживается в next.config.js → выносим в .eslintrc.json
  // УДАЛЯЕМ весь блок `eslint: { ... }`

  // ✅ 3. `experimental.serverComponentsExternalPackages` → переименован в `serverExternalPackages`
  // и вынесен на корневой уровень (не в experimental!)
  serverExternalPackages: ['@libsql/client'],

  // ✅ 4. `experimental` можно убрать, если больше ничего не используешь
  // (если используешь что-то новое — оставь, но без serverComponentsExternalPackages)

  typescript: {
    ignoreBuildErrors: false,
  },

  // ✅ 5. `rewrites()` — остаётся как есть, если нужно проксировать `/uploads`
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*', // ← убедись, что папка `uploads` лежит в `public/`
      },
    ];
  },
};

module.exports = nextConfig;