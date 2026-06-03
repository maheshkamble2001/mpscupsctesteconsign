import React, { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import PropTypes from "prop-types";

// UI Components
import { Button } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import {
  ClockIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { LayoutListIcon } from "lucide-react";
import { StyledSwitch } from "components/shared/form/StyledSwitch";

// Reusable micro-component for data display
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
    <span className={`text-[14px] font-bold text-right ${valueColor}`}>
      {value !== null && value !== undefined && value !== "" ? value : "—"}
    </span>
  </div>
);

// Section wrapper for logical grouping
const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="mb-3.5 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
      {title}
    </h3>
    <div className="divide-y divide-slate-100 overflow-hidden rounded-[20px] border border-slate-200/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      {children}
    </div>
  </div>
);

export function ExamDrawer({ isOpen, close, exam, onToggleSettings }) {
  const { locale } = useLocaleContext();

  if (!exam) return null;
  const e = exam;

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
                <DialogPanel className="pointer-events-auto w-screen max-w-[420px]">
                  <div className="flex h-full flex-col bg-[#F8FAFC] shadow-2xl">
                    
                    {/* Header */}
                    <div className="z-10 flex items-center justify-between border-b border-slate-200/60 bg-white px-7 py-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[#0A0E17] text-[18px] font-bold uppercase text-white shadow-md">
                          {e.ExamName?.charAt(0) || "E"}
                        </div>
                        <div className="flex flex-col">
                          <h2
                            className="line-clamp-1 text-[19px] font-bold tracking-tight text-slate-900"
                            title={e.ExamName}
                          >
                            {e.ExamName}
                          </h2>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                              {e.ExamShortName || "EXAM"}
                            </span>
                            {e.Stage && (
                              <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-600">
                                {e.Stage}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={close}
                        className="rounded-full border border-slate-100 bg-slate-50 p-2 text-slate-400 transition-all hover:rotate-90 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="custom-scrollbar flex-1 overflow-y-auto px-7 py-8">
                      
                      {/* Structure Section */}
                      <Section title="Structure">
                        <InfoRow icon={ClockIcon} iconColor="text-blue-500" label="Duration" value={e.Duration} />
                        <InfoRow icon={LayoutListIcon} iconColor="text-indigo-500" label="Total Questions" value={e.TotalQuestions} />
                        <InfoRow icon={DocumentDuplicateIcon} iconColor="text-[#F5A524]" label="Total Marks" value={e.TotalMarks} />
                        <InfoRow icon={GlobeAltIcon} iconColor="text-emerald-500" label="Exam Medium" value={e.ExamMedium} />
                      </Section>

                      {/* Marking Scheme Section */}
                      <Section title="Marking Scheme">
                        <InfoRow
                          icon={CheckCircleIcon}
                          iconColor="text-emerald-500"
                          label="Mark Per Correct"
                          value={`+${e.MarkPerCorrect}`}
                          valueColor="text-emerald-600"
                        />
                        <InfoRow
                          icon={XCircleIcon}
                          iconColor="text-rose-500"
                          label="Negative Marking"
                          value={e.NegativeMark}
                          valueColor="text-rose-500"
                        />
                        <InfoRow
                          icon={TrophyIcon}
                          iconColor="text-amber-500"
                          label="Cut Off marks"
                          value={e.CuttOff}
                          valueColor="text-amber-600"
                        />
                      </Section>

                      {/* Subjects */}
                      {e.Subjects && e.Subjects.length > 0 && (
                        <Section title="Subjects">
                          <div className="flex flex-wrap gap-2 px-5 py-4">
                            {e.Subjects.map((sub, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-lg border border-blue-100/50 bg-blue-50 px-2.5 py-1 text-[12px]  text-blue-400 shadow-sm"
                              >
                                {sub.SubjectName}
                              </span>
                            ))}
                          </div>
                        </Section>
                      )}

                      {/* System Details Section */}
                      <Section title="System Details">
                        <InfoRow icon={CalendarDaysIcon} iconColor="text-purple-500" label="Created On" value={formatDate(e.addedOn)} />
                        
                        <div className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50/50">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
                              <IdentificationIcon className="h-4 w-4 text-cyan-500" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                              Status
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold uppercase ${
                              e.status === 1 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {e.status === 1 ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                      </Section>

                      {/* Settings Section */}
                      <Section title="Settings">
                        <div className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50/50">
                          <span className="text-[13px] font-bold text-slate-700">Show In Catalogue</span>
                          <StyledSwitch
                            checked={!!e.ShowInCatalogue}
                            onChange={(val) => onToggleSettings?.(e.exam_id, "ShowInCatalogue", val ? 1 : 0)}
                          />
                        </div>
                        <div className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50/50">
                          <span className="text-[13px] font-bold text-slate-700">All Free Trial</span>
                          <StyledSwitch
                            checked={!!e.AllFreeTrial}
                            onChange={(val) => onToggleSettings?.(e.exam_id, "AllFreeTrial", val ? 1 : 0)}
                          />
                        </div>
                        <div className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50/50">
                          <span className="text-[13px] font-bold text-slate-700">Open Enrollment</span>
                          <StyledSwitch
                            checked={!!e.OpenEnrollment}
                            onChange={(val) => onToggleSettings?.(e.exam_id, "OpenEnrollment", val ? 1 : 0)}
                          />
                        </div>
                      </Section>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200/60 bg-white p-5 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                      <Button
                        onClick={close}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-black shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{
                          background: "var(--app-btn-primary)",
                          fontSize: "14px",
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

ExamDrawer.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  exam: PropTypes.object,
  onToggleSettings: PropTypes.func,
};
