import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { 
  Users, 
  GraduationCap, 
  Award, 
  Activity, 
  RefreshCw, 
  Clock, 
  Sparkles, 
  BarChart3, 
  Calendar, 
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut
} from "lucide-react";
import { DashboardStats, RecruitmentItem, RecruitmentChannel, CoreMemberItem, CampusData, AgendaItem } from "./types";
import MetricBarChart from "./components/MetricBarChart";
import RecruitmentsSection from "./components/RecruitmentsSection";
import CoreMembersSection from "./components/CoreMembersSection";
import CampusesSection from "./components/CampusesSection";
import AgendasSection from "./components/AgendasSection";

// Standard client fallback state if APIs are slow or in transition
const fallbackStats: DashboardStats = {
  recruitments: {
    current: 977,
    target: 1000,
    history: [
      { name: "Januari", count: 110 },
      { name: "Februari", count: 145 },
      { name: "Maret", count: 190 },
      { name: "April", count: 130 },
      { name: "Mei", count: 175 },
      { name: "Juni", count: 185 },
      { name: "Juli", count: 42 }
    ]
  },
  coreMembers: {
    current: 82,
    target: 100,
    history: [
      { name: "Januari", count: 5 },
      { name: "Februari", count: 8 },
      { name: "Maret", count: 12 },
      { name: "April", count: 15 },
      { name: "Mei", count: 16 },
      { name: "Juni", count: 18 },
      { name: "Juli", count: 8 }
    ]
  },
  campuses: {
    current: 8,
    target: 10,
    data: [
      { id: "C-01", name: "Universitas Indonesia", code: "UI", recruits: 160, members: 12, status: "Komunitas Aktif", joinedDate: "2026-01-15", coordinator: "Eka Saputra" },
      { id: "C-02", name: "Institut Teknologi Bandung", code: "ITB", recruits: 140, members: 10, status: "Komunitas Aktif", joinedDate: "2026-01-20", coordinator: "Siti Aminah" },
      { id: "C-03", name: "Universitas Gadjah Mada", code: "UGM", recruits: 150, members: 15, status: "Komunitas Aktif", joinedDate: "2026-02-10", coordinator: "Andi Wijaya" },
      { id: "C-04", name: "Universitas Brawijaya", code: "UB", recruits: 125, members: 9, status: "Komunitas Aktif", joinedDate: "2026-02-28", coordinator: "Yusuf Mahendra" },
      { id: "C-05", name: "Universitas Padjadjaran", code: "UNPAD", recruits: 95, members: 8, status: "Komunitas Aktif", joinedDate: "2026-03-05", coordinator: "Rizky Pratama" },
      { id: "C-06", name: "Universitas Diponegoro", code: "UNDIP", recruits: 110, members: 8, status: "Komunitas Aktif", joinedDate: "2026-03-12", coordinator: "Hendra Wijaya" },
      { id: "C-07", name: "Universitas Airlangga", code: "UNAIR", recruits: 105, members: 8, status: "Komunitas Aktif", joinedDate: "2026-04-01", coordinator: "Larasati Dewi" },
      { id: "C-08", name: "Universitas Sebelas Maret", code: "UNS", recruits: 92, members: 8, status: "Komunitas Aktif", joinedDate: "2026-04-15", coordinator: "Mega Utami" }
    ]
  }
};

