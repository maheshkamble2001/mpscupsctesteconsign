import React, { useEffect, useState, useCallback } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { toast } from "sonner";
import { PencilIcon, TrashIcon, AcademicCapIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

// API (Ensure these endpoints are created matching your structure)
// import { getExamTypesList, updateExamTypeStatus, deleteExamType } from "api/usermanagement/examtypes";

// UI Components
import { Page } from "components/shared/Page";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { GridSkeleton } from "components/shared/GridSkeleton";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { Button } from "@headlessui/react";
import { Box, Card } from "components/ui";
import { useLockScrollbar, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { ListView } from "components/tables/users-datatable/ListView";


// Utils
import { verifyRole } from "utils/utilities";
import { DeleteExamTypeModal } from "./DeleteExamTypeModal";
import { EditExamType } from "./EditExamType";
import { AddExamType } from "./AddExamType";
import { CustomToolbar } from "./CustomToolbar";
import { deleteExamType, getExamTypesList, updateExamTypeStatus } from "api/applicationmanagement2/examtype";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  } catch {
    return "—";
  }
};

const ExamTypes = () => {
  const columnHelper = createColumnHelper();

  const [examData, setExamData] = useState([]);
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
  const [viewType, setViewType] = useLocalStorage("exam-types-table-view-type", "list");
  const [columnVisibility, setColumnVisibility] = useLocalStorage("column-visibility-exam-types", {});
  const [columnPinning, setColumnPinning] = useLocalStorage("column-pinning-exam-types", {});
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Modal States
  const [open, setOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});

  // ---------------- FETCH DATA ----------------
  const fetchExamTypes = useCallback(async (search = "", page = activePage, pageSize = limit) => {
    try {
      setLoading(true);
      setApiFailed(false);
      const res = await getExamTypesList({
        search,
        page,
        limit: pageSize,
      });

      if (res.code === 200) {
        const rawData = res.data.examtypes || [];
        const transformed = rawData.map((item) => ({
          examtypeid: item.id,
          examType: item.name, // ✅ correct field
          status: item.status === 1 ? 1 : 0,
          addedOn: item.addedOn || "",
          description: item.description || "",
        }));

        setExamData(transformed);
        setTotal(res.data.pagination?.totalRecords || 0);
      } else {
        toast.error(res.message || "Failed to fetch exam types", { id: "fetch-exams-error" });
        setExamData([]);
        setTotal(0);
        setApiFailed(true);
      }
    } catch (err) {
      toast.error("Something went wrong", { id: "fetch-exams-error-catch" });
      setExamData([]);
      setTotal(0);
      setApiFailed(true);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [activePage, limit]);

  useEffect(() => {
    fetchExamTypes(searchText, activePage, limit);
  }, [fetchExamTypes, searchText, activePage, limit]);

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

  // ---------------- STATUS UPDATE ----------------
  const handleUpdateExamTypeStatus = async (examtypeid, newStatus) => {
    if (verifyRole(300010)) { // Keeps your system permission code checks
      toast.error("Not allowed to change status");
      return;
    }
    try {
      setStatusLoading((prev) => ({ ...prev, [examtypeid]: true }));
      const res = await updateExamTypeStatus({
        id:examtypeid,
        status: newStatus ? 1 : 0,
      });

      if (res.code === 200) {
        toast.success("Exam type status updated");
        setExamData((prev) =>
          prev.map((item) =>
            item.examtypeid === examtypeid
              ? { ...item, status: newStatus ? 1 : 0 }
              : item
          )
        );
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Something went wrong while updating status");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [examtypeid]: false }));
    }
  };

  // ---------------- DELETE ACTION ----------------
  const handleDeleteExamType = async (examtypeid) => {
    if (verifyRole(300009)) {
      toast.error("Not allowed to delete exam type");
      throw new Error("Not allowed");
    }
    const res = await deleteExamType({ examtypeid });
    if (res.code === 200) {
      toast.success("Exam type deleted successfully");
      await fetchExamTypes(searchText, activePage, limit);
      return;
    } else {
      toast.error(res.message || "Failed to delete exam type");
      throw new Error(res.message || "Delete failed");
    }
  };

  // ---------------- ACTION HANDLERS ----------------
  const handleEditExamTypeSuccess = (updatedExam) => {
    setExamData((prev) =>
      prev.map((item) =>
        item.examtypeid === updatedExam.examtypeid
          ? { ...item, examType: updatedExam.examType, description: updatedExam.description }
          : item
      )
    );
    setIsEditOpen(false);
    setSelectedExamType(null);
  };

  const handleDeleteExamTypeSuccess = () => {
    fetchExamTypes(searchText, activePage, limit);
    setIsDeleteOpen(false);
    setSelectedExamType(null);
  };

  // ---------------- DEFINING TABLE COLUMNS ----------------
  const examColumns = [
    columnHelper.display({
      id: "serial_no",
      header: "Sr.No",
      cell: (info) => <div>{info.row.index + 1 + (activePage - 1) * limit}</div>,
    }),
    columnHelper.display({
      id: "examType",
      header: "Exam Type",
      accessorKey: "examType",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {/* <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0a3a5] text-xs font-bold text-[#1E1E2D]">
            {row.original.examType ? row.original.examType[0].toUpperCase() : "E"}
          </span> */}
          <span className="font-bold text-slate-700">{row.original.examType}</span>
        </div>
      ),
    }),
    // {
    //   id: "addedOn",
    //   header: "Added On",
    //   accessorKey: "addedOn",
    //   cell: ({ getValue }) => <span className="text-sm text-gray-600">{formatDate(getValue())}</span>,
    // },
    columnHelper.accessor((row) => row.status, {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <StyledSwitch
            checked={row.original.status === 1}
            onChange={(checked) => handleUpdateExamTypeStatus(row.original.examtypeid, checked)}
            loading={statusLoading[row.original.examtypeid]}
          />
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const editDisabled = verifyRole(300008);
        const deleteDisabled = verifyRole(300009);
        return (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedExamType(row.original);
                setIsEditOpen(true);
              }}
              disabled={editDisabled}
              className={clsx(
                "rounded-lg transition-colors",
                editDisabled ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-blue-500 hover:bg-blue-50"
              )}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              disabled={deleteDisabled}
              onClick={() => {
                if (!deleteDisabled) {
                  setSelectedExamType(row.original);
                  setIsDeleteOpen(true);
                }
              }}
              className={clsx(
                "rounded-lg transition-colors",
                deleteDisabled ? "cursor-not-allowed text-gray-200" : "cursor-pointer text-red-500 hover:bg-red-50"
              )}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        );
      },
    }),
  ];

  // ---------------- TANSTACK CONFIG ----------------
  const table = useReactTable({
    data: examData,
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
        setExamData((old) =>
          old.map((row, index) => (index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row))
        );
      },
      deleteRow: async (row) => {
        await handleDeleteExamType(row.original.examtypeid);
      },
      setTableSettings,
      setViewType,
      onEditRole: (id) => {
        const item = examData.find((e) => e.examtypeid === id);
        if (item) {
          setSelectedExamType(item);
          setIsEditOpen(true);
        }
      },
      onStatusChange: handleUpdateExamTypeStatus,
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

  const shouldShowToolbar = () => {
    if (apiFailed) return false;
    if (loading && !isSearching) return false;
    if (examData.length === 0 && !searchText) return false;
    return true;
  };

  // ---------------- GRID SUB-VIEW COMPONENT ----------------
  const ExamGridView = ({ rows }) => {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
        {rows.map((row) => {
          const item = row.original;
          return (
            <div
              key={item.examtypeid}
              className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-lg font-bold text-blue-700">
                    {item.examType ? item.examType[0].toUpperCase() : "E"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.examType}</h3>
                  </div>
                </div>
                <StyledSwitch
                  checked={item.status === 1}
                  onChange={(checked) => handleUpdateExamTypeStatus(item.examtypeid, checked)}
                  loading={statusLoading[item.examtypeid]}
                />
              </div>
              {item.addedOn && (
                <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                  <span className="font-medium text-gray-600">Added on: </span>
                  {formatDate(item.addedOn)}
                </p>
              )}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => {
                    setSelectedExamType(item);
                    setIsEditOpen(true);
                  }}
                  disabled={verifyRole(300008)}
                  className={clsx(
                    "rounded-lg transition-colors",
                    verifyRole(300008) ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-blue-500 hover:bg-blue-50"
                  )}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    if (!verifyRole(300009)) {
                      setSelectedExamType(item);
                      setIsDeleteOpen(true);
                    }
                  }
                  }
                  disabled={verifyRole(300009)}
                  className={clsx(
                    "rounded-lg transition-colors",
                    verifyRole(300009) ? "cursor-not-allowed text-gray-200" : "cursor-pointer text-red-500 hover:bg-red-50"
                  )}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Page title="Exam Management">
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen && "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3"
          )}
        >
          {/* Header Layout */}
          <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3 px-(--margin-x) pt-6 pb-6">
            <div className="space-y-1">
              <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                Exam Types
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Create and manage different evaluation categories, system streams, and testing levels.
              </p>
            </div>

            <Button
              disabled={verifyRole(300007)}
              onClick={() => !verifyRole(300007) && setOpen(true)}
              className={clsx(
                "flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-semibold text-black shadow-lg transition-all hover:shadow-xl",
                verifyRole(300007) && "cursor-not-allowed opacity-50"
              )}
              style={{
                background: verifyRole(300007) ? "#9CA3AF" : "var(--app-btn-primary)",
              }}
            >
              <AcademicCapIcon className="h-4 w-4" />
              Add Exam Type
            </Button>

            <div className="absolute bottom-0 left-0 w-full">
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[rgb(54,109,176)] to-transparent" />
            </div>
          </div>

          {/* Action Toolbar */}
          {shouldShowToolbar() && (
            <CustomToolbar
              table={table}
              onExportExcel={false}
              onSearch={handleSearch}
              searchValue={searchText}
            />
          )}

          {/* Table Container Segment */}
          <div className={clsx("transition-content flex grow flex-col pt-3", tableSettings.enableFullScreen ? "overflow-hidden" : "px-(--margin-x)")}>
            <WrapComponent className={clsx("relative flex grow flex-col", tableSettings.enableFullScreen && "overflow-hidden")}>
              {loading ? (
                viewType === "list" ? <TableSkeleton limit={limit} /> : <GridSkeleton limit={limit} />
              ) : examData.length === 0 ? (
                <PremiumEmptyState
                  icon={ShieldCheckIcon}
                  title={apiFailed ? "Failed to Load Exam Types" : "No Exam Types Found"}
                  desc={
                    apiFailed
                      ? "Unable to fetch configurations. Please check your network and try again."
                      : searchText
                        ? `No matching categories found for "${searchText}".`
                        : "It looks like there are no exam types defined yet. Start by adding a new one."
                  }
                />
              ) : viewType === "list" ? (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              ) : (
                <ExamGridView rows={rows} />
              )}

              {/* Bottom Pagination controls */}
              {examData.length > 0 && (
                <div className={clsx(
                  "pb-4 sm:pt-4",
                  (viewType === "list" || tableSettings.enableFullScreen) && "px-4 sm:px-5",
                  tableSettings.enableFullScreen && "dark:bg-dark-800 bg-gray-50",
                  !(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && "pt-4",
                  viewType === "grid" && !tableSettings.enableFullScreen && "mt-3"
                )}>
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

      {/* Modals Containers Setup */}
      <AddExamType
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          fetchExamTypes(searchText, activePage, limit);
          setOpen(false);
        }}
      />

      <EditExamType
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedExamType(null);
        }}
        selectedExamType={selectedExamType}
        onSuccess={handleEditExamTypeSuccess}
      />

      <DeleteExamTypeModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedExamType(null);
        }}
        selectedExamType={selectedExamType}
        onSuccess={handleDeleteExamTypeSuccess}
      />
    </Page>
  );
};

export default ExamTypes;