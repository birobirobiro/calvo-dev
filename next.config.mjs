/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'replicate.delivery',
          port: '',
          pathname: '/pbxt/**',
        },
      ],
    },
}
export default nextConfig;
