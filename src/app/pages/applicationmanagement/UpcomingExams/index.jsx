import React, { useState, useMemo, useEffect } from "react";
import {
    PencilIcon,
    TrashIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    InboxIcon,
    FunnelIcon,
    ArrowTopRightOnSquareIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Page } from "components/shared/Page";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { toast } from "sonner";
import clsx from "clsx";
import { Button } from "components/ui";
import { verifyRole } from "utils/utilities";
import { Navigate, useNavigate } from "react-router";
import { getUpcomingExamsList } from "api/applicationmanagement/upcomingexams";

// Placeholder import paths for your API layer (Adjust according to your structure)
// import { getExamsList, deleteExam } from "api/exammanagement/upcomingexams";
// import { ExamFormModal } from "./ExamFormModal"; 

/* ========================================================================= 
   DELETE CONFIRMATION MODALBOX
   ========================================================================= */
function DeleteExamModal({ show, onClose, examId, refreshList }) {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const state = error ? "error" : success ? "success" : "pending";

    const messages = {
        pending: {
            Icon: ExclamationTriangleIcon,
            title: "Delete Exam Listing?",
            description: "Are you sure you want to delete this upcoming exam listing? This action cannot be undone.",
            actionText: "Delete Record",
        },
        success: {
            title: "Exam Deleted Successfully",
        },
        error: {
            description: "Something went wrong while removing the exam record.",
        },
    };

    const handleConfirmDelete = async () => {
        if (!examId) {
            toast.error("Invalid Exam Identifier");
            return;
        }
        try {
            setConfirmLoading(true);
            // Replace with your actual API endpoint invocation:
            // const res = await deleteExam({ ExamID: examId });

            // Simulating API Call Success
            const res = { code: 200, message: "Exam record deleted successfully" };

            if (res.code === 200) {
                toast.success(res.message);
                refreshList();
                setSuccess(true);
                setTimeout(() => onClose(), 1500);
            } else {
                toast.error(res.message || "Failed to delete record");
                setError(true);
            }
        } catch (err) {
            console.error("Delete operation failure:", err);
            toast.error("Something went wrong during deletion");
            setError(true);
        } finally {
            setConfirmLoading(false);
        }
    };

    useEffect(() => {
        if (!show) {
            setSuccess(false);
            setError(false);
            setConfirmLoading(false);
        }
    }, [show]);

    return (
        <ConfirmModal
            show={show}
            onClose={() => {
                setSuccess(false);
                setError(false);
                onClose();
            }}
            messages={messages}
            onOk={handleConfirmDelete}
            confirmLoading={confirmLoading}
            state={state}
        />
    );
}

/* ========================================================================= 
   MAIN EXAMS PAGE COMPONENT
   ========================================================================= */
