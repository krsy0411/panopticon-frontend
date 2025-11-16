import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // AWS Amplify 배포 최적화

  // 외부 이미지 호스트 허용 (GitHub, Google 프로필 이미지)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
