/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Dev Image Origin
        protocol: "https",
        hostname: "pub-a283f879c0a849a49b18818c5533e267.r2.dev",
        port: "",
        pathname: "/**",
      },
      {
        // Prod Image Origin
        protocol: "https",
        hostname: "pub-aab205bc4ae24bca977e05a1c5b36628.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
