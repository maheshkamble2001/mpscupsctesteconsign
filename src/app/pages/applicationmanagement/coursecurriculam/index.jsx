import React, { useState, useMemo, useEffect } from "react";
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import {
    PencilIcon,
    TrashIcon,
    PlusIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    ChevronUpIcon,
    InboxIcon,
    ExclamationTriangleIcon // Added for ModalBox config reference
} from "@heroicons/react/24/outline";
import { ModuleFormModal } from "./ModuleFormModal";
import { Page } from "components/shared/Page";
import clsx from "clsx";
import axios from "axios";
import { toast } from "sonner";
import { deleteCourseCurriculum, getCourseCurriculumList, getCourseDropdown } from "api/applicationmanagement/coursecarriculam";

// Local Custom Delete Modal Import
import { ConfirmModal } from "components/shared/ConfirmModal";

const API_BASE_URL = "/api/curriculum";

/* ========================================================================= 
   REUSABLE MODALBOX FOR CURRICULUM MODULE DELETION
   ========================================================================= */
function ModalBox({ show, onClose, data, list }) {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const state = error ? "error" : success ? "success" : "pending";

    // Text context strings adjusted for Curriculum Modules
    const messages = {
        pending: {
            Icon: ExclamationTriangleIcon,
            title: "Are you sure?",
            description: "Are you sure you want to delete this syllabus module? Once removed, it will be unmapped from this course track sequence permanently.",
            actionText: "Delete",
        },
        success: {
            title: "Module Deleted",
        },
        error: {
            description: "Something went wrong while removing the module from the database track.",
        },
    };

    const onOk = async () => {
        if (!data) {
            toast.error("Invalid Module Identifier");
            return;
        }
        try {
            setConfirmLoading(true);
            // Calling the module delete API endpoint using curriculum identifier context
           const res = await deleteCourseCurriculum({ CurriculumId: data }); 
            if (res.code === 200) {
                toast.success(res.message || "Module deleted successfully");
                list(); 
                setSuccess(true);
                setError(false);
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                toast.error(res.message || "Something went wrong during deletion");
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
            onOk={onOk}
            confirmLoading={confirmLoading}
            state={state}
        />
    );
}

/* ========================================================================= 
   MAIN CURRICULUM PAGE COMPONENT
   ========================================================================= */
export default function CurriculumPage() {
    const [courses, setCourses] = useState([]);
    const [activeModules, setActiveModules] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isSearch, setIsSearch] = useState(false);

    const [query, setQuery] = useState("");
    const [appliedQuery, setAppliedQuery] = useState("");

    const [loading, setLoading] = useState(false);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [targetModule, setTargetModule] = useState(null);

    // States to control custom deletion modal lifecycle
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // 1. Fetch initial courses dropdown
    useEffect(() => {
        const fetchInitialCourses = async () => {
            try {
                const response = await getCourseDropdown();
                if (response?.code == 200) {
                    const rows = response.data?.rows || response.data || [];
                    setCourses(rows);
                } else {
                    toast.error("Failed fetching courses dropdown options");
                }
            } catch (error) {
                console.error("Error fetching dropdown options:", error);
                toast.error("An error occurred while fetching courses");
            }
        };
        fetchInitialCourses();
    }, []);

    // 2. Filter dropdown options strictly based on the APPLIED query matrix
    const filteredCourses = useMemo(() => {
        const searchLog = appliedQuery.toLowerCase().trim();
        if (!searchLog) return courses;

        return courses.filter((course) =>
            course.CourseTitle?.toLowerCase().includes(searchLog) ||
            course.CourseCode?.toLowerCase().includes(searchLog)
        );
    }, [courses, appliedQuery]);

    // Triggered explicitly via search button click or post-mutation refresh
    const handleSearch = async () => {
        if (!selectedCourse?.CourseId) {
            toast.error("Please select a course to search");
            setIsSearch(false);
            return;
        }
        try {
            const response = await getCourseCurriculumList({ CourseId: selectedCourse?.CourseId });
            if (response?.code == 200) {
                const rows = response.data?.rows || response.data || [];
                setActiveModules(rows);
                setIsSearch(true);
            } else {
                toast.error("Failed fetching courses dropdown options");
                setIsSearch(false);
            }
        } catch (error) {
            console.error("Error fetching dropdown options:", error);
            toast.error("An error occurred while fetching courses");
        }
    };

    /* ========================================================================= 
       ACTION DISPATCHERS (ADD, EDIT, DELETE, REORDER)
       ========================================================================= */
    const handleSaveModuleSuccess = async () => {
        try {
            handleSearch(); 
        } catch (error) {
            console.error("Error saving module:", error);
            toast.error("Failed to save layout module record");
        }
    };

    // Swapped native confirm configuration state initialization flags
    const handleInitDeleteModule = (curriculumId) => {
        setDeleteTargetId(curriculumId);
        setIsDeleteModalOpen(true);
    };

    const handleMoveModule = async (index, direction) => {
        const updatedModules = [...activeModules];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= updatedModules.length) return;

        const temp = updatedModules[index];
        updatedModules[index] = updatedModules[targetIndex];
        updatedModules[targetIndex] = temp;
        setActiveModules(updatedModules);

        try {
            await axios.patch(`${API_BASE_URL}/modules/reorder`, {
                courseId: selectedCourse.CourseId,
                modulesOrder: updatedModules.map((m, idx) => ({ id: m.CurriculumId, order: idx + 1 }))
            });
        } catch (error) {
            console.error("Failed saving position order state matrix:", error);
        }
    };

    return (
        <Page title="Course Curriculum Management" description="Manage and organize course modules and content" >
            <div className="w-full h-full min-h-0 flex flex-col">
                <div className="flex h-full w-full flex-col dark:bg-dark-900 bg-white min-h-0">

                    {/* Header */}
                    <div className="relative border-b border-slate-100 px-6 py-5 flex flex-col gap-1 flex-shrink-0">
                        <h1 className="text-foreground text-xl font-bold tracking-tight md:text-2xl">Course Curriculum</h1>
                        <p className="text-muted-foreground text-sm font-medium">Manage and organize course modules and content</p>
                    </div>

                    {/* Content Panel */}
                    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 md:p-8">
                        <div className="max-w-3xl mx-auto space-y-6">

                            {/* HEADLESS UI COMBOBOX SEARCH CONTAINER */}
                            <div className="w-full md:w-[600px]">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Course</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Combobox
                                            value={selectedCourse}
                                            onChange={(course) => {
                                                if (course) {
                                                    setSelectedCourse(course);
                                                    setQuery(course.CourseTitle || "");
                                                    setIsSearch(false);
                                                }
                                            }}
                                            onClose={() => setQuery(selectedCourse?.CourseTitle || '')}
                                        >
                                            <div className="relative">
                                                <div className="relative w-full flex items-center">
                                                    <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                                    <ComboboxInput
                                                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-xs font-semibold shadow-sm focus:border-slate-300 focus:outline-none text-slate-800"
                                                        displayValue={(course) => course?.CourseTitle || ""}
                                                        onChange={(event) => setQuery(event.target.value)}
                                                        placeholder="Type course name or target CourseCode segment..."
                                                    />
                                                    <ComboboxButton className="absolute right-2 top-2 p-1.5 text-slate-400">
                                                        <ChevronDownIcon className="h-4 w-4 transition-transform text-slate-400" />
                                                    </ComboboxButton>
                                                </div>

                                                <ComboboxOptions transition className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-[200px] overflow-y-auto p-1.5 transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0">
                                                    {filteredCourses.length === 0 ? (
                                                        <div className="text-xs text-slate-400 text-center py-4 font-medium">
                                                            No records matching committed parameters. Click search to apply.
                                                        </div>
                                                    ) : (
                                                        filteredCourses.map((course) => (
                                                            <ComboboxOption
                                                                key={course.CourseId}
                                                                value={course}
                                                                className={({ focus, selected }) => clsx(
                                                                    "w-full text-left p-2 rounded-lg text-xs flex justify-between items-center cursor-pointer transition-colors select-none",
                                                                    focus && "bg-slate-50 text-[#3368AF]",
                                                                    selected && "bg-slate-100 font-bold text-[#3368AF]"
                                                                )}
                                                            >
                                                                <span>{course.CourseTitle}</span>
                                                                <span className="text-[10px] text-slate-400 uppercase font-mono">{course.CourseCode}</span>
                                                            </ComboboxOption>
                                                        ))
                                                    )}
                                                </ComboboxOptions>
                                            </div>
                                        </Combobox>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSearch}
                                        className="h-11 px-5 bg-black hover:bg-[var(--app-btn-primary-hover, #E2E8F0)] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                                    >
                                        <MagnifyingGlassIcon className="h-4 w-4 stroke-[2.5]" />
                                        Search
                                    </button>
                                </div>
                            </div>

                            {/* WORKSPACE DATA CONTAINER VIEW */}
                            {loading ? (
                                <div className="text-center py-12 text-xs font-bold text-slate-400">Loading current syllabus tracking blocks...</div>
                            ) : isSearch ? (
                                <>
                                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-extrabold text-[#3368AF] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">{selectedCourse.CourseCode}</span>
                                                <h3 className="text-sm font-bold text-slate-900 truncate">{selectedCourse.CourseTitle}</h3>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Rearrange, append or destroy active syllabus rows sequence elements.</p>
                                        </div>
                                        <button onClick={() => { setTargetModule(null); setIsModuleModalOpen(true); }} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-black shadow-sm hover:shadow-md transition-all flex-shrink-0" style={{ background: "var(--app-btn-primary, #F1F5F9)" }}>
                                            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" /> Add Syllabus Module
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {activeModules.length === 0 ? (
                                            <div className="text-center py-10 bg-white border border-dashed rounded-2xl text-xs font-medium text-slate-400">
                                                No modules structured for this course track yet. Click "Add Syllabus Module" to build one.
                                            </div>
                                        ) : (
                                            activeModules.map((mod, index) => (
                                                <div key={index} className="group bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:border-slate-300 transition-all flex items-start gap-4">

                                                    <div className="flex flex-col items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1 self-center">
                                                        <span className="text-[10px] font-black text-slate-400 select-none px-1">
                                                            {String(index + 1).padStart(2, "0")}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <h4 className="text-xs font-bold text-slate-900 truncate">{mod.ModuleName}</h4>
                                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                                                <button onClick={() => { setTargetModule(mod); setIsModuleModalOpen(true); }} className="p-1 rounded border border-slate-100 hover:bg-slate-50 text-slate-500"><PencilIcon className="h-3 w-3" /></button>
                                                                
                                                                {/* Click invokes custom state handler with matching database CurriculumId */}
                                                                <button onClick={() => handleInitDeleteModule(mod.CurriculumId)} className="p-1 rounded border border-rose-100 hover:bg-rose-50 text-rose-600"><TrashIcon className="h-3 w-3" /></button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-1 space-y-1">
                                                            <span className="inline-block text-[9px] font-extrabold text-[#3368AF] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">Duration: {` ${mod.Duration+" Weeks" || ''}`}</span>
                                                            <p className="text-xs text-slate-500 leading-relaxed truncate">{mod.Description }</p>
                                                        </div>
                                                    </div>

                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6">
                                    <InboxIcon className="h-10 w-10 text-slate-300 mb-2" />
                                    <h3 className="text-xs font-bold text-slate-700">No matching record found</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">Verify your search parameter text strings value blocks.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Curriculum Form Modal Add / Edit */}
            <ModuleFormModal isOpen={isModuleModalOpen} onClose={() => setIsModuleModalOpen(false)} editData={{ ...targetModule, CourseId: selectedCourse?.CourseId }} onSave={handleSaveModuleSuccess} />
            
            {/* Custom ModalBox Instance Added to Footer Tree */}
            <ModalBox 
                show={isDeleteModalOpen} 
                onClose={() => { setIsDeleteModalOpen(false); setDeleteTargetId(null); }} 
                data={deleteTargetId} 
                list={handleSearch} 
            />
        </Page>
    );
}