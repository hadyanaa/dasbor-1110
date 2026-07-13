export interface MonthData {
  name: string;
  count: number;
}

export interface MetricProgress {
  current: number;
  target: number;
  history: MonthData[];
}

export interface CampusData {
  id: string;
  name: string;
  code: string;
  recruits: number;
  members: number;
  status: string;
  joinedDate: string;
  coordinator: string;
}

export interface CampusesProgress {
  current: number;
  target: number;
  data: CampusData[];
}

export interface DashboardStats {
  recruitments: MetricProgress;
  coreMembers: MetricProgress;
  campuses: CampusesProgress;
}

export interface RecruitmentItem {
  id: string;
  name: string;
  jk: string;
  mentor: string;
  level: string;
  angkatan: string;
  kampus: string;
  channel: string;
  date: string;
  email: string;
}

export interface RecruitmentChannel {
  name: string;
  count: number;
}

export interface RecruitmentResponse {
  success: boolean;
  data: RecruitmentItem[];
  channels: RecruitmentChannel[];
}

export interface CoreMemberItem {
  id: string;
  name: string;
  jk: string;
  mentor: string;
  kampus: string;
  pekerjaan: string;
  dateJoined: string;
  angkatan: string;
  email: string;
  bidang: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: "Mendatang" | "Sedang Berlangsung" | "Selesai";
  coordinator: string;
  category: string;
}
