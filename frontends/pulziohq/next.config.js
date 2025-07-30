/** @type {import('next').Config} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '../uaylabs/out/pulziohq',
  assetPrefix: './',
  basePath: '',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig 