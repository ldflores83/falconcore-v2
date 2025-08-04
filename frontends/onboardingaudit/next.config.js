/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '../uaylabs/out/onboardingaudit',
  assetPrefix: '/onboardingaudit',
  basePath: '',
  images: {
    unoptimized: true
  },
  // Configurar para generar archivos con nombres específicos
  generateBuildId: async () => {
    return 'onboardingaudit'
  }
}

module.exports = nextConfig 