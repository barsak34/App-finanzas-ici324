/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Oculta el header 'X-Powered-By: Next.js' para no exponer la tecnologia del servidor

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Proteccion contra ataques de Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Evita que los navegadores interpreten tipos MIME incorrectos
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Restringe accesos a APIs del dispositivo
          },
        ],
      },
    ];
  },
};

export default nextConfig;
