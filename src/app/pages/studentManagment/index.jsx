import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    createColumnHelper,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    flexRender,
} from "@tanstack/react-table";
import { toast } from "sonner";
import {
    UserPlusIcon,
    PencilIcon,
    TrashIcon,
    ArrowUpRightIcon,
} from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { Button } from "@headlessui/react";

// Mock API Paths - Adjust these imports to point to your real Student API services
// import {
//   deleteStudent,
//   getStudentsList,
//   updateStudentStatus,
// } from "api/studentmanagement/student";

// UI & Components
import { Page } from "components/shared/Page";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { Box, Card } from "components/ui";
import { useLockScrollbar, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { CustomToolbar } from "./sub/CustomToolbar"; // Reuse or duplicate for context
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { StudentDrawer } from "./sub/StudentDrawer"; // Build matching drawer
import { ModalBox } from "./sub/ModalBox";
import { verifyRole } from "utils/utilities";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { GridSkeleton } from "components/shared/GridSkeleton";
import { ListView } from "components/tables/users-datatable/ListView"; // Reuse or match for students
import { StudentGridView } from "./sub/studentGridview"; // Build matching grid view
import { deleteStudent, getStudentList, updateStudentStatus } from "api/studentmanagement/student";

const ManageStudents = () => {
    const navigate = useNavigate();
    const columnHelper = createColumnHelper();

    const [studentsList, setStudentsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [activePage, setActivePage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [apiFailed, setApiFailed] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [tableSettings, setTableSettings] = useState({
        enableFullScreen: false,
        enableRowDense: false,
        enableSorting: true,
        enableColumnFilters: true,
    });

    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [viewType, setViewType] = useLocalStorage(
        "students-table-view-type",
        "list",
    );
    const [columnVisibility, setColumnVisibility] = useLocalStorage(
        "column-visibility-students",
        {},
    );
    const [columnPinning, setColumnPinning] = useLocalStorage(
        "column-pinning-students",
        {},
    );
    const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState("");
    const [statusLoading, setStatusLoading] = useState({});
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const getInitial = (name) => (name ? name[0].toUpperCase() : "S");

    const fetchStudents = useCallback(
        async (search = "", page = activePage, pageSize = limit) => {
            try {
                setLoading(true);
                setApiFailed(false);
                const res = await getStudentList({ search, limit: pageSize, page });

                if (res.code === 200) {
                    const rawStudents = res.data?.students || [];
                    const totalCount = res.data?.total || 0;

                    // Transforming backend structure to requested keys
                    const transformed = rawStudents.map((student) => ({
                        id: student.ID,
                        name: student.Name || "N/A",
                        initials: getInitial(student.Name),

                        mobile: student.Mobile || "-",
                        emailid: student.EmailID || "-",

                        password: student.Password || "",

                        stateid: student.StateID || "-",
                        statename: student.State?.StateName || "-", // ✅ nested object

                        city: student.City || "-",
                        address: student.Address || "-",

                        admissiondate: student.AdmissionDate || "",
                        status: student.Status ? 1 : 0,

                        isdeleted: student.IsDeleted ? 1 : 0,
                        addedon: student.AddedOn || "",
                    }));

                    setTotal(totalCount);
                    setStudentsList(transformed);
                } else {
                    setStudentsList([]);
                    toast.error(res.message || "Failed to fetch students", { id: "fetch-students-error" });
                    setApiFailed(true);
                }
            } catch (err) {
                console.error("Fetch students error:", err);
                setStudentsList([]);
                toast.error("Something went wrong while fetching students", { id: "fetch-students-error-catch" });
                setApiFailed(true);
            } finally {
                setLoading(false);
                setIsSearching(false);
            }
        },
        [activePage, limit],
    );

    useEffect(() => {
        fetchStudents(searchText, activePage, limit);
    }, [fetchStudents, searchText, activePage, limit]);

    const handleSearch = (searchValue) => {
        setSearchText(searchValue);
        setActivePage(1);
        setIsSearching(true);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setActivePage(1);
    };

    const handlePageChange = (newPage) => {
        setActivePage(newPage);
    };

    const handleUpdateStudentStatus = async (studentId, newStatus) => {
        if (verifyRole(300006)) { // Keep or alter standard role checking integers
            toast.error("Not allowed to change status");
            return;
        }
        try {
            setStatusLoading((prev) => ({ ...prev, [studentId]: true }));
            const res = await updateStudentStatus({
                id: studentId,
                newStatus: newStatus ? 1 : 0,
            });
            if (res.code === 200) {
                toast.success("Status updated successfully");
                setStudentsList((prev) =>
                    prev.map((student) =>
                        student.id === studentId
                            ? { ...student, status: newStatus ? 1 : 0 }
                            : student,
                    ),
                );
            } else {
                toast.error(res.message || "Failed to update status");
            }
        } catch {
            toast.error("Something went wrong while updating status");
        } finally {
            setStatusLoading((prev) => ({ ...prev, [studentId]: false }));
        }
    };

    const handleDeleteStudentApi = async (studentId) => {
        if (verifyRole(300005)) {
            toast.error("Not allowed to delete student");
            throw new Error("Not allowed");
        }
        const res = await deleteStudent({
             id: studentId 
            });
        if (res.code === 200) {
            toast.success("Student record deleted successfully");
            await fetchStudents(searchText, activePage, limit);
            return;
        } else {
            toast.error(res.message || "Failed to delete student");
            throw new Error(res.message || "Delete failed");
        }
    };

    const handleViewStudent = (studentId) => {
        const student = studentsList.find((s) => s.id === studentId);
        if (student) {
            setSelectedStudent(student);
            setIsDrawerOpen(true);
        }
    };

    const handleEditStudent = (studentId) => {
        navigate(`update-student/${studentId}`);
    };

    const exportToExcel = async () => {
        try {
            setLoading(true);
            const res = await getStudentsList({
                page: 1,
                limit: total || 1000,
                search: searchText,
            });
            if (!res?.data?.students || res.data.students.length === 0) {
                toast.error("No data available to export");
                return;
            }

            const formatDate = (dateString) => {
                if (!dateString) return "—";
                const date = new Date(dateString);
                return `${String(date.getDate()).padStart(2, "0")}-${String(
                    date.getMonth() + 1,
                ).padStart(2, "0")}-${date.getFullYear()}`;
            };

            const excelData = res.data.students.map((s, idx) => ({
                "SR No": idx + 1,
                Name: s.Name || "-",
                Email: s.EmailID || "-",
                Mobile: s.Mobile || "-",
                "Admission Date": formatDate(s.AdmissionDate),
                City: s.City || "-",
                Status: s.Status ? "Active" : "Inactive",
                "Added On": formatDate(s.AddedOn),
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
            XLSX.writeFile(workbook, "Students_List.xlsx");
            toast.success("Students list exported successfully");
        } catch {
            toast.error("Failed to export students data");
        } finally {
            setLoading(false);
        }
    };

    const shouldShowToolbar = () => {
        if (apiFailed) return false;
        if (loading && !isSearching) return false;
        if (studentsList.length === 0 && !searchText) return false;
        return true;
    };

    // Setup Column layout for Student Specific Schema
    const studentColumns = [
        columnHelper.display({
            id: "serial_no",
            header: "Sr.No",
            cell: (info) => (
                <div className="text-center">
                    {info.row.index + 1 + (activePage - 1) * limit}
                </div>
            ),
        }),
        columnHelper.display({
            id: "name",
            header: "Student Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#a3cbf0] text-xs font-bold text-[#1E1E2D]">
                        {row.original.initials}
                    </span>
                    <span className="font-bold text-slate-700">{row.original.name}</span>
                </div>
            ),
        }),
        { header: "Email ID", accessorKey: "emailid" },
        { header: "Mobile", accessorKey: "mobile" },
        { header: "City", accessorKey: "city" },
        {
            header: "Admission Date",
            accessorKey: "admissiondate",
            cell: ({ getValue }) => {
                const val = getValue();
                if (!val) return "-";
                const date = new Date(val);
                return date.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
            }
        },
        columnHelper.accessor((row) => row.status, {
            id: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <StyledSwitch
                        checked={row.original.status === 1}
                        onChange={(checked) =>
                            handleUpdateStudentStatus(row.original.id, checked)
                        }
                        loading={statusLoading[row.original.id]}
                    />
                </div>
            ),
        }),
        columnHelper.display({
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                const editDisabled = verifyRole(300004);
                const deleteDisabled = verifyRole(300005);
                const studentId = row.original.id;
                return (
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleViewStudent(studentId)}
                            className="btn-base btn bg-gray-150 dark:bg-surface-2 dark:text-dark-50 dark:hover:bg-surface-1 size-8 shrink-0 rounded-full p-0 text-gray-900 hover:bg-gray-200"
                        >
                            <ArrowUpRightIcon className="h-4 w-4" />
                        </button>
                        <button
                            disabled={editDisabled}
                            onClick={() => !editDisabled && handleEditStudent(studentId)}
                            className={`rounded-lg transition-colors ${editDisabled
                                ? "cursor-not-allowed text-gray-300"
                                : "cursor-pointer text-blue-500 hover:bg-blue-50"
                                }`}
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                            disabled={deleteDisabled}
                            onClick={() => {
                                if (!deleteDisabled) {
                                    setSelectedId(studentId);
                                    setDeleteModal(true);
                                }
                            }}
                            className={`rounded-lg transition-colors ${deleteDisabled
                                ? "cursor-not-allowed text-gray-200"
                                : "cursor-pointer text-red-500 hover:bg-red-50"
                                }`}
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                );
            },
        }),
    ];

    const table = useReactTable({
        data: studentsList,
        columns: studentColumns,
        initialState: { pagination: { pageSize: limit } },
        state: {
            globalFilter,
            sorting,
            columnVisibility,
            columnPinning,
            tableSettings,
            viewType,
        },
        meta: {
            updateData: (rowIndex, columnId, value) => {
                skipAutoResetPageIndex();
                setStudentsList((old) =>
                    old.map((row, index) =>
                        index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row,
                    ),
                );
            },
            deleteRow: async (row) => {
                await handleDeleteStudentApi(row.original.id);
            },
            setTableSettings,
            setViewType,
            onViewUser: handleViewStudent,
            onEditUser: handleEditStudent,
            onStatusChange: handleUpdateStudentStatus,
        },
        filterFns: { fuzzy: fuzzyFilter },
        enableSorting: tableSettings.enableSorting,
        enableColumnFilters: tableSettings.enableColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        globalFilterFn: fuzzyFilter,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onColumnPinningChange: setColumnPinning,
        autoResetPageIndex,
        manualPagination: true,
        pageCount: Math.ceil(total / limit),
    });

    useLockScrollbar(tableSettings.enableFullScreen);

    const rows = table.getRowModel().rows;
    const WrapComponent = viewType === "list" ? Card : Box;

    return (
        <Page title="Student Management">
            <div className="transition-content w-full pb-5">
                <div
                    className={clsx(
                        "flex h-full w-full flex-col",
                        tableSettings.enableFullScreen &&
                        "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3",
                    )}
                >
                    <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3 px-(--margin-x) pt-6 pb-6">
                        <div className="space-y-1">
                            <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                                Manage Students
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium">
                                Track academic profiles, process admissions, and manage records.
                            </p>
                        </div>

                        <Button
                            disabled={verifyRole(300003)}
                            onClick={() => navigate("add-student")}
                            className={`flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-semibold text-white shadow-lg transition-all hover:shadow-xl ${verifyRole(300003) ? "cursor-not-allowed opacity-50" : ""
                                }`}
                            style={{
                                background: verifyRole(300003)
                                    ? "#9CA3AF"
                                    : "linear-gradient(135deg, rgb(54, 109, 176), rgb(255, 69, 66))",
                            }}
                        >
                            <UserPlusIcon className="h-4 w-4" />
                            Add Student
                        </Button>

                        <div className="absolute bottom-0 left-0 w-full">
                            <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                            <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[rgb(33,150,243)] to-transparent" />
                        </div>
                    </div>

                    {shouldShowToolbar() && (
                        <CustomToolbar
                            table={table}
                            onExportExcel={exportToExcel}
                            onSearch={handleSearch}
                            searchValue={searchText}
                        />
                    )}

                    <div
                        className={clsx(
                            "transition-content flex grow flex-col pt-3",
                            tableSettings.enableFullScreen
                                ? "overflow-hidden"
                                : "px-(--margin-x)",
                        )}
                    >
                        <WrapComponent
                            className={clsx(
                                "relative flex grow flex-col",
                                tableSettings.enableFullScreen && "overflow-hidden",
                            )}
                        >
                            {loading ? (
                                viewType === "list" ? (
                                    <TableSkeleton limit={limit} />
                                ) : (
                                    <GridSkeleton limit={limit} />
                                )
                            ) : studentsList.length === 0 ? (
                                <PremiumEmptyState
                                    title={apiFailed ? "Failed to Load Students" : "No Students Found"}
                                    desc={
                                        apiFailed
                                            ? "Unable to fetch students data. Check your system connection."
                                            : searchText
                                                ? `No matching students found for "${searchText}".`
                                                : "No records found. Start onboarding by clicking Add Student."
                                    }
                                    onAction={!apiFailed ? () => navigate("/studentmanagement/add-student") : undefined}
                                    actionText={!apiFailed && !searchText ? "Add Student" : undefined}
                                />
                            ) : viewType === "list" ? (
                                <ListView table={table} rows={rows} flexRender={flexRender} />
                            ) : (
                                <StudentGridView table={table} rows={rows} />
                            )}

                            {studentsList.length > 0 && (
                                <div
                                    className={clsx(
                                        "pb-4 sm:pt-4",
                                        (viewType === "list" || tableSettings.enableFullScreen) &&
                                        "px-4 sm:px-5",
                                        tableSettings.enableFullScreen &&
                                        "dark:bg-dark-800 bg-gray-50",
                                        !(
                                            table.getIsSomeRowsSelected() ||
                                            table.getIsAllRowsSelected()
                                        ) && "pt-4",
                                        viewType === "grid" &&
                                        !tableSettings.enableFullScreen &&
                                        "mt-3",
                                    )}
                                >
                                    <PaginationSection
                                        table={table}
                                        totalCount={total}
                                        limit={limit}
                                        activePage={activePage}
                                        setLimit={handleLimitChange}
                                        setActivePage={handlePageChange}
                                    />
                                </div>
                            )}
                        </WrapComponent>
                    </div>
                </div>
            </div>

            <ModalBox
                show={deleteModal}
                onClose={() => setDeleteModal(false)}
                data={selectedId}
                list={() => fetchStudents(searchText, activePage, limit)}
            />

            <StudentDrawer
                isOpen={isDrawerOpen}
                close={() => setIsDrawerOpen(false)}
                student={selectedStudent}
            />
        </Page>
    );
};

export default ManageStudents;