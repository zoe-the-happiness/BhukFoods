/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
    // The cook-sheet cron handler reads NotoSansBengali via fs.readFileSync.
    // Vercel's automatic file-tracing only picks up files referenced via
    // import; explicit fs reads need to be declared so they're shipped in
    // the function bundle.
    outputFileTracingIncludes: {
      "/api/cron/cook-sheet": ["./lib/cron/fonts/**"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "atbjnresahzomvmqrlef.supabase.co" },
      { protocol: "https", hostname: "ik.imagekit.io" },
    ],
  },
};

export default nextConfig;
