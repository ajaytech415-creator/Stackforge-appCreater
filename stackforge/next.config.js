/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Allow larger body for ZIP uploads (100MB)
  experimental: {
    serverComponentsExternalPackages: ['electron-builder', 'extract-zip', 'simple-git', 'archiver'],
  },
}
module.exports = nextConfig
