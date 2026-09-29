// api/ip.js
const config = require("../config");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Prioritaskan Environment Variable Vercel, jika kosong baru ambil dari config.js
  const token = (process.env.GITHUB_TOKEN || config.githubToken || "").trim();
  const owner = (process.env.GITHUB_OWNER || config.githubOwner || "DIN-STORE").trim();
  const repo = (process.env.GITHUB_REPO || config.githubRepo || "izin").trim();
  const path = (process.env.GITHUB_FILE || config.githubFile || "ip").trim();
  const branch = (process.env.GITHUB_BRANCH || config.githubBranch || "main").trim();

  // VALIDASI AWAL: Cek apakah token terbaca atau kosong
  if (!token || token.includes("GANTI_DENGAN")) {
    return res.status(401).json({
      success: false,
      message: "Token GitHub kosong atau belum diset! Silakan pasang GITHUB_TOKEN di Environment Variables Vercel."
    });
  }

  const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "Vercel-IP-Manager"
  };

  try {
    const getRes = await fetch(githubApiUrl, { headers });
    const fileData = await getRes.json();

    if (!getRes.ok) {
      return res.status(getRes.status).json({
        success: false,
        message: `GitHub Menolak (${getRes.status}): ${fileData.message || getRes.statusText}`
      });
    }

    const sha = fileData.sha;
    const rawContent = Buffer.from(fileData.content, "base64").toString("utf-8");

    if (req.method === "GET") {
      return res.status(200).json({
        success: true,
        sha: sha,
        rawContent: rawContent
      });
    }

    if (req.method === "POST") {
      const { newContent, message } = req.body || {};

      if (typeof newContent !== "string") {
        return res.status(400).json({
          success: false,
          message: "Format newContent tidak valid"
        });
      }

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
      message: `Server Error: ${error.message}`
    });
  }
};
