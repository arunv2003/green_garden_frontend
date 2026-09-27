import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceImg = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\368f768c-7c7d-492d-a71c-f0b344740427\\green_garden_favicon_1790496268134.jpg';
const publicDir = path.resolve('public');
const appDir = path.resolve('app');

function createIco(buffers) {
  // buffers is array of { width, height, data (Buffer) }
  const count = buffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ico
  header.writeUInt16LE(count, 4); // count

  const entries = [];
  for (const b of buffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(b.width >= 256 ? 0 : b.width, 0);
    entry.writeUInt8(b.height >= 256 ? 0 : b.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(b.data.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += b.data.length;
  }

  return Buffer.concat([header, ...entries, ...buffers.map(b => b.data)]);
}

async function run() {
  console.log('Generating favicons for Green Garden...');

  // 1. Generate PNGs of various sizes
  const sizes = [
    { size: 16, name: 'favicon-16x16.png', dir: publicDir },
    { size: 32, name: 'favicon-32x32.png', dir: publicDir },
    { size: 48, name: 'favicon-48x48.png', dir: publicDir },
    { size: 180, name: 'apple-touch-icon.png', dir: publicDir },
    { size: 180, name: 'apple-icon.png', dir: appDir },
    { size: 192, name: 'android-chrome-192x192.png', dir: publicDir },
    { size: 512, name: 'android-chrome-512x512.png', dir: publicDir },
    { size: 512, name: 'icon.png', dir: appDir },
  ];

  const icoBuffers = [];

  for (const item of sizes) {
    // Create rounded rect mask with alpha channel
    const roundedCorners = Buffer.from(
      `<svg><rect x="0" y="0" width="${item.size}" height="${item.size}" rx="${Math.round(item.size * 0.22)}" ry="${Math.round(item.size * 0.22)}" fill="#fff"/></svg>`
    );

    const buf = await sharp(sourceImg)
      .resize(item.size, item.size, { fit: 'cover' })
      .ensureAlpha()
      .composite([{
        input: roundedCorners,
        blend: 'dest-in'
      }])
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();

    const outPath = path.join(item.dir, item.name);
    fs.writeFileSync(outPath, buf);
    console.log(`Created: ${outPath} (${item.size}x${item.size})`);

    if ([16, 32, 48].includes(item.size) && item.dir === publicDir) {
      icoBuffers.push({ width: item.size, height: item.size, data: buf });
    }
  }

  // 2. Generate multi-resolution .ico files
  const icoData = createIco(icoBuffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoData);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoData);
  console.log('Created multi-resolution favicon.ico for public/ and app/');

  // 3. Generate clean vector SVG favicon
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="tealGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0d9488" />
      <stop offset="60%" stop-color="#14b8a6" />
      <stop offset="100%" stop-color="#2dd4bf" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#059669" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Rounded App Icon Background -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)" />
  <rect x="6" y="6" width="500" height="500" rx="122" stroke="#334155" stroke-width="2" fill="none" opacity="0.4" />

  <!-- Green Garden Emblem (Leaf + Architectural Structure) -->
  <g filter="url(#glow)">
    <!-- Organic Garden Leaf Curve (Left side) -->
    <path
      d="M256 96 C190 96 140 148 140 220 C140 286 182 344 246 364 C220 334 212 284 228 240 C242 202 272 176 304 156 C288 136 274 116 256 96 Z"
      fill="url(#leafGrad)"
    />
    <!-- Interior Leaf Rib Detail -->
    <path
      d="M208 270 C220 220 256 180 290 156 C272 196 256 244 244 290"
      stroke="#a7f3d0"
      stroke-width="8"
      stroke-linecap="round"
      opacity="0.6"
    />
    <!-- Architectural / Building Line Art forming "G" and Haven (Right side) -->
    <path
      d="M276 136 L348 136 L348 240 L378 214 L378 300 C378 348 338 384 284 384 C210 384 156 324 156 248 C156 220 166 192 182 170 C168 194 160 222 160 250 C160 316 208 368 274 368 C334 368 362 328 362 290 L362 260 L308 260 L308 224 L332 224 L332 152 L276 152 Z"
      fill="url(#tealGrad)"
    />
    <!-- Core Sparkle / Accent dot -->
    <circle cx="348" cy="180" r="10" fill="#6ee7b7" />
  </g>
</svg>
`;

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent, 'utf8');
  console.log('Created vector favicon.svg and app/icon.svg');

  // 4. Web App Manifest
  const manifest = {
    name: "Green Garden Management System",
    short_name: "Green Garden",
    description: "Enterprise Room, Guest, Stay, Monthly Billing & Payment Management System",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#059669",
    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };

  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  console.log('Created site.webmanifest');
  console.log('All favicon assets generated successfully!');
}

run().catch(console.error);
