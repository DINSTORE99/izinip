// api/ip.js
const config = require("../config");

module.exports = async (req, res) => {
  // Izinkan request CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const token = config.githubToken;
  const owner = config.githubOwner;
  const repo = config.githubRepo;
  const path = config.githubFile;
  const branch = config.githubBranch || "main";

  const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Vercel-IP-Manager"
  };

  try {
    // 1. Ambil data file IP saat ini dari GitHub
    const getRes = await fetch(githubApiUrl, { headers });
    if (!getRes.ok) {
      return res.status(getRes.status).json({
        success: false,
        message: `Gagal membaca GitHub: ${getRes.statusText}`
      });
    }

    const fileData = await getRes.json();
    const sha = fileData.sha;
    // Decode base64 dari GitHub ke teks biasa
    const rawContent = Buffer.from(fileData.content, "base64").toString("utf-8");

    // METODE GET: Mengambil daftar IP untuk ditampilkan di web dashboard
    if (req.method === "GET") {
      return res.status(200).json({
        success: true,
        sha: sha,
        rawContent: rawContent
      });
    }

    // METODE POST: Menyimpan / Mengupdate isi file izin IP di GitHub
    if (req.method === "POST") {
      const { newContent, message } = req.body || {};

      if (typeof newContent !== "string") {
        return res.status(400).json({
          success: false,
          message: "Format payload tidak valid (newContent harus berupa string)"
        });
      }

      // Encode teks kembali ke base64 untuk GitHub API
      const updatedBase64 = Buffer.from(newContent, "utf-8").toString("base64");

      const updateRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            message: message || "Update izin IP via Web Dashboard",
            content: updatedBase64,
            sha: sha,
            branch: branch
          })
        }
      );

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        return res.status(updateRes.status).json({
          success: false,
          message: updateData.message || "Gagal update file di GitHub"
        });
      }

      return res.status(200).json({
        success: true,
        message: "File IP di GitHub berhasil diperbarui!",
        data: updateData
      });
    }

    return res.status(405).json({ message: "Metode tidak diizinkan" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Terjadi error server: ${error.message}`
    });
  }
};
