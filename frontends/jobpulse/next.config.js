/** @type {import('next').Config} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '../uaylabs/out/jobpulse',
  assetPrefix: './',
  basePath: '',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig 