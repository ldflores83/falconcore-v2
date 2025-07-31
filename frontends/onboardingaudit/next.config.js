/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '../uaylabs/out/onboardingaudit',
  assetPrefix: './',
  basePath: '',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig 