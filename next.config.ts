import type { NextConfig } from "next";
import { PAGE_MERGES } from "./src/lib/data/page-merges";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    // Restrict content sources; adjust CDN/font origins as needed.
    // `unsafe-inline` is required for Tailwind's runtime styles in dev.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://www.clarity.ms https://scripts.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' https://cdn.sanity.io",
      "connect-src 'self' https://api.sanity.io https://cdn.sanity.io https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://open.er-api.com https://www.clarity.ms https://*.clarity.ms",
      "frame-src https://www.youtube.com https://youtube.com https://www.google.com https://maps.google.com",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb", // allow large property/blog images (default is 4MB)
    },
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    localPatterns: [
      { pathname: "/properties/**", search: "" },
      { pathname: "/images/**", search: "" },
      { pathname: "/blog/**", search: "" },
      { pathname: "/logo.png", search: "" },
      { pathname: "/logo-icon.png", search: "" },
      { pathname: "/media/**", search: "" },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "www.pikorua.in",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/webp"],
    qualities: [40, 60, 75],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/logo.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/logo-icon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // /app/sitemap/[id]/route.ts had to move to /app/xml-sitemap/[id]/route.ts
      // because Next.js reserves the "sitemap" folder name for its own sitemap
      // metadata-route convention, which collided with the sibling sitemap.ts
      // file. This rewrite keeps the public /sitemap/*.xml URLs unchanged.
      {
        source: "/sitemap/:id",
        destination: "/xml-sitemap/:id",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "pikorua.in",
          },
        ],
        destination: "https://www.pikorua.in/:path*",
        permanent: true,
      },
      {
        // Ikebana: corrected configuration/size, old slug embedded outdated figures
        source: "/properties/4-5-bhk-penthouse-duplex-7300-15500-sindhu-bhavan",
        destination: "/properties/5-bhk-3300-6300-sindhu-bhavan",
        permanent: true,
      },
      {
        // Consolidated: cannibalized /luxury-property-consultant-ahmedabad and
        // /real-estate-consultant-ahmedabad for the same consultant intent.
        source: "/luxury-real-estate-consultants-ahmedabad",
        destination: "/luxury-property-consultant-ahmedabad",
        permanent: true,
      },
      {
        // Consolidated: cannibalized /luxury-real-estate-ahmedabad and
        // /luxury-homes-ahmedabad for the same umbrella-category intent.
        source: "/luxury-property-ahmedabad",
        destination: "/luxury-real-estate-ahmedabad",
        permanent: true,
      },
      {
        // Consolidated into the new, richer /locations/[slug] location network page.
        source: "/sindhu-bhavan-road-properties",
        destination: "/locations/sindhu-bhavan",
        permanent: true,
      },
      {
        source: "/iscon-ambli-road-properties",
        destination: "/locations/iskon-ambli",
        permanent: true,
      },
      {
        source: "/thaltej-properties",
        destination: "/locations/thaltej",
        permanent: true,
      },
      {
        source: "/sg-highway-properties",
        destination: "/locations/sg-highway",
        permanent: true,
      },
      {
        source: "/vastrapur-properties",
        destination: "/locations/vastrapur",
        permanent: true,
      },
      // Duplicate automated blog posts about the same story, merged into one
      // post each (30 Oct 2026). The duplicates are also set Inactive in the DB.
      { source: "/blog/million-minds-tech-city-ahmedabad-luxury-real-estate-sw7m", destination: "/blog/million-minds-tech-city-ahmedabad-luxury-real-estate", permanent: true },
      { source: "/blog/ahmedabad-million-minds-tech-city-luxury-real-estate", destination: "/blog/million-minds-tech-city-ahmedabad-luxury-real-estate", permanent: true },
      { source: "/blog/ahmedabad-luxury-housing-venus-group-universe", destination: "/blog/the-universe-venus-group-ahmedabad-luxury", permanent: true },
      { source: "/blog/ahmedabad-luxury-real-estate-infrastructure-demand", destination: "/blog/ahmedabad-luxury-real-estate-infrastructure-growth", permanent: true },
      { source: "/blog/resset-group-south-bopal-acquisition-ahmedabad-luxury-property", destination: "/blog/south-bopal-resset-group-land-acquisition-ahmedabad-luxury-market", permanent: true },
      { source: "/blog/ahmedabad-cwg-gift-city-luxury-real-estate", destination: "/blog/ahmedabad-commonwealth-games-luxury-real-estate", permanent: true },
      { source: "/blog/ahmedabad-luxury-property-market-2026-growth-outlook", destination: "/blog/ahmedabad-luxury-real-estate-boom-2026-hni-nri", permanent: true },
      {
        // Linked from published AI-drafted blog posts (old drafting prompt).
        source: "/shilaj-properties",
        destination: "/locations/shilaj",
        permanent: true,
      },
      {
        source: "/penthouses-duplexes-ahmedabad",
        destination: "/penthouses-ahmedabad",
        permanent: true,
      },
      {
        source: "/luxury-penthouses-ahmedabad",
        destination: "/penthouses-ahmedabad",
        permanent: true,
      },
      {
        source: "/nri-investment-ahmedabad",
        destination: "/nri-property-investment-ahmedabad",
        permanent: true,
      },
      {
        source: "/nri/nri-property-consultant-ahmedabad",
        destination: "/nri-property-consultant-ahmedabad",
        permanent: true,
      },
      {
        source: "/property-types/residential-plots-ahmedabad",
        destination: "/luxury-plots-ahmedabad",
        permanent: true,
      },
      {
        source: "/property-types/luxury-residential-investment-ahmedabad",
        destination: "/investment-property-ahmedabad",
        permanent: true,
      },
      {
        source: "/villas-bungalows-ahmedabad",
        destination: "/luxury-villas-ahmedabad",
        permanent: true,
      },
      {
        source: "/buy-property-in-ahmedabad-from-abroad",
        destination: "/learn/how-to-buy-property-as-nri-ahmedabad",
        permanent: true,
      },
      {
        source: "/nri-property-legal-process-india",
        destination: "/learn/how-to-buy-property-as-nri-ahmedabad",
        permanent: true,
      },
      {
        source: "/nri/buy-property-in-ahmedabad-from-abroad",
        destination: "/learn/how-to-buy-property-as-nri-ahmedabad",
        permanent: true,
      },
      {
        source: "/nri/nri-property-purchase-process-india",
        destination: "/learn/how-to-buy-property-as-nri-ahmedabad",
        permanent: true,
      },
      {
        source: "/nri/nri-property-management-ahmedabad",
        destination: "/property-management-for-nris",
        permanent: true,
      },
      {
        source: "/nri/buy-property-in-ahmedabad-from-canada",
        destination: "/nri-property-from-canada",
        permanent: true,
      },
      {
        source: "/nri/buy-property-in-ahmedabad-from-australia",
        destination: "/nri-property-from-australia",
        permanent: true,
      },
      // Duplicate pages merged into one page per search intent (31 Oct 2026).
      ...Object.entries(PAGE_MERGES).map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
  // Silence workspace-root detection warning when pnpm-lock exists at a parent level
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
