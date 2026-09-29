// config.js

module.exports = {
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
