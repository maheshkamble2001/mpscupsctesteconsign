import React, { Fragment } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import PropTypes from "prop-types";

// UI Components
import { Button } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import {
  CalendarDaysIcon,
  IdentificationIcon,
  BanknotesIcon,
  UsersIcon,
  TagIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

// Reusable micro-component for standard data display rows
const InfoRow = ({ icon: Icon, iconColor = "text-blue-500", label, value, valueColor = "text-slate-900" }) => (
  <div className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50/50">
    <div className="flex items-center gap-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </span>
    </div>
    <span className={`text-[13px] font-bold text-right ${valueColor} max-w-[55%] truncate`} title={typeof value === 'string' ? value : ''}>
      {value !== null && value !== undefined && value !== "" ? value : "—"}
    </span>
  </div>
);

InfoRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  valueColor: PropTypes.string,
};

// Section wrapper for logical grouping
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="mb-2.5 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
      {title}
    </h3>
    <div className="divide-y divide-slate-100 overflow-hidden rounded-[20px] border border-slate-200/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      {children}
    </div>
  </div>
);

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export function CourseDrawer({ isOpen, close, course }) {
  const { locale } = useLocaleContext();
  console.log("Course Data in Drawer:", course); // Debug log to check course data structure
  if (!course) return null;
  const c = course;

  // Extract nested layout keys safely from your data structure
  const examName = c.Exam?.ExamName || null;
  const curriculumList = c.CourseCurriculum || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return dayjs(dateStr).locale(locale).format("DD MMM, YYYY");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={close}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-[460px]">
                  <div className="flex h-full flex-col bg-[#F8FAFC] shadow-2xl">
                    
                    {/* Header Layout */}
                    <div className="z-10 flex items-center justify-between border-b border-slate-200/60 bg-white px-7 py-5 shadow-sm">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[14px] bg-[#0A0E17] text-[18px] font-bold uppercase text-white shadow-md overflow-hidden border border-slate-200">
                          {c.CoverImage ? (
                            <img src={c.CoverImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            c.CourseTitle?.charAt(0) || "C"
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h2
                            className="text-[17px] font-bold tracking-tight text-slate-900 truncate"
                            title={c.CourseTitle}
                          >
                            {c.CourseTitle}
                          </h2>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                              {c.CourseCode || "COURSE"}
                            </span>
                            {examName && (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-blue-600 truncate max-w-[150px]">
                                {examName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={close}
                        className="cursor-pointer rounded-full border border-slate-100 bg-slate-50 p-2 text-slate-400 transition-all hover:rotate-90 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Scrollable Main Panels */}
                    <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6">
                      
                      {/* Detailed Marketing/Text Information Layout */}
                      <div className="mb-6 space-y-4">
                        {/* Tagline Container */}
                        <div className="bg-gradient-to-r from-indigo-50/60 to-slate-50 border border-indigo-100/50 rounded-[20px] p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)]">
                          <div className="flex items-center gap-2 mb-2">
                            <TagIcon className="h-4 w-4 text-indigo-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tag Line</span>
                          </div>
                          <p className="text-[13px] font-semibold text-slate-700 leading-relaxed break-words">
                            {c.TagLine || "No marketing tagline specified."}
                          </p>
                        </div>

                        {/* Description Block Container */}
                        <div className="bg-white border border-slate-200/60 rounded-[20px] p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                          <div className="flex items-center gap-2 mb-2.5">
                            <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Course Complete Breakdown Description</span>
                          </div>
                          <p className="text-[12.5px] font-medium text-slate-600 leading-relaxed whitespace-pre-line break-words">
                            {c.Description || "No instructional breakdown description provided for this record entry."}
                          </p>
                        </div>
                      </div>

                      {/* Structure Details Section */}
                      <Section title="Course Details">
                        <InfoRow icon={UsersIcon} iconColor="text-amber-500" label="No. of Seats" value={c.NoOfSeats} />
                        <InfoRow icon={CalendarDaysIcon} iconColor="text-emerald-500" label="Start Date" value={formatDate(c.StartDate)} />
                      </Section>

                      {/* Pricing Information Details */}
                      <Section title="Pricing Info">
                        <InfoRow
                          icon={BanknotesIcon}
                          iconColor="text-slate-400"
                          label="List Price"
                          value={`₹${c.CourseListPrice || 0}`}
                          valueColor="text-slate-400 line-through"
                        />
                        <InfoRow
                          icon={BanknotesIcon}
                          iconColor="text-emerald-600"
                          label="Launch Price"
                          value={`₹${c.CourseLaunchPrice || 0}`}
                          valueColor="text-emerald-600 text-[15px]"
                        />
                        
                        {/* ✅ Reactivated & Formatted EMI Status Block Row */}
                        <div className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50/50">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
                              <BanknotesIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                              EMI Available
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                              c.EMI || c.EMI === 1 || c.EMI === "1"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" 
                                : "bg-rose-50 text-rose-600 border-rose-200/50"
                            }`}
                          >
                            {c.EMI || c.EMI === 1 || c.EMI === "1" ? "YES" : "NO"}
                          </span>
                        </div>
                      </Section>

                      {/* Syllabus Curriculum Timeline Blocks */}
                      <div className="mb-6">
                        <h3 className="mb-2.5 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Syllabus Modules ({curriculumList.length})
                        </h3>
                        {curriculumList.length === 0 ? (
                          <div className="text-center py-6 bg-white border border-dashed border-slate-200 rounded-[20px] text-xs font-medium text-slate-400">
                            No active modules listed for this course.
                          </div>
                        ) : (
                          <div className="bg-white rounded-[20px] border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 space-y-4">
                            {curriculumList.map((module, idx) => (
                              <div key={module.CurriculumId || idx} className="flex gap-3 items-start group">
                                <div className="flex flex-col items-center shrink-0 mt-0.5">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 shadow-sm text-[10px] font-mono font-bold text-[#3368AF]">
                                    {String(idx + 1).padStart(2, "0")}
                                  </div>
                                  {idx !== curriculumList.length - 1 && (
                                    <div className="w-px h-12 bg-slate-100 my-1 group-hover:bg-slate-200 transition-colors" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 bg-slate-50/40 hover:bg-slate-50/80 rounded-xl border border-slate-100 p-3 transition-colors">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-xs font-bold text-slate-800 truncate">{module.ModuleName}</h4>
                                    {module.Duration && (
                                      <span className="shrink-0 text-[9px] font-extrabold text-[#3368AF] bg-blue-50/60 border border-blue-100/40 px-1.5 py-0.5 rounded">
                                        {module.Duration} Weeks
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                    {module.Description || "No description provided."}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Auditing System Details Section */}
                      <Section title="System Details">
                        <InfoRow icon={CalendarDaysIcon} iconColor="text-purple-500" label="Created On" value={formatDate(c.addedon)} />
                        
                        {/* ✅ Reactivated & Formatted System Status Badge Row */}
                        <div className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50/50">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
                              <IdentificationIcon className="h-4 w-4 text-cyan-500" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                              System Status
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                              c.Status || c.Status === 1 || c.Status === "1"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" 
                                : "bg-slate-100 text-slate-500 border-slate-200/40"
                            }`}
                          >
                            {c.Status || c.Status === 1 || c.Status === "1" ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                      </Section>
                    </div>

                    {/* Footer Close Actions */}
                    <div className="border-t border-slate-200/60 bg-white p-5 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                      <Button
                        onClick={close}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{
                          background: "var(--app-btn-primary, #3368AF)",
                          fontSize: "13px",
                        }}
                      >
                        Close Details
                      </Button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

CourseDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  course: PropTypes.shape({
    CourseTitle: PropTypes.string,
    CourseCode: PropTypes.string,
    CoverImage: PropTypes.string,
    TagLine: PropTypes.string,
    Description: PropTypes.string,
    NoOfSeats: PropTypes.number,
    StartDate: PropTypes.string,
    CourseListPrice: PropTypes.number,
    CourseLaunchPrice: PropTypes.number,
    EMI: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
    addedon: PropTypes.string,
    Status: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
    Exam: PropTypes.shape({
      ExamName: PropTypes.string,
    }),
    CourseCurriculum: PropTypes.arrayOf(
      PropTypes.shape({
        CurriculumId: PropTypes.number,
        ModuleName: PropTypes.string,
        Description: PropTypes.string,
        Duration: PropTypes.number,
      })
    ),
  }),
};