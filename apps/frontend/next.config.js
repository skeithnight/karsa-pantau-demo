/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@karsa/shared-types'],
  output: 'standalone',
};

module.exports = nextConfig;
