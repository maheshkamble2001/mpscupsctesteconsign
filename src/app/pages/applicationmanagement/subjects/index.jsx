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
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

// API calls
import { getSubjectsList } from "api/applicationmanagement/subject";

// Modals
import { AddSubjectModal } from "./addstudent";
import EditSubjectModal from "./editstudent";
import { DeleteSubjectModal } from "./DeleteSubjectModal"; // ✅ Imported your clean delete modal component

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
import { ListView } from "components/tables/users-datatable/ListView";

// Utils
import { verifyRole } from "utils/utilities";
import { CustomToolbar } from "components/customs/CustomToolbar";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
  } catch {
    return "—";
  }
};

const Subjects = () => {
  const navigate = useNavigate();
  const columnHelper = createColumnHelper();

  const [subjectList, setSubjectList] = useState([]);
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
  const [columnVisibility, setColumnVisibility] = useLocalStorage("column-visibility-subjects", {});
  const [columnPinning, setColumnPinning] = useLocalStorage("column-pinning-subjects", {});
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedEditSubject, setSelectedEditSubject] = useState(null);
  
  // ✅ Track full subject details to feed the title text into confirm validation hooks
  const [selectedDeleteSubject, setSelectedDeleteSubject] = useState(null);

  // ---------------- FETCH DATA ----------------
  const fetchSubjects = useCallback(
    async (search = "", page = activePage, pageSize = limit) => {
      try {
        setLoading(true);
        setApiFailed(false);
        const res = await getSubjectsList({ search, limit: pageSize, page });

        if (res.code === 200) {
          const rawData = res.data?.subjects || [];
          const totalCount = res.data?.pagination?.totalRecords || res.data?.total || 0;

          const transformed = rawData.map((item) => ({
            subject_id: item.SubjectID || item.id,
            subjectName: item.SubjectName || item.name || "-",
            description: item.Description || item.description || "-",
            status: item.Status ?? item.status ?? 1,
            addedOn: item.AddedOn || item.addedOn || "",
          }));

          setTotal(totalCount);
          setSubjectList(transformed);
        } else {
          setSubjectList([]);
          setTotal(0);
          toast.error(res.message || "Failed to fetch subjects", { id: "fetch-subjects-error" });
          setApiFailed(true);
        }
      } catch (err) {
        console.error("Fetch subjects error:", err);
        setSubjectList([]);
        setTotal(0);
        toast.error("Something went wrong while fetching subjects", { id: "fetch-subjects-catch" });
        setApiFailed(true);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [activePage, limit]
  );

  useEffect(() => {
    fetchSubjects(searchText, activePage, limit);
  }, [fetchSubjects, searchText, activePage, limit]);

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

  // ---------------- ACTION HANDLERS ----------------
  const handleEditSubjectSuccess = () => {
    fetchSubjects(searchText, activePage, limit);
    setEditModalOpen(false);
    setSelectedEditSubject(null);
    navigate("?", { replace: true });
  };

  // ✅ Triggered inside the clean ConfirmModal state flow wrapper directly on response code 200
  const handleDeleteSubjectSuccess = () => {
    fetchSubjects(searchText, activePage, limit);
    setDeleteModal(false);
    setSelectedDeleteSubject(null);
  };

  // ---------------- DEFINING TABLE COLUMNS ----------------
  const subjectColumns = [
    columnHelper.display({
      id: "serial_no",
      header: "Sr.No",
      cell: (info) => (
        <div className="font-medium">
          {info.row.index + 1 + (activePage - 1) * limit}
        </div>
      ),
    }),
    columnHelper.accessor("subjectName", {
      id: "subjectName",
      header: "Subject Name",
      cell: ({ row }) => (
        <span className="font-bold text-slate-700">
          {row.original.subjectName}
        </span>
      ),
    }),
    columnHelper.accessor("description", {
      id: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="line-clamp-2 text-gray-600" title={row.original.description}>
          {row.original.description}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const subjectId = row.original.subject_id;
        const editDisabled = verifyRole(300008);
        const deleteDisabled = verifyRole(300009);

        return (
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedEditSubject(row.original);
                setEditModalOpen(true);
                navigate(`?id=${subjectId}`, { replace: true });
              }}
              disabled={editDisabled}
              className={clsx(
                "rounded-lg transition-colors p-1",
                editDisabled ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-blue-500 hover:bg-blue-50"
              )}
            >
              <PencilIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                if (!deleteDisabled) {
                  setSelectedDeleteSubject(row.original); // ✅ Passing row instead of scalar string ID
                  setDeleteModal(true);
                }
              }}
              disabled={deleteDisabled}
              className={clsx(
                "rounded-lg transition-colors p-1",
                deleteDisabled ? "cursor-not-allowed text-gray-200" : "cursor-pointer text-red-500 hover:bg-red-50"
              )}
              title="Delete Subject"
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
    data: subjectList,
    columns: subjectColumns,
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
        setSubjectList((old) =>
          old.map((row, index) => (index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row))
        );
      },
      setTableSettings,
      setViewType,
      onEditRole: (id) => {
        const item = subjectList.find((s) => s.subject_id === id);
        if (item) {
          setSelectedEditSubject(item);
          setEditModalOpen(true);
          navigate(`?id=${id}`, { replace: true });
        }
      },
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
    if (subjectList.length === 0 && !searchText) return false;
    return true;
  };

  // ---------------- GRID SUB-VIEW COMPONENT ----------------
  const SubjectGridView = ({ rows }) => {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
        {rows.map((row) => {
          const item = row.original;
          const editDisabled = verifyRole(300008);
          const deleteDisabled = verifyRole(300009);

          return (
            <div
              key={item.subject_id}
              className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 text-lg font-bold text-red-700">
                    {item.subjectName ? item.subjectName[0].toUpperCase() : "S"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800 truncate" title={item.subjectName}>
                      {item.subjectName}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-500 line-clamp-2" title={item.description}>
                {item.description}
              </p>

              {item.addedOn && (
                <p className="mt-2 text-xs text-gray-400">
                  <span className="font-medium text-gray-500">Added on: </span>
                  {formatDate(item.addedOn)}
                </p>
              )}

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => {
                    setSelectedEditSubject(item);
                    setEditModalOpen(true);
                    navigate(`?id=${item.subject_id}`, { replace: true });
                  }}
                  disabled={editDisabled}
                  className={clsx(
                    "rounded-lg transition-colors p-1",
                    editDisabled ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-blue-500 hover:bg-blue-50"
                  )}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    if (!deleteDisabled) {
                      setSelectedDeleteSubject(item); // ✅ Updated for grid views as well
                      setDeleteModal(true);
                    }
                  }}
                  disabled={deleteDisabled}
                  className={clsx(
                    "rounded-lg transition-colors p-1",
                    deleteDisabled ? "cursor-not-allowed text-gray-200" : "cursor-pointer text-red-500 hover:bg-red-50"
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
    <Page title="Manage Subjects">
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
                Manage Subjects
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Add, update, or remove subjects from the system streams and curriculums.
              </p>
            </div>

            <Button
              disabled={verifyRole(300007)}
              onClick={() => !verifyRole(300007) && setAddModalOpen(true)}
              className={clsx(
                "flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-semibold text-black shadow-lg transition-all hover:shadow-xl",
                verifyRole(300007) && "cursor-not-allowed opacity-50"
              )}
              style={{
                background: verifyRole(300007) ? "#9CA3AF" : "var(--app-btn-primary)",
              }}
            >
              <PlusIcon className="h-4 w-4 font-bold" />
              Add Subject
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
              hideToolbar
            />
          )}

          {/* Table Container Segment */}
          <div className={clsx("transition-content flex grow flex-col pt-3", tableSettings.enableFullScreen ? "overflow-hidden" : "px-(--margin-x)")}>
            <WrapComponent className={clsx("relative flex grow flex-col", tableSettings.enableFullScreen && "overflow-hidden")}>
              {loading ? (
                viewType === "list" ? <TableSkeleton limit={limit} /> : <GridSkeleton limit={limit} />
              ) : subjectList.length === 0 ? (
                <PremiumEmptyState
                  icon={ShieldCheckIcon}
                  title={apiFailed ? "Failed to Load Subjects" : "No Subjects Found"}
                  desc={
                    apiFailed
                      ? "Unable to fetch configurations. Please check your network and try again."
                      : searchText
                        ? `No matching subjects found for "${searchText}".`
                        : "It looks like there are no subjects defined yet. Start by adding a new one."
                  }
                />
              ) : viewType === "list" ? (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              ) : (
                <SubjectGridView rows={rows} />
              )}

              {/* Bottom Pagination Controls */}
              {subjectList.length > 0 && (
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
      <AddSubjectModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          fetchSubjects(searchText, activePage, limit);
          setAddModalOpen(false);
        }}
      />

      <EditSubjectModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEditSubject(null);
          navigate("?", { replace: true });
        }}
        subjectData={selectedEditSubject}
        onSuccess={handleEditSubjectSuccess}
      />

      {/* ✅ Clean Modal context setup replacing the legacy modal layout snippet */}
      <DeleteSubjectModal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedDeleteSubject(null);
        }}
        selectedSubject={selectedDeleteSubject}
        onSuccess={handleDeleteSubjectSuccess}
      />
    </Page>
  );
};

export default Subjects;