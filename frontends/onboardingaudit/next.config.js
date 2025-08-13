/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '../uaylabs/out/onboardingaudit',
  assetPrefix: '/onboardingaudit',
  basePath: '',
  
  // Optimizaciones de performance
  compress: true,
  poweredByHeader: false,
  
  // Optimizaciones de imágenes
  images: {
    unoptimized: true,
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Optimizaciones de compilación
  swcMinify: true,
  experimental: {
    // optimizeCss: true, // Deshabilitado temporalmente
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // Configurar para generar archivos con nombres específicos
  generateBuildId: async () => {
    return 'onboardingaudit'
  },
}

module.exports = nextConfig 