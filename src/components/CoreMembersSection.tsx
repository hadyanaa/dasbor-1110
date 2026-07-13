import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CoreMemberItem } from "../types";
import { Briefcase, ShieldCheck, Mail, MapPin, RefreshCw, Users } from "lucide-react";

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

  // const getDivisionForRole = (role: string) => {
  //   for (const div of divisionList) {
  //     if (div.roles.includes(role)) return div.name;
  //   }
  //   return "Lainnya";
  // };

  // const getRoleBadgeColor = (role: string) => {
  //   if (role.toLowerCase().includes("lead") || role.toLowerCase().includes("manager")) {
  //     return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  //   }
  //   if (role.toLowerCase().includes("developer") || role.toLowerCase().includes("designer")) {
  //     return "bg-sky-500/10 text-sky-400 border-sky-500/20";
  //   }
  //   return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  // };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [channelFilter, setChannelFilter] = useState("Semua");

  const filteredMembers = members.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kampus.toLowerCase().includes(searchTerm.toLowerCase());
    
    // const matchesStatus = statusFilter === "Semua" || item.status === statusFilter;
    // const matchesChannel = channelFilter === "Semua" || item.channel === channelFilter;

    return matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 gap-6" id="section-core-members">
      {/* Table & Cards layout */}
      <div className="overflow-x-auto flex-grow border border-slate-800 rounded-xl">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
              <th className="p-3">Nama Lengkap</th>
              <th className="p-3">Jenis Kelamin</th>
              <th className="p-3">Mentor</th>
              <th className="p-3">Kampus</th>
              <th className="p-3">Angkatan</th>
              <th className="p-3">Pekerjaan</th>
              <th className="p-3">Bidang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            <AnimatePresence mode="popLayout">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <motion.tr
                    key={member.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{member.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{member.email}</div>
                    </td>
                    <td className="p-3 text-slate-300 font-medium">{member.jk}</td>
                    <td className="p-3 text-slate-400">{member.mentor}</td>
                    <td className="p-3 text-slate-400">{member.kampus}</td>
                    <td className="p-3 text-slate-400">{member.angkatan}</td>
                    <td className="p-3 text-slate-400">{member.pekerjaan}</td>
                    <td className="p-3 text-slate-400">{member.bidang}</td>
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
  );
}
