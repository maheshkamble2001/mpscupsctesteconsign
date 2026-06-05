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
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@headlessui/react";
import * as XLSX from "xlsx";

// API Imports
import { getTestsList, deleteTest } from "api/applicationmanagement/tests"; 

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
import { GridSkeleton } from "components/shared/GridSkeleton";
import { ListView } from "components/tables/users-datatable/ListView";
import { CustomToolbar } from "components/customs/CustomToolbar";

// Test View Specific Sub-components 
import { TestDrawer } from "./TestDrawer";
import { TestGridView } from "./TestGridview";
import { ConfirmModal } from "components/shared/ConfirmModal";

/* ========================================================================= 
   REUSABLE MODALBOX FOR TEST DELETION
   ========================================================================= */
function TestDeleteModal({ show, onClose, data, list }) {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const state = error ? "error" : success ? "success" : "pending";

  const messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description: "Are you sure you want to delete this test template? This operation flags the record as deleted and unlinks it from active exam schedules permanently.",
      actionText: "Delete Test",
    },
    success: {
      title: "Test Deleted",
    },
    error: {
      description: "Something went wrong while executing the test template drop routine from database records.",
    },
  };

  const onOk = async () => {
    if (!data) {
      toast.error("Invalid Test Identifier Provided");
      return;
    }
    try {
      setConfirmLoading(true);
      const res = await deleteTest({ TestId: data });
      if (res.code === 200) {
        toast.success(res.message || "Test deleted successfully");
        list();
        setSuccess(true);
        setError(false);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error(res.message || "Failed removing test template records");
        setError(true);
      }
    } catch (err) {
      console.error("Test drop routine sequence crash:", err);
      toast.error("An error occurred during test asset record deletion");
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
   MAIN MANAGE TESTS PAGE MODULE
   ========================================================================= */
const ManageTests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const columnHelper = createColumnHelper();

  // State Management
  const [testsList, setTestsList] = useState([]);
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
  const [viewType, setViewType] = useLocalStorage("tests-table-view-type", "list");
  const [columnVisibility, setColumnVisibility] = useLocalStorage("column-visibility-tests", {});
  const [columnPinning, setColumnPinning] = useLocalStorage("column-pinning-tests", {});
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Action State Controls
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Core Data Fetching mapped precisely to Sequelize Backend Response
  const fetchTests = useCallback(
    async (search = searchText, page = activePage, pageSize = limit) => {
      try {
        setLoading(true);
        setApiFailed(false);

        const res = await getTestsList({ search, limit: pageSize, page });

        if (res?.code === 200) {
          const rawTests = res.data?.rows || [];
          const totalCount = res.data?.count || 0;

          const transformed = rawTests.map((test) => ({
            test_id: test.TestId,
            TestName: test.TestName,
            TestType: test.TestType,
            ExamName: test.Exam?.ExamName || "-",
            Duration: test.Duration ? `${test.Duration} mins` : "-",
            TotalMarks: test.TotalMarks ?? 0,
            PassMarks: test.PassMarks ?? 0,
            languages: test.languages || [], // Already transformed to array via split inside API
            subjectsCount: test.subjects?.length || 0,
            isDeleted: test.isDeleted,
            addedOn: test.addedon || test.createdAt || "",
            data: test, // Keep original unmutated structure for Drawer detail view mappings
          }));

          setTotal(totalCount);
          setTestsList(transformed);
        } else {
          setTestsList([]);
          toast.error(res?.message || "Failed to fetch tests");
          setApiFailed(true);
        }
      } catch (err) {
        console.error("Fetch tests endpoint runtime error:", err);
        setTestsList([]);
        toast.error("Something went wrong while fetching tests records");
        setApiFailed(true);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [activePage, limit, searchText]
  );

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

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

  const handleViewTest = useCallback((testId) => {
    const test = testsList.find((t) => t.test_id === testId);
    if (test) {
      setSelectedTest(test?.data || test); 
      setIsDrawerOpen(true);
    }
  }, [testsList]);

  const handleEditTest = useCallback((testId, rowData) => {
    navigate(`edit-test`, { state: { testData: rowData } });
  }, [navigate]);

  // Comprehensive XLSX Document Downloader Routine
  const exportToExcel = async () => {
    try {
      setLoading(true);
      const res = await getTestsList({
        page: 1,
        limit: total || 1000,
        search: searchText,
      });

      const rawRows = res?.data?.rows || [];

      if (rawRows.length === 0) {
        toast.error("No data available to export");
        return;
      }

      const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";
        return `${String(date.getDate()).padStart(2, "0")}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${date.getFullYear()}`;
      };

      const excelData = rawRows.map((test, idx) => ({
        "SR No": idx + 1,
        "Test Name": test.TestName || "-",
        "Test Type": test.TestType || "-",
        "Mapped Exam Name": test.Exam?.ExamName || "-",
        "Duration": test.Duration ? `${test.Duration} mins` : "-",
        "Total Marks": test.TotalMarks ?? 0,
        "Pass Marks": test.PassMarks ?? 0,
        "Available Languages": test.languages ? test.languages.join(", ") : "—",
        "Subject Mappings Count": test.TestQuestions ? test.TestQuestions.length : 0,
        "Creation Date": formatDate(test.addedon || test.createdAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tests");
      XLSX.writeFile(workbook, "Tests_Templates_List.xlsx");
      toast.success("Tests spreadsheet workbook downloaded successfully");
    } catch (error) {
      console.error("Excel generation routine failed:", error);
      toast.error("Failed to export complete tests dataset records");
    } finally {
      setLoading(false);
    }
  };

  const shouldShowToolbar = () => {
    if (apiFailed) return false;
    if (loading && !isSearching) return false;
    if (testsList.length === 0 && !searchText) return false;
    return true;
  };

  // TanStack Table Column Definitions
  const testColumns = [
    columnHelper.display({
      id: "serial_no",
      header: "Sr.No",
      cell: (info) => <div className="text-center">{info.row.index + 1 + (activePage - 1) * limit}</div>,
    }),
    columnHelper.display({
      id: "TestName",
      header: "Test Name",
      accessorKey: "TestName",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">{row.original.TestName}</span>
        </div>
      ),
    }),
    { header: "Test Type", accessorKey: "TestType" },
    { header: "Exam Association", accessorKey: "ExamName" },
    { header: "Duration", accessorKey: "Duration" },
    columnHelper.display({
      id: "languages",
      header: "Languages",
      cell: ({ row }) => {
        const langs = row.original.languages;
        if (!langs || langs.length === 0) return <span className="text-gray-400 font-normal text-xs italic">None</span>;
        return <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{langs.join(", ")}</span>;
      }
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const editDisabled = verifyRole(300004);
        const deleteDisabled = verifyRole(300005);
        const testId = row.original.test_id;

        return (
          <div className="flex gap-3">
            <button
              onClick={() => handleViewTest(testId)}
              className="btn-base btn bg-gray-150 dark:bg-surface-2 dark:text-dark-50 dark:hover:bg-surface-1 size-8 shrink-0 rounded-full p-0 text-gray-900 hover:bg-gray-200"
            >
              <ArrowUpRightIcon className="h-4 w-4" />
            </button>
            <Button
              disabled={editDisabled}
              onClick={() => !editDisabled && handleEditTest(testId, row.original.data)}
              className={`rounded-lg transition-colors ${editDisabled ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-blue-500 hover:bg-blue-50"}`}
            >
              <PencilIcon className="h-5 w-5" />
            </Button>
            <button
              disabled={deleteDisabled}
              onClick={() => {
                if (!deleteDisabled) {
                  setSelectedId(testId);
                  setDeleteModal(true);
                }
              }}
              className={`rounded-lg transition-colors ${deleteDisabled ? "cursor-not-allowed text-gray-200" : "cursor-pointer text-red-500 hover:bg-red-50"}`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        );
      },
    }),
  ];

  // TanStack Table Instance Orchestration Hooks
  const table = useReactTable({
    data: testsList,
    columns: testColumns,
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
        setTestsList((old) =>
          old.map((row, index) => (index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row))
        );
      },
      deleteRow: (row) => {
        setSelectedId(row.original.test_id);
        setDeleteModal(true);
      },
      setTableSettings,
      setViewType,
      onViewUser: handleViewTest,
      onEditUser: handleEditTest,
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
    <Page title="Manage Tests">
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen && "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3"
          )}
        >
          {/* Header Layout Container */}
          <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3 px-(--margin-x) pt-6 pb-6">
            <div className="space-y-1">
              <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                Manage Tests
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Configure quiz configurations, language availability matrices, and subject content.
              </p>
            </div>

            <Button
              disabled={verifyRole(300003)}
              onClick={() => navigate("add-test")}
              className={clsx(
                "flex items-center gap-2 rounded px-4 py-2 font-semibold text-black shadow-lg transition-all hover:shadow-xl",
                verifyRole(300003) ? "cursor-not-allowed opacity-50 bg-gray-400" : "cursor-pointer"
              )}
              style={!verifyRole(300003) ? { background: "var(--app-btn-primary)" } : {}}
            >
              <PlusIcon className="h-4 w-4" />
              Add Test
            </Button>

            <div className="absolute bottom-0 left-0 w-full">
              <div className="via-border h-[1.5px] w-full bg-gradient-to-r from-transparent to-transparent" />
              <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#366db0] to-transparent" />
            </div>
          </div>

          {shouldShowToolbar() && (
            <CustomToolbar table={table} onExportExcel={exportToExcel} onSearch={handleSearch} searchValue={searchText} />
          )}

          {/* Dynamic Content Switching Wrapper Area */}
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
                viewType === "list" ? <TableSkeleton limit={limit} /> : <GridSkeleton limit={limit} />
              ) : testsList.length === 0 ? (
                <PremiumEmptyState
                  title={apiFailed ? "Failed to Load Tests" : "No Tests Found"}
                  desc={
                    apiFailed
                      ? "Unable to pull test configurations from server records. Check connectivity parameters."
                      : searchText
                        ? `No matching records found for search string: "${searchText}".`
                        : "No test evaluation structures have been populated within this ecosystem module yet."
                  }
                  onAction={!apiFailed && !searchText ? () => navigate("add-test") : undefined}
                  actionText={!apiFailed && !searchText ? "Add Test" : undefined}
                />
              ) : viewType === "list" ? (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              ) : (
                <TestGridView table={table} rows={rows} />
              )}

              {testsList.length > 0 && (
                <div
                  className={clsx(
                    "pb-4 sm:pt-4",
                    (viewType === "list" || tableSettings.enableFullScreen) && "px-4 sm:px-5",
                    tableSettings.enableFullScreen && "dark:bg-dark-800 bg-gray-50",
                    !(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && "pt-4",
                    viewType === "grid" && !tableSettings.enableFullScreen && "mt-3"
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

      {/* Confirmation Drop Flow Trigger */}
      <TestDeleteModal
        show={deleteModal}
        onClose={() => { setDeleteModal(false); setSelectedId(""); }}
        data={selectedId}
        list={fetchTests}
      />

      <TestDrawer
        isOpen={isDrawerOpen}
        close={() => setIsDrawerOpen(false)}
        test={selectedTest}
      />
    </Page>
  );
};

export default ManageTests;