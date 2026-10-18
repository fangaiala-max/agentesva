# Social images and favicon

The Gemini social identity uses a pale background for commercial pages and a midnight background for studies, guides and news. Every indexable static page has its own English or Spanish 1200×630 PNG, titled from the page metadata. Article images, Open Graph and Twitter share the same URL; article body illustrations remain unchanged.

`src/lib/social-image.mjs` derives a URL from the normalized route, title and design version. Changing the title creates a new URL. Bump `SOCIAL_IMAGE_VERSION` when changing the template so shared previews request a new image.

`npm run build` renders Astro HTML, then runs `scripts/generate-social-images.mjs`. Cards are generated into Vercel static output, `dist/client` and the ignored `public/social/og` directory (for local development after the first build). `scripts/verify-social-images.mjs` verifies referenced files, dimensions, alt text, Twitter parity and article schema parity before the existing SEO checks. No image generation API is called during builds. Sharp is a direct dev dependency.

The EN and ES home cards also refresh `public/brand/og-en.png` and `public/og.png` as generic fallbacks for noindex/server-rendered delivery pages. These public aliases remain versioned for availability before a build. Per-page output is generated, not committed. The manifest in `.vercel/output/static/social/og/manifest.json` lists each card and route.

The favicon artwork was created with image generation and saved as `public/brand/social-mark.png`. Its exported sizes are `favicon.png` (32×32) and `apple-touch-icon.png` (180×180). `favicon.svg` embeds a 128×128 version of the same artwork. The icon URLs use `?v=gemini-2` to refresh browser caches. The header logo is unchanged; the heavier social monogram is intended for tiny icons and sharing previews.

Validation does not force social platforms to invalidate an already cached preview. After deployment, inspect representative shared URLs in the platforms' preview tools when necessary.
