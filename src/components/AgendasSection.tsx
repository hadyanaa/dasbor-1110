import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AgendaItem } from "../types";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  RefreshCw, 
  Search, 
  Filter, 
  Tag, 
  Layers
} from "lucide-react";

interface AgendasSectionProps {
  agendas: AgendaItem[];
  isRefreshing: boolean;
}

export default function AgendasSection({
  agendas,
  isRefreshing
}: AgendasSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");

  const categories = ["Semua", "Roadshow", "Seleksi", "Pelatihan", "Koordinasi", "Umum"];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Sedang Berlangsung":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Selesai":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "Mendatang":
      default:
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "roadshow":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "seleksi":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "pelatihan":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "koordinasi":
        return "text-sky-400 bg-sky-500/10 border-sky-500/20";
      default:
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    }
  };

  // Filter agendas based on search and selected categories/status
  const filteredAgendas = agendas.filter((agenda) => {
    const matchesSearch = 
      agenda.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agenda.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agenda.coordinator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agenda.description && agenda.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "Semua" || agenda.category === selectedCategory;
    const matchesStatus = selectedStatus === "Semua" || agenda.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Count status for badge summaries
  const upcomingCount = agendas.filter(a => a.status === "Mendatang").length;
  const ongoingCount = agendas.filter(a => a.status === "Sedang Berlangsung").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="section-agendas">
      {/* Main Column: Agendas Timeline */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="font-display font-semibold text-slate-100 text-lg">
              Agenda Kegiatan Rekrutmen
            </h4>
            <p className="text-slate-400 text-xs">
              Menampilkan {filteredAgendas.length} dari total {agendas.length} agenda aktif di regional dari Google Spreadsheet.
            </p>
          </div>
          {isRefreshing && (
            <div className="flex items-center gap-1 text-slate-500 font-mono text-xs animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Sinkronisasi...</span>
            </div>
          )}
        </div>

        {/* Filters and search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari agenda, lokasi, PIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>

          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat} className="bg-slate-950">{cat === "Semua" ? "Semua Kategori" : cat}</option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            >
              <option value="Semua" className="bg-slate-950">Semua Status</option>
              <option value="Mendatang" className="bg-slate-950">Mendatang</option>
              <option value="Sedang Berlangsung" className="bg-slate-950">Sedang Berlangsung</option>
              <option value="Selesai" className="bg-slate-950">Selesai</option>
            </select>
          </div>
        </div>

        {/* Agendas list rendering */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredAgendas.length > 0 ? (
              filteredAgendas.map((agenda) => (
                <motion.div
                  key={agenda.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/20 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-1 group-hover:bg-indigo-500/10 transition-colors" />

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold border ${getCategoryColor(agenda.category)}`}>
                          {agenda.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${getStatusStyle(agenda.status)}`}>
                          {agenda.status}
                        </span>
                      </div>
                      <h5 className="font-display font-bold text-slate-100 text-base leading-tight group-hover:text-indigo-400 transition-colors pt-1">
                        {agenda.title}
                      </h5>
                    </div>
                    <span className="font-mono text-xs text-slate-500 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md self-start">
                      {agenda.id}
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    {agenda.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="font-mono">{agenda.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{agenda.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate" title={agenda.location}>{agenda.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <User className="w-3 h-3 text-slate-600" />
                    <span>Koordinator: {agenda.coordinator}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                <p className="text-sm font-medium">Tidak ada agenda yang ditemukan</p>
                <p className="text-xs text-slate-600 mt-1">Coba gunakan filter lain atau sesuaikan kata kunci pencarian.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar Summary */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h4 className="font-display font-semibold text-slate-100 text-md mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Metrik Agenda
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block mb-1">Mendatang</span>
              <span className="font-mono font-bold text-2xl text-indigo-400">{upcomingCount}</span>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block mb-1">Sedang Berlangsung</span>
              <span className="font-mono font-bold text-2xl text-emerald-400">{ongoingCount}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs text-slate-400 leading-relaxed">
            <p>
              Gunakan Google Spreadsheet untuk mengelola, menambah, atau memodifikasi agenda kegiatan secara real-time. Dashboard ini akan secara otomatis memperbarui tampilan daftar kegiatan yang dijadwalkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
