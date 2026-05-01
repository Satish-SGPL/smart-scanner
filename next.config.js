/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  // Suppress noisy "Resolving ... ignored for this path" webpack cache warnings
  // that flood the terminal in dev mode on Windows.
  webpack: (config, { dev }) => {
    if (dev) {
      config.infrastructureLogging = { level: 'error' }
    }
    return config
  },
  // Allow images served from the local public folder + any data: URIs we generate
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
