// config.js

module.exports = {

  // ==========================================
  // CLOUDFLARE (DITARUH LANGSUNG DI GITHUB)
  // ==========================================
  cfApiToken: "9iVNTdHbenbpQrZoXAvDhJT6bw3HS8brc_ILS", // API Token Cloudflare (Izin: Zone.DNS)
  cfZoneId: "4c664f5cf41229ec3b2426ad5c5d53bb",             // Zone ID domain Anda di Cloudflare
  cfDomain: "dinn.my.id",   
  
  // Token murni diambil dari Environment Variable server Vercel (Aman 100%)
  githubToken: process.env.GITHUB_TOKEN || "",

  // Pengaturan repositori izin IP
  githubOwner: process.env.GITHUB_OWNER || "DIN-STORE",
  githubRepo: process.env.GITHUB_REPO || "izin",
  githubFile: process.env.GITHUB_FILE || "ip",
  githubBranch: process.env.GITHUB_BRANCH || "main",

  // Link file script autoscript yang ingin di-proxy/disembunyikan
  setupRawUrl: "https://raw.githubusercontent.com/DIN-STORE/VIP/main/setup.sh"
};
