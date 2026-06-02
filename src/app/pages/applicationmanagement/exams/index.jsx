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
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpRightIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import clsx from "clsx";

// Import your Exam APIs here
import {
  // deleteExam,
  getExamsList,
  // updateExamStatus,
  updateExamCatalogueStatus,
  updateExamFreeTrialStatus,
  updateExamOpenEnrollmentStatus,
} from "api/applicationmanagement/exam"; // Update this path to match your actual API file

// UI & Components
import { Page } from "components/shared/Page";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { useNavigate } from "react-router-dom";
import { Button } from "@headlessui/react";
import { Box, Card } from "components/ui";
import { useLockScrollbar, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { ExamDrawer } from "./ExamDrawer";
// import { ModalBox } from "./ModalBox";
import { verifyRole } from "utils/utilities";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { GridSkeleton } from "components/shared/GridSkeleton";
import { ListView } from "components/tables/users-datatable/ListView";
import { ExamGridView } from "./ExamGridview";
import { CustomToolbar } from "components/customs/CustomToolbar";

const ManageExams = () => {
  const navigate = useNavigate();
  const columnHelper = createColumnHelper();

  const [examsList, setExamsList] = useState([]);
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
    "exams-table-view-type",
    "list",
  );
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-exams",
    {},
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-exams",
    {},
  );
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const [deleteModal, setDeleteModal] = useState(false);
  const [seletedId, setSelectedId] = useState("");
  const [statusLoading, setStatusLoading] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  const fetchExams = useCallback(
    async (search = "", page = activePage, pageSize = limit) => {
      try {
        setLoading(true);
        setApiFailed(false);

        const res = await getExamsList({ search, limit: pageSize, page });

        if (res.code === 200) {
          const rawExams = res.data?.exams || [];
          const totalCount = res.data?.pagination?.totalRecords || 0;

          const transformed = rawExams.map((exam) => ({
            exam_id: exam.ExamId,
            ExamName: exam.ExamName,
            ExamShortName: exam.ExamShortName,
            ExamTypeId: exam.ExamTypeId,
            ExamType: exam.ExamType?.name || "-",
            Stage: exam.Stage || "-",
            Duration: exam.Duration ? `${exam.Duration} mins` : "-",
            TotalMarks: exam.TotalMarks ?? 0,
            TotalQuestions: exam.TotalQuestions ?? 0,
            MarkPerCorrect: exam.MarkPerCorrect ?? 0,
            NegativeMark: exam.NegativeMark ?? 0,
            CuttOff: exam.CuttOff ?? 0,
            ExamMedium: exam.ExamMedium || "-",
            ShowInCatalogue: exam.ShowInCatalogue,
            AllFreeTrial: exam.AllFreeTrial,
            OpenEnrollment: exam.OpenEnrollment,
            Subjects: exam.Subjects || [],
            status: exam.isdeleted ? 0 : 1, // 0 = deleted/inactive, 1 = active
            addedOn: exam.addedon || "",
          }));

          setTotal(totalCount);
          setExamsList(transformed);
        } else {
          setExamsList([]);
          toast.error(res.message || "Failed to fetch exams", {
            id: "fetch-exams-error",
          });
          setApiFailed(true);
        }
      } catch (err) {
        console.error("Fetch exams error:", err);
        setExamsList([]);
        toast.error("Something went wrong while fetching exams", {
          id: "fetch-exams-error-catchblock",
        });
        setApiFailed(true);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [activePage, limit],
  );

  useEffect(() => {
    fetchExams(searchText, activePage, limit);
  }, [fetchExams, searchText, activePage, limit]);

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

    const handleToggleSettings = async (examId, settingName, value) => {
    try {
      let res;
      // Aapki API ExamId parameter maang rahi hai
      const payload = { ExamId: examId };

      // Switch/If-else condition check karne ke liye ki konsa toggle change hua hai
      if (settingName === "ShowInCatalogue") {
        res = await updateExamCatalogueStatus(payload);
      } else if (settingName === "AllFreeTrial") {
        res = await updateExamFreeTrialStatus(payload);
      } else if (settingName === "OpenEnrollment") {
        res = await updateExamOpenEnrollmentStatus(payload);
      }

      // Agar API success code 200 return kare
      if (res && res.code === 200) {
        toast.success(res.message);
        
        // List me setting ko update karein jisse grid/list dono update ho jaye
        setExamsList((prev) =>
          prev.map((exam) =>
            exam.exam_id === examId
              ? { ...exam, [settingName]: value }
              : exam,
          ),
        );

        // Current open Drawer ka state bhi update karein taaki toggle update ho jaye
        if (selectedExam && selectedExam.exam_id === examId) {
          setSelectedExam((prev) => ({ ...prev, [settingName]: value }));
        }
      } else {
        toast.error(res?.message || "Failed to update setting");
      }
    } catch (err) {
      console.error(err);
      toast.error(`Something went wrong while updating ${settingName}`);
    }
  };

  

  const handleDeleteApi = async (examId) => {
    if (verifyRole(300005)) {
      toast.error("Not allowed to delete exam");
      throw new Error("Not allowed");
    }

    // TODO: Integrate actual delete API here
    // const res = await deleteExam({ examid: examId });
    // if (res.code === 200) {

    toast.success("Exam deleted successfully");
    setExamsList((prev) => prev.filter((exam) => exam.exam_id !== examId));
    setTotal((prev) => prev - 1);
    return;

    // } else { toast.error(res.message); throw new Error("Delete failed"); }
  };

  const handleViewExam = (examId) => {
    const exam = examsList.find((e) => e.exam_id === examId);
    if (exam) {
      setSelectedExam(exam);
      setIsDrawerOpen(true);
    }
  };

  const handleEditExam = (examId) => {
    navigate(`/exammanagement/update/${examId}`);
  };

  const exportToExcel = async () => {
    toast.error("Export to Excel will be integrated soon");
  };

  // Determine if toolbar should be shown
  const shouldShowToolbar = () => {
    if (apiFailed) return false;
    if (loading && !isSearching) return false;
    if (examsList.length === 0 && !searchText) return false;
    return true;
  };

  // UI Columns configured based on API Fields
  const examColumns = [
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
      id: "ExamName",
      header: "Exam Name",
      accessorKey: "ExamName",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(18%_.04_265)] text-xs font-bold text-white">
            <DocumentTextIcon className="h-4 w-4" />
          </span>
          <span className="font-bold text-slate-700">
            {row.original.ExamName}
          </span>
        </div>
      ),
    }),
    { header: "Exam Type", accessorKey: "ExamType" },
    { header: "Short Name", accessorKey: "ExamShortName" },
    { header: "Duration", accessorKey: "Duration" },
    { header: "Total Qns", accessorKey: "TotalQuestions" },
    { header: "Marks", accessorKey: "TotalMarks" },
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const editDisabled = verifyRole(300004);
        const deleteDisabled = verifyRole(300005);
        const examId = row.original.exam_id;
        return (
          <div className="flex gap-3">
            <button
              onClick={() => handleViewExam(examId)}
              className="btn-base btn bg-gray-150 dark:bg-surface-2 dark:text-dark-50 dark:hover:bg-surface-1 size-8 shrink-0 rounded-full p-0 text-gray-900 hover:bg-gray-200"
            >
              <ArrowUpRightIcon className="h-4 w-4" />
            </button>
            <button
              disabled={editDisabled}
              onClick={() => !editDisabled && handleEditExam(examId)}
              className={`rounded-lg transition-colors ${
                editDisabled
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
                  setSelectedId(examId);
                  setDeleteModal(true);
                }
              }}
              className={`rounded-lg transition-colors ${
                deleteDisabled
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

  // Table definition
  const table = useReactTable({
    data: examsList,
    columns: examColumns,
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
        setExamsList((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row,
          ),
        );
      },
      deleteRow: async (row) => {
        await handleDeleteApi(row.original.exam_id);
      },
      setTableSettings,
      setViewType,
      onViewUser: handleViewExam, // GridView and Drawer call this function
      onEditUser: handleEditExam,
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

  useEffect(() => {
    const handleExitFullScreen = () => {
      setTableSettings((prev) => {
        if (!prev.enableFullScreen) return prev;
        import("js-cookie").then((Cookies) => {
          Cookies.default.set("isFullScreenEnabled", "false");
          window.dispatchEvent(new Event("fullscreenchange-state"));
        });
        return { ...prev, enableFullScreen: false };
      });
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExitFullScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      handleExitFullScreen();
    };
  }, [location.pathname]);

  return (
    <Page title="Manage Exams">
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
                Manage Exams
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Update exam details, durations, or remove exams.
              </p>
            </div>

            <Button
              disabled={verifyRole(300003)}
              onClick={() => navigate("/exammanagement/add-exam")}
              className={`flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-semibold text-black shadow-lg transition-all hover:shadow-xl ${
                verifyRole(300003) ? "cursor-not-allowed opacity-50" : ""
              }`}
              style={{
                background: verifyRole(300003)
                  ? "#9CA3AF"
                  : "var(--app-btn-primary)",
              }}
            >
              <PlusIcon className="h-4 w-4" />
              Add Exam
            </Button>

            <div className="absolute bottom-0 left-0 w-full">
              <div className="via-border h-[1.5px] w-full bg-gradient-to-r from-transparent to-transparent" />
              <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[rgb(54,109,176)] to-transparent" />
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
              ) : examsList.length === 0 ? (
                <PremiumEmptyState
                  title={apiFailed ? "Failed to Load Exams" : "No Exams Found"}
                  desc={
                    apiFailed
                      ? "Unable to fetch exams. Please check your connection and try again."
                      : searchText
                        ? `No results found for "${searchText}". Try a different search term.`
                        : "It looks like there are no exams registered yet. Start by adding a new exam."
                  }
                  onAction={
                    !apiFailed
                      ? () => navigate("/exammanagement/add-exam")
                      : undefined
                  }
                  actionText={
                    !apiFailed && !searchText ? "Add Exam" : undefined
                  }
                />
              ) : viewType === "list" ? (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              ) : (
                <ExamGridView table={table} rows={rows} />
              )}

              {examsList.length > 0 && (
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

      {/* <ModalBox
        show={deleteModal}
        onClose={() => setDeleteModal(false)}
        data={seletedId}
        list={() => fetchExams(searchText, activePage, limit)}
      /> */}

      <ExamDrawer
        isOpen={isDrawerOpen}
        close={() => setIsDrawerOpen(false)}
        exam={selectedExam}
        onToggleSettings={handleToggleSettings} 
      />
    </Page>
  );
};

export default ManageExams;
