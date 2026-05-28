import React, { useEffect, useState } from 'react';
import { 
  FileText, Users, Award, IndianRupee, 
  TrendingUp, ArrowUpRight, PlayCircle, CheckCircle,
  Calendar, ChevronRight, BarChart3, PieChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Page } from 'components/shared/Page';

const MainDashboard = () => {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // Cookie से एडमिन का नाम निकालने का फंक्शन
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const fullName = getCookie('name');
    if (fullName) {
      const decodedName = decodeURIComponent(fullName);
      setAdminName(decodedName.split(' ')[0]); // केवल फ़र्स्ट नेम डिस्प्ले करने के लिए
    }
  }, []);

  // 1. Core Analytics Summary Cards
  const summaryCards = [
    { title: "Total Enrolled Students", value: "3,842", icon: Users, change: "+14% this month", color: "text-[#3567AE]", bg: "bg-[#3567AE]/5" },
    { title: "Active Test Series", value: "118", icon: FileText, change: "+8 new live", color: "text-red-600", bg: "bg-red-50" },
    { title: "Total Courses Published", value: "14", icon: PlayCircle, change: "2 Streams (MPSC/UPSC)", color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Monthly Revenue", value: "₹4,82,900", icon: IndianRupee, change: "+22% growth", color: "text-amber-600", bg: "bg-amber-50" }
  ];

  // 2. Recent Test Attempts / Activities
  const recentActivities = [
    { id: 1, candidate: "Rahul Deshmukh", test: "MPSC State Services Prelims - Mock 1", score: "142/200", status: "Passed", time: "10 mins ago" },
    { id: 2, candidate: "Priya Patil", test: "UPSC CSAT Sectional - Aptitude II", score: "88/200", status: "Review Required", time: "25 mins ago" },
    { id: 3, candidate: "Aniket Shinde", test: "STI/PSI Combined Group B Prelims", score: "112/200", status: "Passed", time: "1 hour ago" },
    { id: 4, candidate: "Snehal Joshi", test: "MPSC Rajyaseva Daily CA Quiz", score: "45/50", status: "Passed", time: "2 hours ago" }
  ];

  // 3. Course Enrollment Breakdown Data
  const streamDistribution = [
    { name: "MPSC State Services", value: 55, color: "#3567AE" }, // Royal Blue
    { name: "UPSC Civil Services", value: 30, color: "#DC2626" },   // Crimson Red
    { name: "Combined Group B/C", value: 15, color: "#10B981" }
  ];

  const weeklySignups = [120, 145, 190, 165, 210, 240, 185];

  // Framer Motion Animation Settings
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } }
  };

  return (
    <Page title="Management Dashboard">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-[#f8fafc]"
      >
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
          
          {/* ⭐ Top Header Section */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                Welcome back, {adminName} 
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Here is the current live status of your MPSC & UPSC online test series portal.
              </p>
            </div>
            <div className="flex gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Calendar size={14} className="mt-0.5" /> Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </motion.div>

          {/* ⭐ 4 Columns Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {summaryCards.map((card, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className={`${card.bg} p-2.5 rounded-xl`}>
                    <card.icon size={20} className={card.color} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <TrendingUp size={10} /> {card.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{card.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ⭐ Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Weekly Student Registrations (2 Columns wide) */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#3567AE]/5 rounded-xl">
                    <BarChart3 size={18} className="text-[#3567AE]" />
                  </div>
                  <h3 className="font-black tracking-tight text-slate-800 text-sm uppercase">Weekly Student Signups</h3>
                </div>
                <span className="text-xs font-bold text-gray-400">Last 7 days registration metrics</span>
              </div>
              
              <div className="flex items-end gap-3 h-44 pt-4 px-2">
                {weeklySignups.map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-50 rounded-t-lg h-[120px] flex items-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(value / 250) * 120}px` }}
                        transition={{ duration: 0.7, delay: i * 0.04 }}
                        className="w-full bg-gradient-to-t from-[#3567AE] to-[#5185cf] rounded-t-lg hover:opacity-95 cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Course Streams Distribution Pie (1 Column wide) */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-50 rounded-xl">
                    <PieChart size={18} className="text-red-600" />
                  </div>
                  <h3 className="font-black tracking-tight text-slate-800 text-sm uppercase">Stream Distribution</h3>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row lg:flex-col gap-6 items-center pt-2">
                {/* SVG Semi-Pie Generator */}
                <div className="relative w-28 h-28 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      let cumulative = 0;
                      return streamDistribution.map((stream, idx) => {
                        const percentage = stream.value;
                        const startAngle = cumulative * 3.6;
                        const endAngle = (cumulative + percentage) * 3.6;
                        cumulative += percentage;
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;
                        const x1 = 50 + 40 * Math.cos(startRad);
                        const y1 = 50 + 40 * Math.sin(startRad);
                        const x2 = 50 + 40 * Math.cos(endRad);
                        const y2 = 50 + 40 * Math.sin(endRad);
                        const largeArc = percentage > 50 ? 1 : 0;
                        return (
                          <path
                            key={idx}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={stream.color}
                            className="transition-all duration-200 hover:opacity-90"
                          />
                        );
                      });
                    })()}
                    <circle cx="50" cy="50" r="24" fill="white" />
                  </svg>
                </div>
                
                <div className="w-full space-y-2">
                  {streamDistribution.map((stream, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stream.color }} />
                        <span className="text-slate-500 font-semibold">{stream.name}</span>
                      </div>
                      <span className="text-slate-700">{stream.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ⭐ Recent Activity & Evaluation Logs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Award size={18} /></div>
                <h3 className="font-black tracking-tight text-slate-800 text-sm uppercase">Recent Test Submissions</h3>
              </div>
              <button className="text-xs text-[#3567AE] hover:underline font-bold flex items-center gap-0.5">
                View Evaluation Logs <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/60 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <th className="p-4">Candidate Student</th>
                    <th className="p-4">Attempted Test Module</th>
                    <th className="p-4">Secured Score</th>
                    <th className="p-4">Status Log</th>
                    <th className="p-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-bold">
                  {recentActivities.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 text-slate-800">{log.candidate}</td>
                      <td className="p-4 text-gray-500 font-semibold">{log.test}</td>
                      <td className="p-4 text-slate-700 font-extrabold">{log.score}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${log.status === 'Passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          <span className={`h-1 w-1 rounded-full ${log.status === 'Passed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-400 font-semibold">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </motion.div>
    </Page>
  );
};

export default MainDashboard;