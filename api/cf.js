// api/cf.js
const config = require("../config");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Metode tidak diizinkan" });
  }

  const { subName, targetIp } = req.body || {};

  const apiToken = (config.cfApiToken || "").trim();
  const zoneId   = (config.cfZoneId || "").trim();
  const domain   = (config.cfDomain || "").trim();

  if (!apiToken || !zoneId || !domain) {
    return res.status(500).json({
      success: false,
      message: "Data Cloudflare di config.js belum lengkap!"
    });
  }

  if (!subName || !targetIp) {
    return res.status(400).json({
      success: false,
      message: "Subdomain dan IP target wajib diisi!"
    });
  }

  // Format subdomain hanya alphanumeric dan dash
  const cleanSub = subName.toLowerCase().replace(/[^a-z0-9-_]/g, "");
  const fullDomain = `${cleanSub}.${domain}`;

  try {
    const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "A",
        name: cleanSub,
        content: targetIp.trim(),
        ttl: 1,        // Auto TTL
        proxied: false // Grey Cloud (DNS Only)
      })
    });

    const cfData = await cfRes.json();

    if (!cfRes.ok || !cfData.success) {
      const errDetail = cfData.errors?.[0]?.message || "Gagal membuat DNS record";
      return res.status(400).json({
        success: false,
        message: `${errDetail} (status: ${cfRes.status})`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subdomain berhasil dibuat di Cloudflare!",
      subdomain: fullDomain,
      ip: targetIp
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error Cloudflare: ${error.message}`
    });
  }
};
