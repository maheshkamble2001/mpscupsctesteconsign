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
import { Avatar, Badge, Button } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import {
  DocumentTextIcon,
  AcademicCapIcon,
  ListBulletIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

export function QuestionDrawer({ isOpen, close, question }) {
  const { locale } = useLocaleContext();

  if (!question) return null;
  const q = question;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return dayjs(dateStr).locale(locale).format("DD MMM, YYYY");
  };

  // Clean and reusable info row component matching student layout metrics
  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 py-2 px-1">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="truncate text-sm font-medium text-slate-700">
          {value || "—"}
        </span>
      </div>
    </div>
  );

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
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px]" />
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
                <DialogPanel className="pointer-events-auto w-screen max-w-sm">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size={10}
                          name={`Q ${q.QuestionID || ""}`}
                          initialColor="auto"
                          classNames={{ display: "text-sm font-bold" }}
                        />
                        <div>
                          <h2 className="text-base font-semibold text-slate-800">
                            Question #{q.QuestionID || "—"}
                          </h2>
                          <p className="text-[11px] text-slate-500 uppercase font-medium tracking-tight">
                            Assessment Profile
                          </p>
                        </div>
                      </div>
                      <button onClick={close} className="rounded-full p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                      <div className="space-y-6">
                        
                        {/* Section 1: Core Assessment Text */}
                        <div>
                          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                            Assessment Description
                          </h3>
                          <div className="rounded-xl border border-slate-50 bg-slate-50/30 p-3">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                              {q.Question || "—"}
                            </p>
                          </div>
                        </div>

                        {/* Section 2: Multiple Choice Options */}
                        <div>
                          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                            Answer Options
                          </h3>
                          <div className="space-y-2">
                            {[1, 2, 3, 4].map((num) => {
                              const optionText = q[`Option${num}`];
                              const isCorrect = optionText && optionText === q.CorrectOption;
                              
                              return (
                                <div 
                                  key={num} 
                                  className={`flex items-start gap-3 p-2.5 rounded-xl border text-sm transition-colors ${
                                    isCorrect 
                                      ? "bg-emerald-50/60 border-emerald-100 text-emerald-800" 
                                      : "bg-slate-50/30 border-slate-100 text-slate-700"
                                  }`}
                                >
                                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                                    isCorrect 
                                      ? "bg-emerald-500 text-white" 
                                      : "bg-slate-100 text-slate-500"
                                  }`}>
                                    {String.fromCharCode(64 + num)}
                                  </span>
                                  <span className={`font-medium break-words flex-1 ${isCorrect ? "font-semibold" : ""}`}>
                                    {optionText || "—"}
                                  </span>
                                  {isCorrect && (
                                    <CheckCircleIcon className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Section 3: Answer Rationale Explanation */}
                        {q.AnswerDesc && (
                          <div>
                            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                              Answer Explanation
                            </h3>
                            <div className="flex gap-2.5 rounded-xl border border-amber-100 bg-amber-50/30 p-3 text-sm text-slate-700">
                              <InformationCircleIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                              <p className="leading-relaxed whitespace-pre-line font-medium text-slate-600">
                                {q.AnswerDesc}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Section 4: Taxonomy & System Config */}
                        <div>
                          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                            Taxonomy & Context
                          </h3>
                          <div className="divide-y divide-slate-50 rounded-xl border border-slate-50 bg-slate-50/30 px-3">
                            <InfoRow 
                              icon={AcademicCapIcon} 
                              label="Subject Name" 
                              value={q.Subject?.SubjectName || "—"} 
                            />
                            <InfoRow 
                              icon={BookmarkIcon} 
                              label="Exam Type Map" 
                              value={q.ExamType?.name || "—"} 
                            />
                            <InfoRow 
                              icon={CalendarDaysIcon} 
                              label="Added On" 
                              value={formatDate(q.addedon)} 
                            />
                            
                            {/* System Status Row */}
                            <div className="flex items-center gap-3 py-2 px-1">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                                <DocumentTextIcon className="h-4.5 w-4.5 text-slate-500" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-medium uppercase text-slate-400">Database Status</span>
                                <Badge 
                                  color={!q.isdeleted ? "success" : "danger"} 
                                  variant="soft" 
                                  className="w-fit py-2 px-2 text-[14px] font-bold mt-0.5"
                                >
                                  {!q.isdeleted ? "Live / Active" : "Deleted"}
                                </Badge>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 p-5 bg-white">
                      <Button
                        onClick={close}
                        className="w-full flex cursor-pointer items-center justify-center gap-2 rounded px-4 py-2 font-semibold text-black shadow-md shadow-blue-100 transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{
                          background: "var(--app-btn-primary)",
                          fontSize: '13px'
                        }}
                      >
                        Close Blueprint View
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

QuestionDrawer.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  question: PropTypes.object,
};