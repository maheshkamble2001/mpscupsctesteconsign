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
  DocumentPlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { Button } from "@headlessui/react";

// UI & Components
import { Page } from "components/shared/Page";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { Box, Card } from "components/ui";
import { useLockScrollbar, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { GridSkeleton } from "components/shared/GridSkeleton";
import { verifyRole } from "utils/utilities";
import { CustomToolbar } from "components/customs/CustomToolbar";

// Sub-components & Relational UI Context
import { ListView } from "components/tables/users-datatable/ListView";
import { getQuestionsList } from "api/applicationmanagement/questions";
import { QuestionDrawer } from "./sub/QuestionDrawer";
import { ModalBox } from "./sub/ModalBox";

const ManageQuestionBank = () => {
  const navigate = useNavigate();
  const columnHelper = createColumnHelper();

  const [questionsList, setQuestionsList] = useState([]);
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
    "questions-table-view-type",
    "list",
  );
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-questions",
    "{}",
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-questions",
    "{}",
  );
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [statusLoading, setStatusLoading] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const fetchQuestions = useCallback(
    async (search = "", page = activePage, pageSize = limit) => {
      try {
        setLoading(true);
        setApiFailed(false);
        const res = await getQuestionsList({ search, limit: pageSize, page });

        if (res.code === 200) {
          const rawQuestions = res.data?.questions || [];
          const totalCount = res.data?.total || 0;

          // Transforming backend data mappings while preserving raw structure
          const transformed = rawQuestions.map((q) => ({
            id: q.QuestionID,
            questionText: q.Question || "N/A",
            subject: q.Subject?.SubjectName || q.SubjectName || "-",
            subjectId: q.Subject?.SubjectID || q.SubjectID || null,
            examType: q.ExamType?.name || "-",
            examTypeId: q.ExamType?.id || q.id || null,
            status: q.Status ? 1 : 0,
            addedOn: q.AddedOn || "",
            data: q // ✅ Retains full nested properties (Option1-4, CorrectOption, AnswerDesc)
          }));

          setTotal(totalCount);
          setQuestionsList(transformed);
        } else {
          setQuestionsList([]);
          toast.error(res.message || "Failed to fetch questions", { id: "fetch-questions-error" });
          setApiFailed(true);
        }
      } catch (err) {
        console.error("Fetch questions error:", err);
        setQuestionsList([]);
        toast.error("Something went wrong while fetching questions", { id: "fetch-questions-error-catch" });
        setApiFailed(true);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [activePage, limit],
  );

  useEffect(() => {
    fetchQuestions(searchText, activePage, limit);
  }, [fetchQuestions, searchText, activePage, limit]);

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

  const handleUpdateQuestionStatus = async (questionId, newStatus) => {
    if (verifyRole(400006)) {
      toast.error("Not allowed to change status");
      return;
    }
    try {
      setStatusLoading((prev) => ({ ...prev, [questionId]: true }));
    } catch {
      toast.error("Something went wrong while updating status");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleDeleteQuestionApi = async (questionId) => {
    if (verifyRole(400005)) {
      toast.error("Not allowed to delete question");
      throw new Error("Not allowed");
    }
  };

  // ✅ Extract raw backend sub-object to populate the drawer with Option1-Option4 structural rows
  const handleViewQuestion = (questionId) => {
    const questionMatch = questionsList.find((q) => Number(q.id) === Number(questionId));
    if (questionMatch && questionMatch.data) {
      setSelectedQuestion(questionMatch.data);
      setIsDrawerOpen(true);
    } else {
      toast.error("Could not trace nested blueprint parameters for this entry row");
    }
  };

  const handleEditQuestion = (questionId) => {
    navigate(`update-question/${questionId}`);
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);

      // Fetch the complete unfiltered or paginated question data scope for export
      const res = await getQuestionsList({
        page: 1,
        limit: total || 1000,
        search: searchText,
      });

      if (!res?.data?.questions || res.data.questions.length === 0) {
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

      // Transforming the structural question data fields into clean excel rows
      const excelData = res.data.questions.map((q, idx) => ({
        "SR No": idx + 1,
        "Question ID": q.QuestionID || "—",
        "Question Text": q.Question || "—",
        "Subject": q.Subject?.SubjectName || q.SubjectName || "—",
        "Exam Type": q.ExamType?.name || "—",
        "Option A": q.Option1 || "—",
        "Option B": q.Option2 || "—",
        "Option C": q.Option3 || "—",
        "Option D": q.Option4 || "—",
        "Correct Answer": q.CorrectOption || "—",
        "Explanation": q.AnswerDesc || "—",
        "Status": q.Status ? "Active" : "Inactive",
        "Added On": formatDate(q.AddedOn),
      }));

      // Generate Excel Sheet & File Write Stream
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Question Bank");
      XLSX.writeFile(workbook, "Question_Bank_Export.xlsx");

      toast.success("Question bank exported successfully");
    } catch (error) {
      console.error("Export operation failure:", error);
      toast.error("Failed to export question bank data");
    } finally {
      setLoading(false);
    }
  };

  const shouldShowToolbar = () => {
    if (apiFailed) return false;
    if (loading && !isSearching) return false;
    if (questionsList.length === 0 && !searchText) return false;
    return true;
  };

  // Setup Columns layout for Question Bank Schema
  const questionColumns = [
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
      id: "questionText",
      header: "Question",
      accessorKey: "questionText",
      cell: ({ row }) => (
        <div className="max-w-md overflow-hidden text-ellipsis whitespace-nowrap font-medium text-slate-700">
          {row.original.questionText}
        </div>
      ),
    }),
    { header: "Subject", accessorKey: "subject" },
    { header: "Exam Type", accessorKey: "examType" },
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const editDisabled = verifyRole(400004);
        const deleteDisabled = verifyRole(400004);
        const questionId = row.original.id;
        return (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleViewQuestion(questionId)}
              className="btn-base btn bg-gray-150 dark:bg-surface-2 dark:text-dark-50 dark:hover:bg-surface-1 size-8 shrink-0 rounded-full p-0 text-gray-900 hover:bg-gray-200 cursor-pointer"
            >
              <ArrowUpRightIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={editDisabled}
              onClick={() => {
                navigate(`update-question/${questionId}`, { state: row.original.data });
              }}
              className={`rounded-lg transition-colors ${editDisabled
                ? "cursor-not-allowed text-gray-300"
                : "cursor-pointer text-blue-500 hover:bg-blue-50"
                }`}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              disabled={deleteDisabled}
              onClick={() => {
                if (!deleteDisabled) {
                  setSelectedId(questionId);
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
    data: questionsList,
    columns: questionColumns,
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
        setQuestionsList((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row,
          ),
        );
      },
      deleteRow: async (row) => {
        await handleDeleteQuestionApi(row.original.id);
      },
      setTableSettings,
      setViewType,
      onViewUser: handleViewQuestion,
      onEditUser: handleEditQuestion,
      onStatusChange: handleUpdateQuestionStatus,
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

  const rows = table.getFilteredRowModel().rows;
  const WrapComponent = viewType === "list" ? Card : Box;

  return (
    <Page title="Question Bank Management">
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
                Question Bank
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Manage structural assessment queries, edit subject contexts, and track exam metadata.
              </p>
            </div>

            <Button
              disabled={verifyRole(400003)}
              onClick={() => navigate("add-question")}
              className={`flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-semibold text-black shadow-lg transition-all hover:shadow-xl ${verifyRole(400003) ? "cursor-not-allowed opacity-50" : ""
                }`}
              style={{
                background: verifyRole(400003)
                  ? "#9CA3AF"
                  : "var(--app-btn-primary)",
              }}
            >
              <DocumentPlusIcon className="h-4 w-4" />
              Add Question
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
              hideToolbar
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
              ) : questionsList.length === 0 ? (
                <PremiumEmptyState
                  title={apiFailed ? "Failed to Load Questions" : "No Questions Found"}
                  desc={
                    apiFailed
                      ? "Unable to fetch assessment data. Check your system connection."
                      : searchText
                        ? `No matching questions found for "${searchText}".`
                        : "No records found. Start creating items by clicking Add Question."
                  }
                  onAction={!apiFailed ? () => navigate("/questionbank/add-question") : undefined}
                  actionText={!apiFailed && !searchText ? "Add Question" : undefined}
                />
              ) : (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              )}

              {questionsList.length > 0 && (
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

      {/* ✅ Correctly links selected question payload properties to question context parameter key */}
      <QuestionDrawer
        isOpen={isDrawerOpen}
        close={() => setIsDrawerOpen(false)}
        question={selectedQuestion}
      />

      <ModalBox
        show={deleteModal}
        onClose={() => setDeleteModal(false)}
        data={selectedId}
        list={() => fetchQuestions(searchText, activePage, limit)}
      />
    </Page>
  );
};

export default ManageQuestionBank;