import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, "bcrypt"];
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qfxnhkzigxigyh5a.public.blob.vercel-storage.com",
        port: "",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
        port: "",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
  async headers() {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: allowedOrigin,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