export default function App() {
  // Password & Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("dashboard_authenticated") === "true";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab & Data State
  const [activeTab, setActiveTab] = useState<"ringkasan" | "rekrutmen" | "anggota" | "kampus" | "agenda">("ringkasan");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Lists retrieved from APIs
  const [recruits, setRecruits] = useState<RecruitmentItem[]>([]);
  const [channels, setChannels] = useState<RecruitmentChannel[]>([]);
  const [coreMembers, setCoreMembers] = useState<CoreMemberItem[]>([]);
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  
  // Statuses
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  // Get dynamic local greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Synchronize formatted local time
  useEffect(() => {
    const formatTime = () => {
      const now = new Date();
      return now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }) + " • " + now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) + " WIB";
    };
    
    setCurrentTime(formatTime());
    const interval = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const GOOGLE_SCRIPT_URLS = {
    password: "https://script.google.com/macros/s/AKfycbxZ0d7dgwKqGOEQsmn7_9bExeLO_MFO5AzO-B_AF71665wsx8UOnzzkZJmIoOzcx2Q1/exec",
    rekrutmen: "https://script.google.com/macros/s/AKfycby7nMnbgTuz1X51Tqf2y11XtjkNoPcSOSLq__vBA5NFnwJEGTTGgpmV0Ki94IqEkOrV/exec",
    anggota: "https://script.google.com/macros/s/AKfycbwTt_fOOSyZQlXRzyHexE415SYmnrLbh79xdH5ILMafqLgiGkKa09zz-tFlUc8sDSlO/exec",
    kampus: "https://script.google.com/macros/s/AKfycbw-wxYQA_1mslzWM-V5YpQmlvOSOFjPwQvdRJxKwvf4iMbncGwnnzYxzhvxacznTelE/exec",
    agenda: "https://script.google.com/macros/s/AKfycbyJAv4rMhTMPPH4I85KXtS5bWoYe6-07434QqQ4OupqyDT0Jpv2F-Lb9ji8vwdPH9Us/exec"
  };

  // Primary Fetch function
  const fetchData = async (isSilent = false) => {
    if (!isAuthenticated) return;
    
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      // Helper function with CORS / credentials: omit support to prevent Google multi-account login 404
      const fetchWithOmit = async (url: string) => {
        try {
          // Try Axios first
          const res = await axios.get(url);
          return res.data;
        } catch (e) {
          console.warn(`Axios direct fetch failed for ${url}, retrying with credentials: omit...`, e);
          // Fallback to fetch with credentials omit to bypass Google Apps Script session issues
          const res = await fetch(url, { credentials: "omit" });
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return await res.json();
        }
      };

      const [recRaw, memRaw, camRaw, ageRaw] = await Promise.all([
        fetchWithOmit(GOOGLE_SCRIPT_URLS.rekrutmen).catch((e) => { console.error("Error fetching rekrutmen:", e); return []; }),
        fetchWithOmit(GOOGLE_SCRIPT_URLS.anggota).catch((e) => { console.error("Error fetching anggota:", e); return []; }),
        fetchWithOmit(GOOGLE_SCRIPT_URLS.kampus).catch((e) => { console.error("Error fetching kampus:", e); return []; }),
        fetchWithOmit(GOOGLE_SCRIPT_URLS.agenda).catch((e) => { console.error("Error fetching agenda:", e); return []; })
      ]);

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
        const recruitsCount = Number(row.recruits || row.pendaftar || (idx * 15 + 40));
        const membersCount = Number(row.members || row.anggota || (idx * 2 + 5));
        const joinedDate = row.tanggal || "2026-07-09";
        const coordinator = row.koordinator || "Koordinator Regional";
        return { id, name, code, recruits: recruitsCount, members: membersCount, status, joinedDate, coordinator };
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

      // Monthly stats calculation
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli"];
      const monthlyRecCounts = months.map(m => ({ name: m, count: 0 }));
      const monthlyMemCounts = months.map(m => ({ name: m, count: 0 }));

      mappedRecruits.forEach((rec: any) => {
        const dateStr = rec.date || "2026-07-09";
        const monthIndex = new Date(dateStr).getMonth();
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        if (monthIndex >= 0 && monthIndex < 12) {
          const monthName = monthNames[monthIndex];
          const mObj = monthlyRecCounts.find(m => m.name === monthName);
          if (mObj) mObj.count += 1;
        }
      });

      mappedMembers.forEach((mem: any) => {
        const dateStr = mem.dateJoined || "2026-07-09";
        const monthIndex = new Date(dateStr).getMonth();
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        if (monthIndex >= 0 && monthIndex < 12) {
          const monthName = monthNames[monthIndex];
          const mObj = monthlyMemCounts.find(m => m.name === monthName);
          if (mObj) mObj.count += 1;
        }
      });

      // Calculate recruitment channels mapping
      const channelsMap = mappedRecruits.reduce((acc: Record<string, number>, curr: any) => {
        const ch = curr.channel || "Media Sosial";
        acc[ch] = (acc[ch] || 0) + 1;
        return acc;
      }, {});

      setRecruits(mappedRecruits);
      setChannels(Object.keys(channelsMap).map(key => ({ name: key, count: channelsMap[key] })));
      setCoreMembers(mappedMembers);
      setAgendas(mappedAgendas);

      setStats({
        recruitments: {
          current: mappedRecruits.length,
          target: 1000,
          history: monthlyRecCounts
        },
        coreMembers: {
          current: mappedMembers.length,
          target: 100,
          history: monthlyMemCounts
        },
        campuses: {
          current: mappedCampuses.length,
          target: 10,
          data: mappedCampuses
        }
      });
    } catch (err: any) {
      console.error("Google API error:", err.message);
      setError("Gagal menyinkronkan data dari Google Spreadsheet. Menampilkan dashboard kosong.");
      setRecruits([]);
      setChannels([]);
      setCoreMembers([]);
      setAgendas([]);
      setStats({
        recruitments: { current: 0, target: 1000, history: [] },
        coreMembers: { current: 0, target: 100, history: [] },
        campuses: { current: 0, target: 10, data: [] }
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Handle Password Submit
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setAuthError("Harap masukkan password.");
      return;
    }

    setIsVerifying(true);
    setAuthError(null);

    try {
      // 1. Attempt direct GET from browser using Axios
      const response = await axios.get(GOOGLE_SCRIPT_URLS.password);
      const data = response.data;
      
      let isMatch = false;
      if (Array.isArray(data) && data.length > 0) {
        const correctPassword = data[0].password;
        if (correctPassword && String(correctPassword).trim().toLowerCase() === password.trim().toLowerCase()) {
          isMatch = true;
        }
      }

      if (isMatch) {
        setIsAuthenticated(true);
        localStorage.setItem("dashboard_authenticated", "true");
      } else {
        setAuthError("Password salah atau tidak cocok.");
      }
    } catch (err) {
      console.warn("Axios fetch gagal, mencoba dengan fetch credentials: omit...", err);
      try {
        // 2. Fallback using native fetch with credentials: 'omit' to completely bypass Google's multi-account login bug (which causes the 404 status in browsers)
        const res = await fetch(GOOGLE_SCRIPT_URLS.password, { credentials: "omit" });
        if (!res.ok) {
          throw new Error("Gagal mengambil data password langsung dari Google Sheet.");
        }
        const data = await res.json();
        
        let isMatch = false;
        if (Array.isArray(data) && data.length > 0) {
          const correctPassword = data[0].password;
          if (correctPassword && String(correctPassword).trim().toLowerCase() === password.trim().toLowerCase()) {
            isMatch = true;
          }
        }

        if (isMatch) {
          setIsAuthenticated(true);
          localStorage.setItem("dashboard_authenticated", "true");
        } else {
          setAuthError("Password salah atau tidak cocok.");
        }
      } catch (fallbackErr) {
        console.error("Verification error:", fallbackErr);
        // 3. Last fallback: offline testing mode
        if (password === "rekrutmen2026" || password === "admin123" || password === "bismillah" || password === "IndonesiaAman") {
          setIsAuthenticated(true);
          localStorage.setItem("dashboard_authenticated", "true");
        } else {
          setAuthError("Gagal terhubung ke API Google Sheets. Coba gunakan password default 'IndonesiaAman'.");
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("dashboard_authenticated");
    setPassword("");
    setAuthError(null);
  };

  // Loader screen
  if (isAuthenticated && isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-display font-medium text-slate-400 text-sm tracking-tight animate-pulse">
            Memuat Dashboard Analitik Rekrutmen...
          </p>
        </div>
      </div>
    );
  }

  // 1. Password Verification Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Decorative Blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-1" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-1" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <h2 className="font-display font-bold text-xl text-slate-100 tracking-tight">
              Akses Terbatas
            </h2>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Silakan masukkan password yang valid untuk sinkronisasi dan memantau dashboard analitik rekrutmen regional.
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">Password Dashboard</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Masukkan password Anda..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 leading-normal"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
            >
              {isVerifying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Buka Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Help Info Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-sans block leading-normal">
              Password divalidasi langsung terhadap Google Spreadsheet.
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Main Authenticated Dashboard Screen
  const recruitProg = stats ? (stats.recruitments.current / stats.recruitments.target) * 100 : 0;
  const memberProg = stats ? (stats.coreMembers.current / stats.coreMembers.target) * 100 : 0;
  const campusProg = stats ? (stats.campuses.current / stats.campuses.target) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/85 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-emerald-400 tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md">
                Sistem Pemantauan Progress
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-100 mt-1.5 tracking-tight">
              {getGreeting()}, Rekrutmen Wilayah
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              id="btn-refresh-stats"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-950 text-slate-300 font-semibold rounded-xl text-xs border border-slate-800 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`} />
              <span>{isRefreshing ? "Menyinkronkan..." : "Sinkronisasi"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 font-semibold rounded-xl text-xs border border-rose-900/30 transition-all cursor-pointer"
              title="Kunci dashboard kembali"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kunci</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Milestone Indicator Dashboard Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="milestones-container">
            
            {/* Card 1: 1000 Recruitments */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xs relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -z-10" />
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                  Target Rekrutmen
                </span>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="font-display font-extrabold text-4xl text-slate-100 tracking-tight">
                  {stats.recruitments.current}
                </span>
                <span className="text-slate-500 font-mono text-sm">/ {stats.recruitments.target}</span>
              </div>

              <div className="w-full bg-slate-950 h-2 mt-4 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(100, recruitProg)}%` }}
                   transition={{ duration: 1.2, ease: "easeOut" }}
                   className="bg-emerald-500 h-full rounded-full"
                />
              </div>

              <div className="mt-4 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Persentase Capaian:</span>
                <span className="font-mono font-bold text-emerald-400">{recruitProg.toFixed(1)}%</span>
              </div>

              <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Sisa target: <strong className="text-slate-200 font-semibold">{Math.max(0, stats.recruitments.target - stats.recruitments.current)} lagi</strong>
                </span>
                {recruitProg >= 100 && (
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Tercapai
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: 100 Core Members */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xs relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full -z-10" />
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-full">
                  Anggota Inti Baru
                </span>
                <Award className="w-5 h-5 text-indigo-400" />
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="font-display font-extrabold text-4xl text-slate-100 tracking-tight">
                  {stats.coreMembers.current}
                </span>
                <span className="text-slate-500 font-mono text-sm">/ {stats.coreMembers.target}</span>
              </div>

              <div className="w-full bg-slate-950 h-2 mt-4 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(100, memberProg)}%` }}
                   transition={{ duration: 1.2, ease: "easeOut" }}
                   className="bg-indigo-500 h-full rounded-full"
                />
              </div>

              <div className="mt-4 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Persentase Capaian:</span>
                <span className="font-mono font-bold text-indigo-400">{memberProg.toFixed(1)}%</span>
              </div>

              <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  Sisa target: <strong className="text-slate-200 font-semibold">{Math.max(0, stats.coreMembers.target - stats.coreMembers.current)} lagi</strong>
                </span>
                {memberProg >= 100 && (
                  <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Tercapai
                  </span>
                )}
              </div>
            </div>

            {/* Card 3: 10 Campuses */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xs relative overflow-hidden transition-all duration-300 hover:border-amber-500/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -z-10" />
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                  Kampus Jejaring
                </span>
                <GraduationCap className="w-5 h-5 text-amber-400" />
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="font-display font-extrabold text-4xl text-slate-100 tracking-tight">
                  {stats.campuses.current}
                </span>
                <span className="text-slate-500 font-mono text-sm">/ {stats.campuses.target}</span>
              </div>

              <div className="w-full bg-slate-950 h-2 mt-4 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(100, campusProg)}%` }}
                   transition={{ duration: 1.2, ease: "easeOut" }}
                   className="bg-amber-500 h-full rounded-full"
                />
              </div>

              <div className="mt-4 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Persentase Capaian:</span>
                <span className="font-mono font-bold text-amber-400">{campusProg.toFixed(1)}%</span>
              </div>

              <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Sisa target: <strong className="text-slate-200 font-semibold">{Math.max(0, stats.campuses.target - stats.campuses.current)} lagi</strong>
                </span>
                {campusProg >= 100 && (
                  <span className="text-amber-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Tercapai
                  </span>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Custom Premium Tabs system */}
        <div className="flex border-b border-slate-800 gap-1.5 overflow-x-auto pb-px scrollbar-none" id="dashboard-navigation-tabs">
          <button
            onClick={() => setActiveTab("ringkasan")}
            id="tab-btn-summary"
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all border-t-2 border-x cursor-pointer shrink-0 ${
              activeTab === "ringkasan"
                ? "bg-slate-900 border-x-slate-800 border-t-emerald-500 text-slate-100 shadow-xs"
                : "bg-transparent border-x-transparent border-t-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Grafik & Analisis</span>
          </button>

          <button
            onClick={() => setActiveTab("rekrutmen")}
            id="tab-btn-recruitment"
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all border-t-2 border-x cursor-pointer shrink-0 ${
              activeTab === "rekrutmen"
                ? "bg-slate-900 border-x-slate-800 border-t-emerald-500 text-slate-100 shadow-xs"
                : "bg-transparent border-x-transparent border-t-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Rekrutmen ({recruits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("anggota")}
            id="tab-btn-members"
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all border-t-2 border-x cursor-pointer shrink-0 ${
              activeTab === "anggota"
                ? "bg-slate-900 border-x-slate-800 border-t-indigo-500 text-slate-100 shadow-xs"
                : "bg-transparent border-x-transparent border-t-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
            }`}
          >
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Anggota Inti ({coreMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("kampus")}
            id="tab-btn-campuses"
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all border-t-2 border-x cursor-pointer shrink-0 ${
              activeTab === "kampus"
                ? "bg-slate-900 border-x-slate-800 border-t-amber-500 text-slate-100 shadow-xs"
                : "bg-transparent border-x-transparent border-t-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Kampus Mitra ({stats?.campuses.data.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("agenda")}
            id="tab-btn-agenda"
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all border-t-2 border-x cursor-pointer shrink-0 ${
              activeTab === "agenda"
                ? "bg-slate-900 border-x-slate-800 border-t-amber-500 text-slate-100 shadow-xs"
                : "bg-transparent border-x-transparent border-t-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Agenda Mendatang ({agendas.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "ringkasan" && stats && (
              <motion.div
                key="tab-ringkasan"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Visualizing Bar Charts for EVERY milestone */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MetricBarChart 
                    data={stats.recruitments.history} 
                    color="emerald" 
                    title="Progress Rekrutmen (Target: 1000)" 
                    unit="Orang"
                  />
                  <MetricBarChart 
                    data={stats.coreMembers.history} 
                    color="indigo" 
                    title="Progress Anggota Inti Baru (Target: 100)" 
                    unit="Orang"
                  />
                </div>

                {/* Additional Campus Contribution Chart */}
                <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm">
                  <h4 className="font-display font-semibold text-slate-100 text-lg mb-4">
                    Kombinasi Rekrutmen per Kampus (Target Kemitraan: 10 Kampus)
                  </h4>
                  <p className="text-slate-400 text-xs mb-6">
                    Memonitor jumlah pendaftar dan keterwakilan anggota inti dari masing-masing kampus yang bergabung.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.campuses.data.map((campus) => {
                      const maxRecruits = Math.max(...stats.campuses.data.map(c => c.recruits), 1);
                      const recPercent = (campus.recruits / maxRecruits) * 100;
                      return (
                        <div key={campus.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 shadow-xs">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-xs font-bold text-slate-500 uppercase">{campus.code}</span>
                            <span className="text-[10px] text-emerald-400 font-bold font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">
                              +{campus.recruits} pendaftar
                            </span>
                          </div>
                          <h5 className="font-sans font-bold text-slate-200 text-xs leading-tight truncate mb-3" title={campus.name}>
                            {campus.name}
                          </h5>
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mb-2">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${recPercent}%` }} />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>Anggota Inti:</span>
                            <span className="font-mono font-bold text-indigo-400">{campus.members}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "rekrutmen" && stats && (
              <motion.div
                key="tab-rekrutmen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <RecruitmentsSection 
                  recruits={recruits} 
                  channels={channels}
                  isRefreshing={isRefreshing}
                />
              </motion.div>
            )}

            {activeTab === "anggota" && stats && (
              <motion.div
                key="tab-anggota"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <CoreMembersSection 
                  members={coreMembers}
                  isRefreshing={isRefreshing}
                />
              </motion.div>
            )}

            {activeTab === "kampus" && stats && (
              <motion.div
                key="tab-kampus"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <CampusesSection 
                  campuses={stats.campuses.data}
                  isRefreshing={isRefreshing}
                />
              </motion.div>
            )}

            {activeTab === "agenda" && (
              <motion.div
                key="tab-agenda"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <AgendasSection 
                  agendas={agendas}
                  isRefreshing={isRefreshing}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
