/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['s.gravatar.com', 'cdn.auth0.com', 'picsum.photos'], // Ensure picsum.photos is included
  },
};

module.exports = nextConfig;
