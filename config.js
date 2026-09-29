// config.js
module.exports = {
  // Masukkan Personal Access Token GitHub Anda (centang akses repo)
  githubToken: process.env.GITHUB_TOKEN || "GANTI_DENGAN_TOKEN_GITHUB_BARU",

  // Data repositori izin IP
  githubOwner: "DIN-STORE",
  githubRepo: "izin",
  githubFile: "ip",
  githubBranch: "main",

  // Link file script autoscript utama yang ingin di-proxy/disembunyikan
  setupRawUrl: "https://raw.githubusercontent.com/DIN-STORE/VIP/main/setup.sh"
};
