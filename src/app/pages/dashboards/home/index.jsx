import React from "react";
import {
  Users,
  Download,
  Plus,
  Search,
  Settings,
  FileText,
  LayoutGrid,
  CreditCard,
  Bell,
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

const MainDashboard = () => {
  // 1. Core Analytics Summary Cards
  const summaryCards = [
    {
      title: "MRR",
      value: "₹18.4L",
      icon: "text-slate-400",
      change: "+12.4% MoM",
      isPositive: true,
    },
    {
      title: "ACTIVE USERS",
      value: "2,40,128",
      icon: Users,
      change: "+8,420 / wk",
      isPositive: true,
    },
    {
      title: "TESTS LIVE",
      value: "642",
      icon: FileText,
      change: "12 drafts",
      isPositive: true,
    },
    {
      title: "PRO CONVERSIONS",
      value: "9.8%",
      icon: ArrowUpRight,
      change: "+1.2%",
      isPositive: true,
    },
  ];

  // 2. Recent Users Data
  const recentUsers = [
    {
      id: 1,
      name: "Priya Menon",
      email: "priya@mail.in",
      exam: "UPSC CSE",
      plan: "Yearly Pro",
      planBg: "bg-orange-50 text-orange-600",
      tests: "64",
      joined: "12 May",
      status: "active",
    },
    {
      id: 2,
      name: "Karan Soni",
      email: "karan@mail.in",
      exam: "MPSC",
      plan: "Monthly",
      planBg: "bg-orange-50 text-orange-600",
      tests: "22",
      joined: "18 May",
      status: "active",
    },
    {
      id: 3,
      name: "Devika Rao",
      email: "devika@mail.in",
      exam: "UPSC CSE",
      plan: "Free",
      planBg: "bg-slate-50 text-slate-600",
      tests: "8",
      joined: "21 May",
      status: "trial",
    },
    {
      id: 4,
      name: "Imran Khan",
      email: "imran@mail.in",
      exam: "SSC CGL",
      plan: "Monthly",
      planBg: "bg-orange-50 text-orange-600",
      tests: "41",
      joined: "23 May",
      status: "active",
    },
    {
      id: 5,
      name: "Sneha Iyer",
      email: "sneha@mail.in",
      exam: "UPPCS",
      plan: "Yearly Pro",
      planBg: "bg-orange-50 text-orange-600",
      tests: "88",
      joined: "24 May",
      status: "active",
    },
  ];

  // 3. Plan Mix Data
  const planMix = [
    { name: "Free", value: 72, color: "bg-slate-700" },
    { name: "Monthly Pro", value: 18, color: "bg-[#F5A524]" },
    { name: "Yearly Pro", value: 10, color: "bg-[#F5A524]" },
  ];

  // 4. Revenue Data (Simulating the stacked look)
  // Each month has a 'total' height (gray background) and an 'achieved' height (orange foreground)
  const revenueData = [
    { month: "A", total: 60, achieved: 40 },
    { month: "S", total: 70, achieved: 45 },
    { month: "O", total: 80, achieved: 55 },
    { month: "N", total: 100, achieved: 65 },
    { month: "D", total: 110, achieved: 75 },
    { month: "J", total: 120, achieved: 80 },
    { month: "F", total: 130, achieved: 85 },
    { month: "M", total: 140, achieved: 95 },
    { month: "A", total: 150, achieved: 105 },
    { month: "M", total: 160, achieved: 120 },
    { month: "J", total: 170, achieved: 135 },
    { month: "J", total: 180, achieved: 150 },
  ];

  // Framer Motion Animation Settings
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-slate-50/30 pb-12"
      >
        <div className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
          {/* ⭐ Top Header Section */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between gap-4 pt-2 sm:flex-row sm:items-end"
          >
            <div>
              
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Operations overview
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
                <Download size={16} />
                Export
              </button>
              <button className="flex items-center gap-1.5 rounded-xl bg-[#F5A524] px-4 py-2 text-sm font-bold text-black shadow-sm transition-all hover:bg-[#e09621]">
                <Plus size={16} strokeWidth={2.5} />
                New question
              </button>
            </div>
          </motion.div>

          {/* ⭐ 4 Columns Analytics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {summaryCards.map((card, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                    {card.title}
                  </p>
                  {typeof card.icon === "string" ? (
                    <span className="text-sm font-semibold text-slate-400">
                      $
                    </span>
                  ) : (
                    <card.icon size={16} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-[28px] leading-none font-bold tracking-tight text-slate-900">
                    {card.value}
                  </h3>
                  <p className="text-[13px] font-bold text-emerald-600">
                    {card.change}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ⭐ Charts Row */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Revenue · last 12 months */}
            <motion.div
              variants={itemVariants}
              className="rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-2"
            >
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-[17px] font-bold tracking-tight text-slate-900">
                  Revenue · last 12 months
                </h3>
                <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition-colors hover:bg-slate-50">
                  <span className="text-xs font-bold text-slate-700">
                    FY 2025-26
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>

              <div className="flex h-56 items-end justify-between px-2 pt-4">
                {revenueData.map((data, i) => (
                  <div
                    key={i}
                    className="group flex w-full flex-col items-center gap-3"
                  >
                    <div className="relative flex h-[180px] w-[80%] max-w-[40px] items-end">
                      {/* Gray Background Bar */}
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-slate-200 transition-all duration-300"
                        style={{ height: `${(data.total / 200) * 180}px` }}
                      ></div>
                      {/* Orange Foreground Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.achieved / 200) * 180}px` }}
                        transition={{ duration: 0.8, delay: i * 0.04 }}
                        className="absolute bottom-0 w-full rounded-t-md bg-[#F5A524] shadow-sm transition-all duration-300 group-hover:brightness-110"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      {data.month}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Plan Mix */}
            <motion.div variants={itemVariants} className="flex flex-col gap-5">
              {/* Plan mix card */}
              <div className="flex-1 rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                <h3 className="mb-6 text-[17px] font-bold tracking-tight text-slate-900">
                  Plan mix
                </h3>

                <div className="space-y-6">
                  {planMix.map((plan, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">
                          {plan.name}
                        </span>
                        <span className="font-bold text-slate-900">
                          {plan.value}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${plan.value}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${plan.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AVG LTV Card */}
              <div className="rounded-[20px] border border-orange-100/50 bg-[#FFF6ED] p-6">
                <p className="mb-1 text-[11px] font-bold tracking-widest text-orange-500/80 uppercase">
                  AVG LTV
                </p>
                <h3 className="text-3xl font-black tracking-tight text-slate-900">
                  ₹2,840
                </h3>
              </div>
            </motion.div>
          </div>

          {/* ⭐ Recent Users List */}
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-[20px] border border-slate-200/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <h3 className="text-[17px] font-bold tracking-tight text-slate-900">
                Recent users
              </h3>
              <button className="text-xs font-bold text-slate-600 transition-colors hover:text-slate-900">
                Manage all
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-y border-slate-100 bg-white text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                    <th className="px-6 py-4">USER</th>
                    <th className="px-6 py-4">EXAM</th>
                    <th className="px-6 py-4">PLAN</th>
                    <th className="px-6 py-4">TESTS</th>
                    <th className="px-6 py-4">JOINED</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {recentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#0A0E17] text-xs font-bold text-white uppercase shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div className="leading-tight">
                            <p className="font-bold text-slate-900">
                              {user.name}
                            </p>
                            <p className="text-[12px] font-medium text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {user.exam}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${user.planBg}`}
                        >
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        {user.tests}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500">
                        {user.joined}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}
                          />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MainDashboard;