export default function UpcomingExamsPage() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedType, setSelectedType] = useState("ALL");

    // Modal UI Toggle States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [targetExam, setTargetExam] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // 1. Fetch initial Exams data matrix
    const fetchExams = async () => {
        try {
            setLoading(true);
            // Replace with your actual API integration
            const response = await getUpcomingExamsList(
                {
                    search:searchQuery,
                    // limit:limit,
                    // page:
                }
            );
            // if (response?.code === 200) setExams(response.data?.rows || response.data || []);

            // Mock Mocking data structure representing your Sequelize attributes:
            setExams([
                {
                    ExamID: 1,
                    ExamTitle: "UPSC Civil Services Examination 2026",
                    Slug: "upsc-civil-services-2026",
                    Organization: "UPSC",
                    Category: "Civil Services",
                    ExamType: "Central",
                    StateId: null,
                    NotificationDate: "2026-02-14",
                    ApplicationStartDate: "2026-02-15",
                    ApplicationEndDate: "2026-03-05",
                    ExamDate: "2026-05-24",
                    Status: "OPEN",
                    TotalPosts: 1056,
                    OfficialURL: "https://upsc.gov.in",
                    Source: "ADMIN"
                },
                {
                    ExamID: 2,
                    ExamTitle: "MPSC State Services Prelims 2026",
                    Slug: "mpsc-state-services-2026",
                    Organization: "MPSC",
                    Category: "Civil Services",
                    ExamType: "State",
                    StateId: 27, // Maharashtra
                    NotificationDate: "2026-06-10",
                    ApplicationStartDate: "2026-06-12",
                    ApplicationEndDate: "2026-07-02",
                    ExamDate: "2026-09-13",
                    Status: "UPCOMING",
                    TotalPosts: 420,
                    OfficialURL: "https://mpsc.gov.in",
                    Source: "SCRAPER"
                }
            ]);
        } catch (error) {
            console.error("Error fetching exams list:", error);
            toast.error("An error occurred while loading exams");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    // 2. Perform Filtering Client-Side based on input fields
    const filteredExams = useMemo(() => {
        return exams.filter((exam) => {
            const matchesSearch =
                exam.ExamTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.Organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.Category?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = selectedStatus === "ALL" || exam.Status === selectedStatus;
            const matchesType = selectedType === "ALL" || exam.ExamType === selectedType;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [exams, searchQuery, selectedStatus, selectedType]);

    const handleInitDelete = (examId) => {
        setDeleteTargetId(examId);
        setIsDeleteModalOpen(true);
    };

    const handleEditInit = (exam) => {
        setTargetExam(exam);
        setIsFormModalOpen(true);
    };

    const handleCreateInit = () => {
        setTargetExam(null);
        setIsFormModalOpen(true);
    };

    return (
        <Page title="Upcoming Exams Board" description="Track, manage and publish state/central examination notifications">
            <div className="w-full h-full min-h-0 flex flex-col bg-[#F8FAFC]">

                {/* Header Action Row */}
                <div className="bg-white border-b border-slate-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                    <div>
                        <h1 className="text-slate-900 text-xl font-bold tracking-tight md:text-2xl">Upcoming Exams</h1>
                        <p className="text-slate-500 text-xs font-medium mt-0.5">Configure listings, scrape metadata records, and set active dates.</p>
                    </div>
                    <Button
                        disabled={verifyRole(300007)}
                        onClick={() => !verifyRole(300007) && navigate("add")}
                        className={clsx(
                            "flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-semibold text-black shadow-lg transition-all hover:shadow-xl",
                            verifyRole(300007) && "cursor-not-allowed opacity-50"
                        )}
                        style={{
                            background: verifyRole(300007) ? "#9CA3AF" : "var(--app-btn-primary)",
                        }}
                    >
                        <PlusIcon className="h-4 w-4 font-bold" />
                        Add New Exam
                    </Button>
                </div>

                {/* Filters Matrix Panel */}
                <div className="bg-white border-b border-slate-100 p-4 flex flex-col md:flex-row items-center gap-3 flex-shrink-0">
                    <div className="relative flex-1 w-full">
                        <MagnifyingGlassIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Exam Title, Organization (e.g. UPSC), or Category..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:border-slate-300 focus:bg-white focus:outline-none text-slate-800"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
                        {/* Status Filter */}
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 w-full md:w-auto">
                            <FunnelIcon className="h-3.5 w-3.5 text-slate-400" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="UPCOMING">Upcoming</option>
                                <option value="OPEN">Open</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        {/* Exam Type Filter */}
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 w-full md:w-auto">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                            >
                                <option value="ALL">All Levels</option>
                                <option value="Central">Central</option>
                                <option value="State">State</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Workspace Data Stream */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        {loading ? (
                            <div className="text-center py-12 text-xs font-bold text-slate-400">Fetching current operational data feeds...</div>
                        ) : filteredExams.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
                                <InboxIcon className="h-10 w-10 text-slate-300 mb-2" />
                                <h3 className="text-xs font-bold text-slate-700">No Exams Scheduled</h3>
                                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">No entries match your structural query modifiers.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredExams.map((exam) => (
                                    <div
                                        key={exam.ExamID}
                                        className="group bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                    >
                                        {/* Left Block: Identity & Tags */}
                                        <div className="space-y-2 max-w-2xl">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={clsx(
                                                    "text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border",
                                                    exam.Status === "OPEN" && "bg-emerald-50 border-emerald-200 text-emerald-700",
                                                    exam.Status === "UPCOMING" && "bg-blue-50 border-blue-200 text-blue-700",
                                                    exam.Status === "CLOSED" && "bg-rose-50 border-rose-200 text-rose-700"
                                                )}>
                                                    {exam.Status}
                                                </span>
                                                <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                                                    {exam.Organization}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">
                                                    {exam.ExamType} {exam.ExamType === "State" && `(ID: ${exam.StateId})`}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400 font-mono">
                                                    Source: {exam.Source}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-black transition-colors">
                                                    {exam.ExamTitle}
                                                </h3>
                                                <p className="text-[11px] font-mono text-slate-400 mt-0.5">Slug: {exam.Slug}</p>
                                            </div>

                                            {/* Sub Data Elements */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                                                <div>Total Openings: <span className="font-bold text-slate-800">{exam.TotalPosts}</span></div>
                                                <div className="hidden sm:inline text-slate-300">•</div>
                                                <div>Category: <span className="font-medium text-slate-700">{exam.Category || "N/A"}</span></div>
                                            </div>
                                        </div>

                                        {/* Middle Block: Key Application Window Dates */}
                                        <div className="border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-left bg-slate-50/50 p-3 rounded-xl lg:bg-transparent lg:p-0">
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Apply Window</span>
                                                <span className="text-xs font-semibold text-slate-700">
                                                    {exam.ApplicationStartDate ? new Date(exam.ApplicationStartDate).toLocaleDateString() : "—"} to {exam.ApplicationEndDate ? new Date(exam.ApplicationEndDate).toLocaleDateString() : "—"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Exam Date</span>
                                                <span className="text-xs font-bold text-indigo-600">
                                                    {exam.ExamDate ? new Date(exam.ExamDate).toLocaleDateString() : "TBD"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Block: Actions Panel */}
                                        <div className="flex items-center justify-end gap-2 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
                                            {exam.OfficialURL && (
                                                <a
                                                    href={exam.OfficialURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
                                                    title="Visit Official URL"
                                                >
                                                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleEditInit(exam)}
                                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                                                title="Edit Record"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleInitDelete(exam.ExamID)}
                                                className="p-2 rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-600 transition-colors"
                                                title="Delete Record"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Exam Form Modal Instance Placeholder */}
            {/* <ExamFormModal 
                isOpen={isFormModalOpen} 
                onClose={() => setIsFormModalOpen(false)} 
                editData={targetExam} 
                onSave={fetchExams} 
            /> */}

            {/* Reusable Delete Modal Box Engine */}
            <DeleteExamModal
                show={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setDeleteTargetId(null); }}
                examId={deleteTargetId}
                refreshList={fetchExams}
            />
        </Page>
    );
}