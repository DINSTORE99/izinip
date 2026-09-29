// api/setup.sh.js
const config = require("../config");

module.exports = async (req, res) => {
  try {
    const response = await fetch(config.setupRawUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Vercel-Proxy)"
      }
    });

    if (!response.ok) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(response.status).send(`echo "Error: Gagal mengambil setup script (${response.status})"\nexit 1`);
    }

    const scriptBody = await response.text();

    // Set header agar terminal VPS membacanya sebagai file bash murni
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).send(scriptBody);
  } catch (error) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).send(`echo "Error server Vercel: ${error.message}"\nexit 1`);
  }
};
