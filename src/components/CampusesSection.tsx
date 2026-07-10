import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CampusData } from "../types";
import { GraduationCap, Users, UserCheck, Calendar, User, RefreshCw } from "lucide-react";

interface CampusesSectionProps {
  campuses: CampusData[];
  isRefreshing: boolean;
}

export default function CampusesSection({
  campuses,
  isRefreshing
}: CampusesSectionProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Komunitas Aktif":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "MoU Ditandatangani":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Roadshow Selesai":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="section-campuses">
      {/* Campuses Grid */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-display font-semibold text-slate-100 text-lg">
              Mitra Universitas & Institusi
            </h4>
            <p className="text-slate-400 text-xs">
              Memonitor keterlibatan {campuses.length} dari target 10 kampus di regional berdasarkan Google Spreadsheet.
            </p>
          </div>
          {isRefreshing && (
            <div className="flex items-center gap-1 text-slate-500 font-mono text-xs animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span>Memperbarui data...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {campuses.length > 0 ? (
              campuses.map((campus) => (
                <motion.div
                  key={campus.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xs hover:border-amber-500/30 hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5.5 h-5.5 text-amber-500" />
                      </div>
                      <div>
                        <h5 className="font-display font-bold text-slate-200 text-sm leading-tight truncate max-w-[160px] md:max-w-[200px]" title={campus.name}>
                          {campus.name}
                        </h5>
                        <span className="font-mono text-[10px] text-slate-500 font-semibold uppercase">{campus.code}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${getStatusStyle(campus.status)}`}>
                      {campus.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-slate-100 text-sm leading-tight">{campus.recruits}</div>
                        <div className="text-[9px] text-slate-500 font-medium">Pendaftar</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-slate-100 text-sm leading-tight">{campus.members}</div>
                        <div className="text-[9px] text-slate-500 font-medium">Anggota Inti</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Koordinator: <strong className="text-slate-200 font-medium">{campus.coordinator}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Mitra sejak: <strong className="text-slate-300 font-mono font-medium">{campus.joinedDate}</strong></span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-slate-500">
                <p className="text-sm">Belum ada kampus mitra di Google Spreadsheet.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Goal Indicator Card Sidebar */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/20 rounded-2xl p-5 text-white shadow-md">
          <div className="flex justify-between items-start mb-3">
            <GraduationCap className="w-8 h-8 text-amber-100 bg-amber-900/30 p-1.5 rounded-xl border border-amber-400/20" />
            <span className="font-mono text-xs bg-white/10 px-2.5 py-0.5 rounded-full border border-white/5">Target regional</span>
          </div>
          
          <h4 className="font-display font-bold text-2xl tracking-tight">
            {Math.max(0, 10 - campuses.length)} Kampus Lagi
          </h4>
          
          <p className="text-amber-100/90 text-xs mt-1.5 leading-relaxed">
            Menghubungkan {campuses.length} kampus dari target 10 kampus di regional. Integrasikan data Google Spreadsheet untuk memperbarui progress.
          </p>

          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[11px] text-amber-100/80 font-mono">
            <span>Progress: {Math.round((campuses.length / 10) * 100)}%</span>
            <span>Target: 10 Kampus</span>
          </div>
        </div>
      </div>
    </div>
  );
}
