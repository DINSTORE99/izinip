// api/cf.js
const config = require("../config");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const apiToken = (config.cfApiToken || "").trim();
  const zoneId   = (config.cfZoneId || "").trim();
  const domain   = (config.cfDomain || "").trim();

  if (!apiToken || !zoneId || !domain) {
    return res.status(500).json({ success: false, message: "Kredensial Cloudflare belum lengkap di config.js" });
  }

  const cfHeaders = {
    "Authorization": `Bearer ${apiToken}`,
    "Content-Type": "application/json"
  };

  try {
    // GET: Ambil daftar / jumlah DNS Record A
    if (req.method === "GET") {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&per_page=100`, {
        headers: cfHeaders
      });
      const data = await response.json();
      if (!data.success) {
        return res.status(400).json({ success: false, message: "Gagal mengambil data dari Cloudflare" });
      }

      const records = data.result.map(r => ({
        id: r.id,
        name: r.name,
        subdomain: r.name.replace(`.${domain}`, ""),
        ip: r.content
      }));

      return res.status(200).json({
        success: true,
        count: records.length,
        domain: domain,
        records: records
      });
    }

    // POST: Buat Subdomain Baru
    if (req.method === "POST") {
      const { subName, targetIp } = req.body || {};
      if (!subName || !targetIp) {
        return res.status(400).json({ success: false, message: "Nama subdomain dan IP target wajib diisi!" });
      }

      const cleanSub = subName.toLowerCase().replace(/[^a-z0-9-_]/g, "");
      const fullDomain = `${cleanSub}.${domain}`;

      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
        method: "POST",
        headers: cfHeaders,
        body: JSON.stringify({
          type: "A",
          name: cleanSub,
          content: targetIp.trim(),
          ttl: 1,
          proxied: false
        })
      });
      const data = await response.json();

      if (!data.success) {
        const err = data.errors?.[0]?.message || "Gagal membuat subdomain";
        return res.status(400).json({ success: false, message: err });
      }

      return res.status(200).json({
        success: true,
        message: `Subdomain ${fullDomain} berhasil dibuat!`,
        subdomain: fullDomain,
        ip: targetIp
      });
    }

    // PUT: Ganti IP Subdomain yang Sudah Ada
    if (req.method === "PUT") {
      const { subName, newIp } = req.body || {};
      if (!subName || !newIp) {
        return res.status(400).json({ success: false, message: "Nama subdomain dan IP baru wajib diisi!" });
      }

      const cleanSub = subName.toLowerCase().replace(/[^a-z0-9-_]/g, "");
      const fullDomain = cleanSub.includes(domain) ? cleanSub : `${cleanSub}.${domain}`;

      // Cari ID DNS Record berdasarkan nama
      const checkRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${fullDomain}`, {
        headers: cfHeaders
      });
      const checkData = await checkRes.json();

      if (!checkData.success || !checkData.result.length) {
        return res.status(404).json({ success: false, message: `Subdomain ${fullDomain} tidak ditemukan di Cloudflare!` });
      }

      const recordId = checkData.result[0].id;

      // Update DNS Record
      const updateRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`, {
        method: "PUT",
        headers: cfHeaders,
        body: JSON.stringify({
          type: "A",
          name: cleanSub,
          content: newIp.trim(),
          ttl: 1,
          proxied: false
        })
      });
      const updateData = await updateRes.json();

      if (!updateData.success) {
        return res.status(400).json({ success: false, message: updateData.errors?.[0]?.message || "Gagal memperbarui IP" });
      }

      return res.status(200).json({
        success: true,
        message: `IP Subdomain ${fullDomain} berhasil diubah ke ${newIp}!`,
        subdomain: fullDomain,
        newIp: newIp
      });
    }

    return res.status(405).json({ success: false, message: "Metode tidak didukung" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};
