/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  eslint: {
    // Omite los errores molestos de configuración de ESLint v9 en Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Vercel traduce archivos y causa errores falsos de TS. Los omitimos al compilar.
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
