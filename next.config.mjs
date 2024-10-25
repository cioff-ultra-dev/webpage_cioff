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
    ],
  },
};

export default withNextIntl(nextConfig);
