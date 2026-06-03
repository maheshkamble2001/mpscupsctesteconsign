import React, { useEffect, useState, useCallback } from "react";
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
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@headlessui/react";

// API Import
import { getCoursesList } from "api/applicationmanagement/courses";

// UI & Components
import { Page } from "components/shared/Page";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { Box, Card } from "components/ui";
import { useLockScrollbar, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { verifyRole } from "utils/utilities";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { GridSkeleton } from "components/shared/GridSkeleton"; // ADDED
import { ListView } from "components/tables/users-datatable/ListView";
import { CustomToolbar } from "components/customs/CustomToolbar";

// Course Components
import { CourseDrawer } from "./CourseDrawer"; 
import { CourseGridView } from "./CourseGridview"; 
// import { ModalBox } from "./modelBox"; // Uncomment this when you create ModalBox for courses

const ManageCourses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const columnHelper = createColumnHelper();

  // State Management
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [apiFailed, setApiFailed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Table Configuration State
  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableSorting: true,
    enableColumnFilters: true,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [viewType, setViewType] = useLocalStorage("courses-table-view-type", "list");
  const [columnVisibility, setColumnVisibility] = useLocalStorage("column-visibility-courses", {});
  const [columnPinning, setColumnPinning] = useLocalStorage("column-pinning-courses", {});
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Action State
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Core Data Fetching
  const fetchCourses = useCallback(
    async (search = searchText, page = activePage, pageSize = limit) => {
      try {
        setLoading(true);
        setApiFailed(false);

        const res = await getCoursesList({ search, limit: pageSize, page });

        if (res?.code === 200) {
          const rawCourses = res.data?.rows || [];
          const totalCount = res.data?.count || 0;

          const transformed = rawCourses.map((course) => ({
            course_id: course.CourseId,
            CourseTitle: course.CourseTitle,
            CourseCode: course.CourseCode,
            ExamName: course.Exam?.ExamName || "-",
            StartDate: course.StartDate,
            isdeleted: course.isdeleted,
            status: course.isdeleted ? 0 : 1,
            addedOn: course.addedon || "",
            CoverImage: course.CoverImage,
            CourseListPrice: course.CourseListPrice,
            CourseLaunchPrice: course.CourseLaunchPrice,
            NoOfSeats: course.NoOfSeats,
            TagLine: course.TagLine,
            Description: course.Description,
          }));

          setTotal(totalCount);
          setCoursesList(transformed);
        } else {
          setCoursesList([]);
          toast.error(res?.message || "Failed to fetch courses");
          setApiFailed(true);
        }
      } catch (err) {
        console.error("Fetch courses error:", err);
        setCoursesList([]);
        toast.error("Something went wrong while fetching courses");
        setApiFailed(true);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [activePage, limit, searchText]
  );

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Event Handlers
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

  const handleViewCourse = useCallback((courseId) => {
    const course = coursesList.find((c) => c.course_id === courseId);
    if (course) {
      setSelectedCourse(course);
      setIsDrawerOpen(true);
    }
  }, [coursesList]);

  const handleEditCourse = useCallback((courseId, rowData) => {
    navigate(`update-course/${courseId}`, { state: rowData });
  }, [navigate]);

  const exportToExcel = async () => {
    toast.error("Export to Excel will be integrated soon");
  };

  const shouldShowToolbar = () => {
    if (apiFailed) return false;
    if (loading && !isSearching) return false;
    if (coursesList.length === 0 && !searchText) return false;
    return true;
  };

  // Columns Mapping
  const courseColumns = [
    columnHelper.display({
      id: "serial_no",
      header: "Sr.No",
      cell: (info) => <div className="text-center">{info.row.index + 1 + (activePage - 1) * limit}</div>,
    }),
    columnHelper.display({
      id: "CourseTitle",
      header: "Course Title",
      accessorKey: "CourseTitle",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(18%_.04_265)] text-xs font-bold text-white">
            <BookOpenIcon className="h-4 w-4" />
          </span>
          <span className="font-bold text-slate-700">{row.original.CourseTitle}</span>
        </div>
      ),
    }),
    { header: "Course Code", accessorKey: "CourseCode" },
    { header: "Exam Name", accessorKey: "ExamName" },
    columnHelper.display({
      id: "StartDate",
      header: "Start Date",
      accessorKey: "StartDate",
      cell: ({ row }) => {
        const date = row.original.StartDate;
        if (!date) return <span className="text-gray-400 font-medium italic">TBD</span>;
        return (
          <span className="font-medium text-slate-600">
            {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        );
      }
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const isDeleted = row.original.isdeleted;
        return (
          <span className={clsx("px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md", 
            isDeleted ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
          )}>
            {isDeleted ? "Deleted" : "Active"}
          </span>
        );
      }
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const editDisabled = verifyRole(300004);
        const deleteDisabled = verifyRole(300005);
        const courseId = row.original.course_id;
        
        return (
          <div className="flex gap-3">
            <button
              onClick={() => handleViewCourse(courseId)}
              className="btn-base btn bg-gray-150 dark:bg-surface-2 dark:text-dark-50 dark:hover:bg-surface-1 size-8 shrink-0 rounded-full p-0 text-gray-900 hover:bg-gray-200"
            >
              <ArrowUpRightIcon className="h-4 w-4" />
            </button>
            <Button
              disabled={editDisabled}
              onClick={() => !editDisabled && handleEditCourse(courseId, row.original)}
              className={`rounded-lg transition-colors ${
                editDisabled ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-blue-500 hover:bg-blue-50"
              }`}
            >
              <PencilIcon className="h-5 w-5" />
            </Button>
            <button
              disabled={deleteDisabled}
              onClick={() => {
                if (!deleteDisabled) {
                  setSelectedId(courseId);
                  setDeleteModal(true);
                }
              }}
              className={`rounded-lg transition-colors ${
                deleteDisabled ? "cursor-not-allowed text-gray-200" : "cursor-pointer text-red-500 hover:bg-red-50"
              }`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        );
      },
    }),
  ];

  // Table Configuration
  const table = useReactTable({
    data: coursesList,
    columns: courseColumns,
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
        setCoursesList((old) =>
          old.map((row, index) => (index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row))
        );
      },
      deleteRow: (row) => {
        setSelectedId(row.original.course_id);
        setDeleteModal(true);
      },
      setTableSettings,
      setViewType,
      onViewUser: handleViewCourse,
      onEditUser: handleEditCourse,
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
    pageCount: Math.ceil(total / limit) || 1, 
  });

  useLockScrollbar(tableSettings.enableFullScreen);
  const rows = table.getRowModel().rows;
  const WrapComponent = viewType === "list" ? Card : Box;

  return (
    <Page title="Manage Courses">
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen && "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3"
          )}
        >
          {/* Header Section */}
          <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3 px-(--margin-x) pt-6 pb-6">
            <div className="space-y-1">
              <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                Manage Courses
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Update course details, schedules, and configurations.
              </p>
            </div>

            <Button
              disabled={verifyRole(300003)}
              onClick={() => navigate("add-course")}
              className={clsx(
                "flex items-center gap-2 rounded px-4 py-2 font-semibold text-white shadow-lg transition-all hover:shadow-xl",
                verifyRole(300003) ? "cursor-not-allowed opacity-50 bg-gray-400" : "cursor-pointer"
              )}
              style={!verifyRole(300003) ? { background: "var(--app-btn-primary)" } : {}}
            >
              <PlusIcon className="h-4 w-4" />
              Add Course
            </Button>

            <div className="absolute bottom-0 left-0 w-full">
              <div className="via-border h-[1.5px] w-full bg-gradient-to-r from-transparent to-transparent" />
              <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#366db0] to-transparent" />
            </div>
          </div>

          {shouldShowToolbar() && (
            <CustomToolbar table={table} onExportExcel={exportToExcel} onSearch={handleSearch} searchValue={searchText} />
          )}

          {/* Table Container */}
          <div
            className={clsx(
              "transition-content flex grow flex-col pt-3",
              tableSettings.enableFullScreen ? "overflow-hidden" : "px-(--margin-x)"
            )}
          >
            <WrapComponent
              className={clsx(
                "relative flex grow flex-col",
                tableSettings.enableFullScreen && "overflow-hidden"
              )}
            >
              {loading ? (
                // ✅ ADDED: Conditional rendering for Skeleton based on viewType
                viewType === "list" ? <TableSkeleton limit={limit} /> : <GridSkeleton limit={limit} />
              ) : coursesList.length === 0 ? (
                <PremiumEmptyState
                  title={apiFailed ? "Failed to Load Courses" : "No Courses Found"}
                  desc={
                    apiFailed
                      ? "Unable to fetch courses. Please check your network connection or API URL."
                      : searchText
                      ? `No results found for "${searchText}". Try a different search term.`
                      : "It looks like there are no courses registered yet. Start by adding a new course."
                  }
                  onAction={!apiFailed && !searchText ? () => navigate("add-course") : undefined}
                  actionText={!apiFailed && !searchText ? "Add Course" : undefined}
                />
              ) : viewType === "list" ? (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              ) : (
                // ✅ ADDED: Grid View Rendering
                <CourseGridView table={table} rows={rows} />
              )}

              {coursesList.length > 0 && (
                <div
                  className={clsx(
                    "pb-4 sm:pt-4",
                    (viewType === "list" || tableSettings.enableFullScreen) && "px-4 sm:px-5",
                    tableSettings.enableFullScreen && "dark:bg-dark-800 bg-gray-50",
                    !(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && "pt-4",
                    viewType === "grid" && !tableSettings.enableFullScreen && "mt-3" // ✅ Margin fix for grid pagination
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

      
      {/* <ModalBox
        show={deleteModal}
        onClose={() => setDeleteModal(false)}
        data={selectedId}
        list={fetchCourses}
      /> */}
      <CourseDrawer
        isOpen={isDrawerOpen}
        close={() => setIsDrawerOpen(false)}
        course={selectedCourse}
      />
    </Page>
  );
};

export default ManageCourses;
