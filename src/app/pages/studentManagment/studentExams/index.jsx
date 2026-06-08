import React, { useEffect, useState, Fragment, useRef } from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import {
    TrashIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
    AcademicCapIcon,
    CalendarDaysIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    XMarkIcon,
    CheckIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";
import { Page } from "components/shared/Page";
import { toast } from "sonner";

// Local Custom Delete Modal Import
import { ConfirmModal } from "components/shared/ConfirmModal";
import { assignExamsToStudent, getStudentExams } from "api/studentmanagement/student";
import { getExamDropdown } from "api/applicationmanagement/courses";

/* ========================================================================= 
   MULTIPLE EXAM SELECTOR MODAL BOX (WITH RE-MAPPED LIVE API INTEGRATION)
   ========================================================================= */
/* ========================================================================= 
   MULTIPLE EXAM SELECTOR MODAL BOX (WITH EXISTING RECORD DOCKING)
   ========================================================================= */
function AssignMultipleExamsModalBox({ isOpen, onClose, studentId, existingExams = [], onSave }) {
    const [examsMaster, setExamsMaster] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedExamIds, setSelectedExamIds] = useState([]);
    const [modalSearchKey, setModalSearchKey] = useState("");
    const [assignmentDescription, setAssignmentDescription] = useState("");
    const saveRef = useRef(null);

    // 1. Sync master data lists and map pre-existing assignments
    useEffect(() => {
        if (isOpen) {
            const fetchDropdowns = async () => {
                try {
                    setLoadingExams(true);
                    const res = await getExamDropdown();
                    if (res?.code === 200) {
                        const formattedExams = res.data.map((ex) => ({
                            label: ex.ExamName || ex.examName || "Unknown Exam",
                            value: String(ex.ExamId || ex.ExamID || ex.examId || ex.id),
                        }));
                        setExamsMaster(formattedExams);

                        // 2. Pre-select whatever exams the student already has assigned
                        if (existingExams && existingExams.length > 0) {
                            const preassignedIds = existingExams
                                .map(ee => String(ee.Exam?.ExamId || ee.Exam?.ExamID || ee.ExamId))
                                .filter(Boolean);

                            setSelectedExamIds(preassignedIds);
                        }
                    } else {
                        toast.error(res?.message || "Failed to load active exams master drop list.");
                    }
                } catch (error) {
                    console.error("Error fetching exam values:", error);
                    toast.error("Operational variance tracking down master exam list tables.");
                } finally {
                    setLoadingExams(false);
                }
            };

            fetchDropdowns();
        } else {
            setSelectedExamIds([]);
            setModalSearchKey("");
            setAssignmentDescription("");
        }
    }, [isOpen, existingExams]); // Listens to existingExams changes dynamically

    // Filter logic looking directly inside mapped "label" property string matrix
    const filteredExams = examsMaster.filter((exam) =>
        exam.label.toLowerCase().includes(modalSearchKey.toLowerCase())
    );

    const handleToggleExam = (examValueId) => {
        setSelectedExamIds((prev) =>
            prev.includes(examValueId)
                ? prev.filter((valueId) => valueId !== examValueId)
                : [...prev, examValueId]
        );
    };

    const handleSelectAllFiltered = () => {
        const filteredIds = filteredExams.map(exam => exam.value);
        const allFilteredAreSelected = filteredIds.every(id => selectedExamIds.includes(id));

        if (allFilteredAreSelected) {
            setSelectedExamIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            setSelectedExamIds(prev => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedExamIds.length === 0) {
            toast.error("Please select at least one examination paper to assign.");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                StudentId: studentId,
                ExamIds: selectedExamIds.map(id => Number(id)), // Convert back to numbers if needed by backend
                Description: assignmentDescription.trim()
            };

            const res = await assignExamsToStudent(payload);
            if (res?.code === 200) {
                toast.success("All selected examinations successfully assigned.");
                onSave();
                onClose();
            } else {
                toast.error(res?.message || "Something went wrong.");
            }
        } catch (err) {
            console.error("Multiple assignment submission error:", err);
            toast.error("An error occurred during bulk assignment execution.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
                onClose={onClose}
                initialFocus={saveRef}
            >
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                </TransitionChild>

                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel
                        className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
                        style={{
                            background: "linear-gradient(135deg, #ffffff, #fef7f7)"
                        }}
                    >
                        {/* Header Area */}
                        <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(51,104,175,0.1), rgba(254,69,67,0.1))"
                                    }}
                                >
                                    <AcademicCapIcon className="h-5 w-5" style={{ color: "#3368AF" }} />
                                </div>
                                <div>
                                    <DialogTitle className="text-sm font-bold text-slate-900">
                                        Assign Multiple Exams
                                    </DialogTitle>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Filter and select testing papers to batch allocate
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1 rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-4 w-4 stroke-[2.5]" />
                            </button>
                        </div>

                        {/* Live Search Input bar */}
                        <div className="p-3 bg-white border-b border-slate-100 flex-shrink-0">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:bg-white focus:border-slate-300 focus:outline-none text-slate-800 placeholder-slate-400"
                                    placeholder="Search exam by title..."
                                    value={modalSearchKey}
                                    onChange={(e) => setModalSearchKey(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Quick Action Selection Bar */}
                        {!loadingExams && filteredExams.length > 0 && (
                            <div className="px-5 py-2 bg-slate-100/40 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 flex-shrink-0">
                                <span>Showing {filteredExams.length} results ({selectedExamIds.length} selected)</span>
                                <button
                                    type="button"
                                    onClick={handleSelectAllFiltered}
                                    className="text-[#3368AF] hover:underline"
                                >
                                    {filteredExams.every(e => selectedExamIds.includes(e.value)) ? "Deselect Visible" : "Select Visible"}
                                </button>
                            </div>
                        )}

                        {/* Form layout */}
                        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
                            <div className="p-5 overflow-y-auto flex-1 space-y-4">

                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Select Examination Sheets *
                                    </label>

                                    {loadingExams ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((n) => (
                                                <div key={n} className="h-12 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : filteredExams.length === 0 ? (
                                        <p className="text-center text-xs font-semibold text-slate-400 py-6">
                                            {examsMaster.length === 0 ? "No records returned from dropdown API." : `No matches found for "${modalSearchKey}"`}
                                        </p>
                                    ) : (
                                        <div className="max-h-[180px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                                            {filteredExams.map((exam) => {
                                                const isChecked = selectedExamIds.includes(exam.value);

                                                // Check if this exam string ID was present in the incoming database array
                                                const wasAlreadyAssigned = existingExams.some(
                                                    (ee) => String(ee.Exam?.ExamId || ee.Exam?.ExamID || ee.ExamId) === exam.value
                                                );

                                                return (
                                                    <div
                                                        key={exam.value}
                                                        onClick={() => handleToggleExam(exam.value)}
                                                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${isChecked
                                                            ? "bg-slate-50 border-slate-950 shadow-sm"
                                                            : "bg-white border-slate-200 hover:border-slate-300"
                                                            }`}
                                                    >
                                                        <div className="min-w-0 pr-2">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-bold text-slate-900 truncate">{exam.label}</p>
                                                                {wasAlreadyAssigned && (
                                                                    <span className="text-[9px] font-medium bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded-full">
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${isChecked ? "bg-black border-black text-white" : "bg-white border-slate-300"
                                                            }`}>
                                                            {isChecked && <CheckIcon className="h-2.5 w-2.5 stroke-[3.5]" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Assignment Notes Description */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <DocumentTextIcon className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Assignment Notes / Description</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none placeholder-slate-400 resize-none"
                                        placeholder="Enter context details instructions..."
                                        value={assignmentDescription}
                                        onChange={(e) => setAssignmentDescription(e.target.value)}
                                    />
                                </div>

                            </div>

                            {/* Action Buttons Row Footer Layout */}
                            <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex justify-end gap-3 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || selectedExamIds.length === 0}
                                    ref={saveRef}
                                    className="px-5 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-40"
                                    style={{
                                        background: "var(--app-btn-primary, #000000)"
                                    }}
                                >
                                    {!submitting && <PlusIcon className="mr-1.5 h-3.5 w-3.5 inline-block stroke-[2.5]" />}
                                    {submitting ? "Processing..." : `Assign Selected (${selectedExamIds.length})`}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

/* ========================================================================= 
   REUSABLE DELETION CONTEXT MODAL
   ========================================================================= */
function DeleteExamModalBox({ show, onClose, data, refreshList }) {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const state = error ? "error" : success ? "success" : "pending";

    const messages = {
        pending: {
            Icon: ExclamationTriangleIcon,
            title: "Drop Exam Schedule?",
            description: "Are you sure you want to remove this scheduled exam assignment?",
            actionText: "Delete",
        },
        success: { title: "Exam Assignment Deleted" },
        error: { description: "An operational variance blocked removing this exam instance." },
    };

    const onOk = async () => {
        if (!data) return;
        try {
            setConfirmLoading(true);
            // Replace this mock timeout block with your live deletion endpoint execution if available:
            // const res = await deleteStudentExam(data);
            setTimeout(() => {
                toast.success("Exam allocation removed successfully");
                refreshList();
                setSuccess(true);
                setTimeout(() => onClose(), 1000);
            }, 1000);
        } catch (err) {
            setError(true);
        } finally {
            setConfirmLoading(false);
        }
    };

    return (
        <ConfirmModal
            show={show}
            onClose={onClose}
            messages={messages}
            onOk={onOk}
            confirmLoading={confirmLoading}
            state={state}
        />
    );
}

/* ========================================================================= 
   MAIN STUDENT EXAMS WORKSPACE PAGE
   ========================================================================= */
export default function StudentExamsPage() {
    const [searchKey, setSearchKey] = useState("");
    const [studentMetadata, setStudentMetadata] = useState(null);
    const [activeExams, setActiveExams] = useState([]);
    const [isSearch, setIsSearch] = useState(false);
    const [loading, setLoading] = useState(false);

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const cleanSearchKey = searchKey.trim();
        if (!cleanSearchKey) {
            toast.error("Please enter a valid mobile number or email address");
            setIsSearch(false);
            return;
        }

        try {
            setLoading(true);
            const response = await getStudentExams({ search: cleanSearchKey });

            if (response?.code === 200) {
                // Aligned with the incoming data objects matrix structure
                setActiveExams(response.data?.exams || []);
                setStudentMetadata(response.data?.student || null);
                setIsSearch(true);
            } else {
                toast.error(response?.message || "No student record found");
                setIsSearch(false);
            }
        } catch (error) {
            console.error("Search API Error:", error);
            toast.error("An error occurred during look up.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Page title="Student Exam Management" description="Look up and manage scheduled student tests by contact records">
            <div className="w-full h-full min-h-0 flex flex-col">
                <div className="flex h-full w-full flex-col bg-white min-h-0">

                    <div className="relative border-b border-slate-100 px-6 py-5 flex flex-col gap-1 flex-shrink-0">
                        <h1 className="text-foreground text-xl font-bold tracking-tight md:text-2xl">Student Exams Lookup</h1>
                        <p className="text-muted-foreground text-sm font-medium">Audit and manage student test records maps</p>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 md:p-8">
                        <div className="max-w-3xl mx-auto space-y-6">

                            {/* SEARCH INPUT */}
                            <form onSubmit={handleSearch} className="w-full md:w-[600px]">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Search via Student Mobile / Email Address
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold shadow-sm focus:border-slate-300 focus:outline-none text-slate-800 placeholder-slate-400"
                                            value={searchKey}
                                            onChange={(e) => {
                                                setSearchKey(e.target.value);
                                                if (isSearch) setIsSearch(false);
                                            }}
                                            placeholder="e.g. student@email.com or +91 9876543210"
                                        />
                                    </div>
                                    <button type="submit" className="h-11 px-5 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5">
                                        <MagnifyingGlassIcon className="h-4 w-4 stroke-[2.5]" /> Search
                                    </button>
                                </div>
                            </form>

                            {/* DASHBOARD WORKSPACE */}
                            {loading ? (
                                <div className="text-center py-12 text-xs font-bold text-slate-400">Loading dynamic portfolio records maps...</div>
                            ) : isSearch ? (
                                <>
                                    {/* Student Card Block - Synchronized with data response names */}
                                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-slate-100 p-1 rounded-md">
                                                    <UserIcon className="h-4 w-4 text-slate-600" />
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-900">{studentMetadata?.Name || "Student Records"}</h3>
                                                {studentMetadata?.City && (
                                                    <span className="text-[9px] font-extrabold text-[#3368AF] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                        {studentMetadata.City}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px]">
                                                {studentMetadata?.EmailID && <span className="flex items-center gap-1"><EnvelopeIcon className="h-3 w-3" />{studentMetadata.EmailID}</span>}
                                                {studentMetadata?.Mobile && <span className="flex items-center gap-1"><PhoneIcon className="h-3 w-3" />{studentMetadata.Mobile}</span>}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setIsAssignModalOpen(true)}
                                            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-black shadow-sm hover:shadow-md transition-all flex-shrink-0"
                                            style={{ background: "#F1F5F9" }}
                                        >
                                            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" /> Bulk Assign Exams
                                        </button>
                                    </div>

                                    {/* Allocated Exam Cards Lists */}
                                    <div className="flex flex-col gap-3">
                                        {activeExams.length === 0 ? (
                                            <div className="text-center py-10 bg-white border border-dashed rounded-2xl text-xs font-medium text-slate-400">
                                                No active exams assigned to this student yet.
                                            </div>
                                        ) : (
                                            activeExams.map((exam, index) => (
                                                <div key={exam.id || index} className="group bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start gap-4">
                                                    <div className="flex flex-col items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-2 self-center">
                                                        <span className="text-xs font-black text-slate-500 select-none px-0.5">
                                                            {String(index + 1).padStart(2, "0")}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-4">
                                                            {/* Evaluated target path from custom layout rules */}
                                                            <h4 className="text-xs font-bold text-slate-900 truncate">
                                                                {exam.Exam?.ExamName || "N/A Assigned Exam"}
                                                            </h4>
                                                            {/* <button
                                                                onClick={() => { setDeleteTargetId(exam.id); setIsDeleteModalOpen(true); }}
                                                                className="p-1 rounded border border-rose-100 hover:bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <TrashIcon className="h-3 w-3" />
                                                            </button> */}
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                                            <span className="flex items-center gap-1 text-[9px] font-extrabold text-[#3368AF] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                                                                <AcademicCapIcon className="h-3 w-3" /> Max Marks: {exam.Exam?.TotalMarks || '100'}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50/50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                                                <CalendarDaysIcon className="h-3 w-3" /> Added On: {exam.AddedOn ? new Date(exam.AddedOn).toLocaleDateString('en-IN') : 'N/A'}
                                                            </span>
                                                            {exam.Exam?.Stage && (
                                                                <span className="text-[9px] font-extrabold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                    Stage: {exam.Exam.Stage}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6">
                                    <EnvelopeIcon className="h-10 w-10 text-slate-300 mb-2" />
                                    <h3 className="text-xs font-bold text-slate-700">No profile matches tracked yet</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">Enter a mobile number or email address to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Headless UI Modal Overlay Component Block */}
            <AssignMultipleExamsModalBox
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                studentId={studentMetadata?.ID}
                existingExams={activeExams} // <-- Added this property link hook line
                onSave={() => handleSearch()}
            />

            <DeleteExamModalBox
                show={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setDeleteTargetId(null); }}
                data={deleteTargetId}
                refreshList={() => handleSearch()}
            />
        </Page>
    );
}