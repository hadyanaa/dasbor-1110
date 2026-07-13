import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RecruitmentItem, RecruitmentChannel } from "../types";
import { Search, Filter, Users, RefreshCw } from "lucide-react";

interface RecruitmentsSectionProps {
  recruits: RecruitmentItem[];
  channels: RecruitmentChannel[];
  isRefreshing: boolean;
}

export default function RecruitmentsSection({
  recruits,
  channels,
  isRefreshing
}: RecruitmentsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [channelFilter, setChannelFilter] = useState("Semua");

  // Filtered recruits
  const filteredRecruits = recruits.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.campus.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "Semua" || item.status === statusFilter;
    const matchesChannel = channelFilter === "Semua" || item.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Lolos Seleksi":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Interview":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Bootcamp":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Ditolak":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="section-recruitment">

      {/* Main Table: List of Recruits */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="font-display font-semibold text-slate-100 text-lg">
              Log Pendaftaran Terbaru
            </h4>
            <p className="text-slate-400 text-xs">
              Menampilkan {filteredRecruits.length} dari total {recruits.length} data pendaftar aktif.
            </p>
          </div>
          {isRefreshing && (
            <div className="flex items-center gap-1 text-slate-500 font-mono text-xs animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              <span>Memuat data...</span>
            </div>
          )}
        </div>

        {/* Filters and search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, email, kampus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
            />
          </div>

          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
            >
              <option value="Semua" className="bg-slate-900">Semua Status</option>
              <option value="Pending" className="bg-slate-900">Pending</option>
              <option value="Interview" className="bg-slate-900">Interview</option>
              <option value="Bootcamp" className="bg-slate-900">Bootcamp</option>
              <option value="Lolos Seleksi" className="bg-slate-900">Lolos Seleksi</option>
              <option value="Ditolak" className="bg-slate-900">Ditolak</option>
            </select>
          </div>

          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
            >
              <option value="Semua" className="bg-slate-900">Semua Saluran</option>
              <option value="Media Sosial" className="bg-slate-900">Media Sosial</option>
              <option value="Roadshow Kampus" className="bg-slate-900">Roadshow Kampus</option>
              <option value="Rekomendasi" className="bg-slate-900">Rekomendasi</option>
              <option value="Website" className="bg-slate-900">Website</option>
            </select>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto flex-grow border border-slate-800 rounded-xl">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">Kampus</th>
                <th className="p-3">Saluran</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <AnimatePresence mode="popLayout">
                {filteredRecruits.length > 0 ? (
                  filteredRecruits.map((recruit) => (
                    <motion.tr
                      key={recruit.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{recruit.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{recruit.email}</div>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">{recruit.campus}</td>
                      <td className="p-3 text-slate-400">{recruit.channel}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(recruit.status)}`}>
                          {recruit.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">{recruit.date}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr className="h-48 text-center text-slate-500">
                    <td colSpan={5} className="p-5">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-8 h-8 text-slate-700 mb-2" />
                        <span className="font-medium">Tidak ada pendaftar yang cocok</span>
                        <span className="text-[10px] text-slate-500 mt-1">Belum ada data pendaftar di Google Spreadsheet</span>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
