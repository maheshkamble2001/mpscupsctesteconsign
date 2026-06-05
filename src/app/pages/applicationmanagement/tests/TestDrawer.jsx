import React, { Fragment, useState, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { toast } from "sonner";

// UI Components & Icons
import { Button } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import {
  ClockIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  DocumentTextIcon,
  LanguageIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";
import { ListBulletIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { updateTestStatus } from "api/applicationmanagement/tests";

// Reusable micro-component for standard data row display
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

InfoRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  valueColor: PropTypes.string,
};

// Interactive row for changing configuration toggles with API indicators
const ToggleRow = ({ label, description, checked, onChange, isUpdating }) => (
  <div className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50/50">
    <div className="flex flex-col pr-4">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <span className="text-[10px] text-slate-400 mt-0.5">{description}</span>
    </div>
    <div className="flex items-center gap-2">
      {isUpdating && <ArrowPathIcon className="h-3.5 w-3.5 text-amber-500 animate-spin" />}
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? "bg-amber-600" : "bg-slate-200"
          } ${isUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-4" : "translate-x-0"
            }`}
        />
      </button>
    </div>
  </div>
);

ToggleRow.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  isUpdating: PropTypes.bool,
};

// Section wrapper for UI logical grouping
const Section = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="mb-2 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
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

export function TestDrawer({ isOpen, close, test, onRefresh }) {
  const { locale } = useLocaleContext();
  const [updatingKey, setUpdatingKey] = useState(null);
  const [localSettings, setLocalSettings] = useState({});

  const rawData = test?.data || test;
  console.log(rawData)

  useEffect(() => {
    if (rawData) {
      setLocalSettings({
        isShuffle: !!rawData.isShuffle,
        isAnswerShuffle: !!rawData.isAnswerShuffle,
        isAllowReview: !!rawData.isAllowReview,
        isShowWarningTimer: !!rawData.isShowWarningTimer,
        isDisableRightClick: !!rawData.isDisableRightClick,
      });
    }
  }, [test, rawData]);

  if (!test) return null;

  // Layout Metric Math Calculations
  const totalQuestions = rawData.noOfQuestions || 0;
  const marksPerCorrect = rawData.marksPerQuestion || 0;
  const calculatedTotalMarks = totalQuestions * marksPerCorrect;
  const displaySubjects = rawData.TestQuestions || rawData.subjects || [];

  // Calculate distinct subjects total count summary metrics
  const totalSubjectsCount = displaySubjects.length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return dayjs(dateStr).locale(locale).format("DD MMM, YYYY");
  };

  const handleToggleChange = async (key, newValue) => {
    try {
      setUpdatingKey(key);
      const payload = { [key]: newValue };

      // Replace this simulation block directly with your API handler route
      const res = await updateTestStatus({TestId:rawData?.TestId,status:key})

      if (res?.code === 200) {
        setLocalSettings(prev => ({ ...prev, [key]: newValue }));
        toast.success(res.message);
        if (onRefresh) onRefresh();
      } else {
        toast.error(res?.message || "Failed to update configuration toggle status");
      }
    } catch (error) {
      console.error("Error setting property status dynamically:", error);
      toast.error("Network interface connection processing error");
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={close}>
        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild as={Fragment} enter="transform transition ease-in-out duration-300" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-300" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                <DialogPanel className="pointer-events-auto w-screen max-w-[420px]">
                  <div className="flex h-full flex-col bg-[#F8FAFC] shadow-2xl">

                    {/* Header Layout */}
                    <div className="z-10 flex items-center justify-between border-b border-slate-200/60 bg-white px-6 py-4.5 shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-[#366db0] text-[16px] font-bold uppercase text-white shadow-md">
                          {rawData.TestName?.charAt(0) || "T"}
                        </div>
                        <div className="flex flex-col">
                          <h2 className="line-clamp-1 text-[17px] font-bold tracking-tight text-slate-900" title={rawData.TestName}>
                            {rawData.TestName}
                          </h2>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                              {rawData.TestType || "REGULAR"}
                            </span>
                            {rawData.Exam?.ExamName && (
                              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-600">
                                {rawData.Exam.ExamName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button onClick={close} className="rounded-full border border-slate-100 bg-slate-50 p-1.5 text-slate-400 transition-all hover:rotate-90 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-5 pb-8">

                      {/* Configuration Controls Toggles */}
                      

                      {/* Structure Settings Profiles */}
                      <Section title="Test Details">
                        <InfoRow icon={ClockIcon} iconColor="text-blue-500" label="Duration" value={rawData.Duration ? `${rawData.Duration} Mins` : "—"} />
                        <InfoRow icon={Squares2X2Icon} iconColor="text-indigo-500" label="Allocated Subjects" value={totalSubjectsCount ? `${totalSubjectsCount} Subjects` : "0"} />
                        <InfoRow icon={ListBulletIcon} iconColor="text-purple-500" label="Total Questions" value={totalQuestions} />
                        <InfoRow icon={DocumentTextIcon} iconColor="text-emerald-500" label="Total Marks" value={calculatedTotalMarks || "—"} />
                        <InfoRow icon={CheckCircleIcon} iconColor="text-rose-500" label="Negative Marks" value={rawData.negativeMarks !== undefined ? `${rawData.negativeMarks}` : "0"} />
                      </Section>

                      {/* Language Localization Array */}
                      <Section title="Language Details">
                        <div className="flex flex-col px-5 py-3.5">
                          <div className="flex items-center gap-3.5 mb-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
                              <LanguageIcon className="h-4 w-4 text-cyan-500" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Languages Available</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {rawData.languages?.length > 0 ? (
                              rawData.languages.map((lang, idx) => (
                                <span key={idx} className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 uppercase">
                                  {lang.trim()}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs font-medium italic text-slate-400">No language bounds assigned</span>
                            )}
                          </div>
                        </div>
                      </Section>

                      {/* Dynamic Subject Distribution Blueprints mapping */}
                      {displaySubjects.length > 0 && (
                        <Section title="Subjects Questions">
                          <div className="divide-y divide-slate-100 bg-slate-50/30">
                            {displaySubjects.map((sub, idx) => {
                              const subjectName = sub.Subject?.SubjectName || `Subject (ID: ${sub.SubjectId})`;
                              return (
                                <div key={sub.id || idx} className="flex items-center justify-between p-3.5 transition-colors hover:bg-white">
                                  <div className="flex items-center gap-2.5">
                                    <AcademicCapIcon className="h-4 w-4 text-indigo-500" />
                                    <span className="text-xs font-semibold text-slate-700">{subjectName}</span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-xs">
                                    <span className="text-xs font-bold text-slate-600">{sub.questionCount} Qs</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Section>
                      )}
                      <Section title="Test Security & Execution Control">
                        <ToggleRow
                          label="Shuffle Questions"
                          description="Randomize question orders per candidate layout"
                          checked={!!localSettings.isShuffle}
                          isUpdating={updatingKey === "isShuffle"}
                          onChange={(val) => handleToggleChange("isShuffle", val)}
                        />
                        <ToggleRow
                          label="Shuffle Answers"
                          description="Scramble multiple choice option parameters dynamically"
                          checked={!!localSettings.isAnswerShuffle}
                          isUpdating={updatingKey === "isAnswerShuffle"}
                          onChange={(val) => handleToggleChange("isAnswerShuffle", val)}
                        />
                        <ToggleRow
                          label="Allow Review"
                          description="Permit candidates to flag questions and reassess answers"
                          checked={!!localSettings.isAllowReview}
                          isUpdating={updatingKey === "isAllowReview"}
                          onChange={(val) => handleToggleChange("isAllowReview", val)}
                        />
                        <ToggleRow
                          label="Warning Timer"
                          description="Display a localized alert when threshold limits approach"
                          checked={!!localSettings.isShowWarningTimer}
                          isUpdating={updatingKey === "isShowWarningTimer"}
                          onChange={(val) => handleToggleChange("isShowWarningTimer", val)}
                        />
                        <ToggleRow
                          label="Restrict Context (Anti-Cheat)"
                          description="Disable mouse right-clicks and structural clipboard access"
                          checked={!!localSettings.isDisableRightClick}
                          isUpdating={updatingKey === "isDisableRightClick"}
                          onChange={(val) => handleToggleChange("isDisableRightClick", val)}
                        />
                      </Section>
                    </div>



                    {/* Sticky Bottom Dock - Status Bar & Closing Actions */}
                    <div className="border-t border-slate-200/60 bg-white p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] space-y-3.5">

                      {/* Integrated Micro-Status Footer Bar */}
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400">
                          <CalendarDaysIcon className="h-4 w-4 text-amber-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {formatDate(rawData.addedOn || rawData.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${!rawData.isDeleted ? "bg-emerald-100/70 text-emerald-700" : "bg-rose-100/70 text-rose-700"
                            }`}>
                            {!rawData.isDeleted ? "ACTIVE" : "DELETED"}
                          </span>
                        </div>
                      </div>

                      {/* Main Drawer Dismiss Button Action */}
                      <Button
                        onClick={close}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-bold text-black shadow-sm transition-all hover:opacity-95 active:scale-[0.98]"
                        style={{ background: "var(--app-btn-primary)", fontSize: "13px" }}
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

TestDrawer.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  test: PropTypes.object,
  onRefresh: PropTypes.func,
};