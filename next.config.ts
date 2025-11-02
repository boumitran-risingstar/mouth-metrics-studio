import type {NextConfig} from 'next';
import 'dotenv/config';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '2mb',
  },
  env: {
    NEXT_PUBLIC_USERS_SERVICE_HOST: 'http://127.0.0.1:8080',
    NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY: '6LdoDP8rAAAAANHO6ZG9lL37BeJGMipoj5NWgCCb',
  }
};

export default nextConfig;
