// config.js

module.exports = {
  // ==========================================
  // CLOUDFLARE (AUTO SUBDOMAIN POINTING)
  // ==========================================
  cfApiToken: "9iVNTdHbenbpQrZoXAvDhJT6bw3HS8brc_ILS-YO",
  cfZoneId: "4c664f5cf41229ec3b2426ad5c5d53bb",
  cfDomain: "dinn.my.id",

  // ==========================================
  // GITHUB (IZIN IP LISENSI)
  // ==========================================
  githubToken: process.env.GITHUB_TOKEN || "",
  githubOwner: "DIN-STORE",
  githubRepo: "izin",
  githubFile: "ip",
  githubBranch: "main",

  // Link script bash asli yang di-proxy
  setupRawUrl: "https://raw.githubusercontent.com/DIN-STORE/VIP/main/setup.sh"
};
