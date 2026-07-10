import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CoreMemberItem } from "../types";
import { Briefcase, ShieldCheck, Mail, MapPin, RefreshCw } from "lucide-react";

interface CoreMembersSectionProps {
  members: CoreMemberItem[];
  isRefreshing: boolean;
}

export default function CoreMembersSection({
  members,
  isRefreshing
}: CoreMembersSectionProps) {
  const divisionList = [
    { name: "Tech & Design", roles: ["Frontend Lead", "Backend Developer", "UI/UX Designer", "Frontend Developer", "Backend Lead"] },
    { name: "Public Relations", roles: ["Public Relations", "Partnership Specialist", "Community Manager"] },
    { name: "Events & Media", roles: ["Event Coordinator", "Content Creator", "Media Manager"] }
  ];

  const getDivisionForRole = (role: string) => {
    for (const div of divisionList) {
      if (div.roles.includes(role)) return div.name;
    }
    return "Lainnya";
  };

  const getRoleBadgeColor = (role: string) => {
    if (role.toLowerCase().includes("lead") || role.toLowerCase().includes("manager")) {
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    }
    if (role.toLowerCase().includes("developer") || role.toLowerCase().includes("designer")) {
      return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    }
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="section-core-members">
      {/* Table & Cards layout */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="font-display font-semibold text-slate-100 text-lg">
                Direktori Anggota Inti Baru
              </h4>
              <p className="text-slate-400 text-xs">
                Daftar anggota inti aktif yang terdaftar di Google Spreadsheet.
              </p>
            </div>
            {isRefreshing && (
              <div className="flex items-center gap-1 text-slate-500 font-mono text-xs animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Memutakhirkan...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1 pb-2">
            <AnimatePresence mode="popLayout">
              {members.length > 0 ? (
                members.map((member) => (
                  <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-xs flex flex-col justify-between hover:border-indigo-500/30 hover:shadow-sm transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-3xl -z-1" />
                    
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-sans font-bold text-slate-200 text-sm leading-snug">{member.name}</h5>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md text-[10px] font-semibold border ${getRoleBadgeColor(member.role)}`}>
                            <Briefcase className="w-2.5 h-2.5" />
                            {member.role}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-sm">
                          {member.id}
                        </span>
                      </div>

                      <div className="mt-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{member.campus}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Divisi: {getDivisionForRole(member.role)}</span>
                      <span className="font-mono">{member.dateJoined}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 py-12 text-center text-slate-500">
                  <p className="text-sm">Belum ada anggota inti di Google Spreadsheet.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sidebar: Division stats */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-950 to-slate-950 border border-slate-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
          
          <h4 className="font-display font-semibold text-md mb-3 text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Distribusi Posisi Inti
          </h4>
          <p className="text-slate-400 text-xs mb-4">
            Pengelompokan divisi anggota inti yang telah terdaftar secara resmi di Google Spreadsheet.
          </p>

          <div className="space-y-3">
            {divisionList.map((div, i) => {
              const count = members.filter(m => div.roles.includes(m.role)).length;
              const percent = members.length > 0 ? (count / members.length) * 100 : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{div.name}</span>
                    <span className="font-semibold text-slate-200">{count} ({Math.round(percent)}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="bg-indigo-500 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
