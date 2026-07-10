import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Initial state in-memory (kept as fallback only if Google APIs fail completely)
const fallbackMonthlyRecruitments = [
  { name: "Januari", count: 110 },
  { name: "Februari", count: 145 },
  { name: "Maret", count: 190 },
  { name: "April", count: 130 },
  { name: "Mei", count: 175 },
  { name: "Juni", count: 185 },
  { name: "Juli", count: 42 }
];

const fallbackMonthlyCoreMembers = [
  { name: "Januari", count: 5 },
  { name: "Februari", count: 8 },
  { name: "Maret", count: 12 },
  { name: "April", count: 15 },
  { name: "Mei", count: 16 },
  { name: "Juni", count: 18 },
  { name: "Juli", count: 8 }
];

// Helper to fetch and map data from google sheets
async function getGoogleSheetsData() {
  const urls = {
    rekrutmen: "https://script.google.com/macros/s/AKfycby7nMnbgTuz1X51Tqf2y11XtjkNoPcSOSLq__vBA5NFnwJEGTTGgpmV0Ki94IqEkOrV/exec",
    anggota: "https://script.google.com/macros/s/AKfycbwTt_fOOSyZQlXRzyHexE415SYmnrLbh79xdH5ILMafqLgiGkKa09zz-tFlUc8sDSlO/exec",
    kampus: "https://script.google.com/macros/s/AKfycbw-wxYQA_1mslzWM-V5YpQmlvOSOFjPwQvdRJxKwvf4iMbncGwnnzYxzhvxacznTelE/exec",
    agenda: "https://script.google.com/macros/s/AKfycbyJAv4rMhTMPPH4I85KXtS5bWoYe6-07434QqQ4OupqyDT0Jpv2F-Lb9ji8vwdPH9Us/exec"
  };

  try {
    const [recRaw, memRaw, camRaw, ageRaw] = await Promise.all([
      fetch(urls.rekrutmen).then(r => r.json()).catch(() => []),
      fetch(urls.anggota).then(r => r.json()).catch(() => []),
      fetch(urls.kampus).then(r => r.json()).catch(() => []),
      fetch(urls.agenda).then(r => r.json()).catch(() => [])
    ]);
    console.log("Fetched data from Google Sheets:");
    console.log(urls);

    // Filter active items (where row.nama is defined and not empty)
    const filterActive = (list: any[]) => {
      if (!Array.isArray(list)) return [];
      return list.filter(row => row && typeof row === "object" && row.nama && String(row.nama).trim() !== "");
    };

    const activeRecruitsRaw = filterActive(recRaw);
    const activeMembersRaw = filterActive(memRaw);
    const activeCampusesRaw = filterActive(camRaw);
    const activeAgendasRaw = filterActive(ageRaw);

    // MAPPINGS
    // 1. Recruits
    const mappedRecruits = activeRecruitsRaw.map((row: any, idx: number) => {
      const id = row.no ? `R-${String(row.no).padStart(2, "0")}` : `R-API-${idx + 1}`;
      const name = String(row.nama).trim();
      const campus = row.bidang ? String(row.bidang).trim() : "Belum Ditentukan";
      const status = row.status || (idx % 3 === 0 ? "Interview" : idx % 3 === 1 ? "Lolos Seleksi" : "Bootcamp");
      const channel = row.channel || row.saluran || (idx % 2 === 0 ? "Media Sosial" : "Kemitraan Kampus");
      const email = row.email || `${name.toLowerCase().replace(/\s+/g, "")}@gmail.com`;
      const date = row.tanggal || "2026-07-09";
      return { id, name, campus, status, channel, email, date };
    });

    // 2. Members
    const mappedMembers = activeMembersRaw.map((row: any, idx: number) => {
      const id = row.no ? `M-${String(row.no).padStart(2, "0")}` : `M-API-${idx + 1}`;
      const name = String(row.nama).trim();
      const role = row.bidang ? String(row.bidang).trim() : "Anggota Inti";
      const campus = row.kampus || row.universitas || "Institut Teknologi Bandung";
      const email = row.email || `${name.toLowerCase().replace(/\s+/g, "")}@kampus.ac.id`;
      const dateJoined = row.tanggal || "2026-07-09";
      return { id, name, role, campus, email, dateJoined };
    });

    // 3. Campuses
    const mappedCampuses = activeCampusesRaw.map((row: any, idx: number) => {
      const id = row.no ? `C-${String(row.no).padStart(2, "0")}` : `C-API-${idx + 1}`;
      const name = String(row.nama).trim();
      const status = row.bidang ? String(row.bidang).trim() : "Komunitas Aktif";
      const code = row.kode || name.split(" ").map((w: string) => w[0]).join("").toUpperCase().substring(0, 5);
      const recruits = Number(row.recruits || row.pendaftar || (idx * 15 + 40));
      const members = Number(row.members || row.anggota || (idx * 2 + 5));
      const joinedDate = row.tanggal || "2026-07-09";
      const coordinator = row.koordinator || "Koordinator Regional";
      return { id, name, code, recruits, members, status, joinedDate, coordinator };
    });

    // 4. Agendas
    const mappedAgendas = activeAgendasRaw.map((row: any, idx: number) => {
      const id = row.no ? `A-${String(row.no).padStart(2, "0")}` : `A-API-${idx + 1}`;
      const title = String(row.nama).trim();
      const category = row.bidang ? String(row.bidang).trim() : "Umum";
      const date = row.tanggal || "2026-07-15";
      const time = row.waktu || row.time || "09:00 - 12:00 WIB";
      const location = row.lokasi || row.location || "Daring";
      const description = row.deskripsi || row.description || `Kegiatan ${category} rekrutmen regional.`;
      const status = row.status || "Mendatang";
      const coordinator = row.koordinator || "Koordinator Regional";
      return { id, title, date, time, location, description, status, coordinator, category };
    });

    return {
      recruits: mappedRecruits,
      members: mappedMembers,
      campuses: mappedCampuses,
      agendas: mappedAgendas,
      isEmpty: mappedRecruits.length === 0 && mappedMembers.length === 0 && mappedCampuses.length === 0 && mappedAgendas.length === 0
    };
  } catch (error) {
    console.error("Error loading Google Sheets:", error);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Check Password
  app.post("/api/check-password", async (req, res) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: "Password wajib diisi." });
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbxZ0d7dgwKqGOEQsmn7_9bExeLO_MFO5AzO-B_AF71665wsx8UOnzzkZJmIoOzcx2Q1/exec");
      if (!response.ok) {
        throw new Error("Gagal mengambil data password dari Google Sheet.");
      }
      const data = await response.json();
      
      let isMatch = false;
      if (Array.isArray(data)) {
        isMatch = data.some((row: any) => {
          if (row && row.password) {
            return String(row.password).trim().toLowerCase() === String(password).trim().toLowerCase();
          }
          return Object.values(row).some((val: any) => {
            if (!val) return false;
            return String(val).trim().toLowerCase() === String(password).trim().toLowerCase();
          });
        });
      }

      // If the spreadsheet is empty or fails, fallback to default passwords for a smooth experience
      // const hasAnyValue = Array.isArray(data) && data.length > 0;
      // if (!hasAnyValue && (password === "rekrutmen2026" || password === "admin123" || password === "bismillah" || password === "IndonesiaAman")) {
      //   isMatch = true;
      // }

      // if (isMatch) {
      //   return res.json({ success: true, message: "Password cocok!" });
      // } else {
      //   return res.status(401).json({ success: false, message: "Password salah atau tidak terdaftar di spreadsheet." });
      // }
    } catch (error: any) {
      console.error("Password verify error:", error);
      // if (password === "rekrutmen2026" || password === "admin123" || password === "bismillah" || password === "IndonesiaAman") {
      //   return res.json({ success: true, message: "Password cocok! (Mode Fallback Offline)" });
      // }
      return res.status(500).json({ success: false, message: "Koneksi ke API Google Sheets gagal." });
    }
  });

  // Get Dashboard Stats
  app.get("/api/dashboard", async (req, res) => {
    const sheetData = await getGoogleSheetsData();
    
    const recruits = sheetData ? sheetData.recruits : [];
    const members = sheetData ? sheetData.members : [];
    const campuses = sheetData ? sheetData.campuses : [];

    // Monthly stats mapping for chart
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli"];
    const monthlyRecCounts = months.map(m => ({ name: m, count: 0 }));
    const monthlyMemCounts = months.map(m => ({ name: m, count: 0 }));

    // Set fallback if spreadsheets are blank to look nice
    const isBlank = !sheetData || sheetData.isEmpty;

    if (isBlank) {
      res.json({
        success: true,
        stats: {
          recruitments: { current: 0, target: 1000, history: monthlyRecCounts },
          coreMembers: { current: 0, target: 100, history: monthlyMemCounts },
          campuses: { current: 0, target: 10, data: [] }
        },
        isSpreadsheetEmpty: true
      });
      return;
    }

    // Populate actual monthly counts
    recruits.forEach((rec: any) => {
      const dateStr = rec.date || "2026-07-09";
      const monthIndex = new Date(dateStr).getMonth();
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      if (monthIndex >= 0 && monthIndex < 12) {
        const monthName = monthNames[monthIndex];
        const mObj = monthlyRecCounts.find(m => m.name === monthName);
        if (mObj) mObj.count += 1;
      }
    });

    members.forEach((mem: any) => {
      const dateStr = mem.dateJoined || "2026-07-09";
      const monthIndex = new Date(dateStr).getMonth();
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      if (monthIndex >= 0 && monthIndex < 12) {
        const monthName = monthNames[monthIndex];
        const mObj = monthlyMemCounts.find(m => m.name === monthName);
        if (mObj) mObj.count += 1;
      }
    });

    res.json({
      success: true,
      stats: {
        recruitments: {
          current: recruits.length,
          target: 1000,
          history: monthlyRecCounts
        },
        coreMembers: {
          current: members.length,
          target: 100,
          history: monthlyMemCounts
        },
        campuses: {
          current: campuses.length,
          target: 10,
          data: campuses
        }
      },
      isSpreadsheetEmpty: false
    });
  });

  // Get recruits
  app.get("/api/recruitments", async (req, res) => {
    const sheetData = await getGoogleSheetsData();
    const recruits = sheetData ? sheetData.recruits : [];

    const channelsMap = recruits.reduce((acc: Record<string, number>, curr: any) => {
      const ch = curr.channel || "Media Sosial";
      acc[ch] = (acc[ch] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: recruits,
      channels: Object.keys(channelsMap).map(key => ({ name: key, count: channelsMap[key] }))
    });
  });

  // Get members
  app.get("/api/members", async (req, res) => {
    const sheetData = await getGoogleSheetsData();
    res.json({
      success: true,
      data: sheetData ? sheetData.members : []
    });
  });

  // Get campuses
  app.get("/api/campuses", async (req, res) => {
    const sheetData = await getGoogleSheetsData();
    res.json({
      success: true,
      data: sheetData ? sheetData.campuses : []
    });
  });

  // Get agendas
  app.get("/api/agendas", async (req, res) => {
    const sheetData = await getGoogleSheetsData();
    res.json({
      success: true,
      data: sheetData ? sheetData.agendas : []
    });
  });

  // Vite development middleware or static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
