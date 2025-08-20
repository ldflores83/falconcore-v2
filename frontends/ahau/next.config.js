/** @type {import('next').Config} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '../uaylabs/out/ahau',
  assetPrefix: './',
  basePath: '',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
