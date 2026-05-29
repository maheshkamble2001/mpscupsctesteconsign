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
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

// API calls
import {
  getSubjectsList,
  // deleteSubject,
} from "api/applicationmanagement/subject";

// Yaha humne modal ko import kar liya
import { AddSubjectModal } from "./addstudent";

// UI & Components
import { Page } from "components/shared/Page";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { useNavigate } from "react-router-dom";
import { Button } from "@headlessui/react";
import { Card } from "components/ui";
import { useLockScrollbar, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { ListView } from "components/tables/users-datatable/ListView";
import EditSubjectModal from "./editstudent";

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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEditSubject, setSelectedEditSubject] = useState(null);

  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
    enableSorting: true,
    enableColumnFilters: true,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-subjects",
    {},
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-subjects",
    {},
  );
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Modal State
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubjects = useCallback(
    async (search = "", page = activePage, pageSize = limit) => {
      try {
        setLoading(true);
        setApiFailed(false);
        const res = await getSubjectsList({ search, limit: pageSize, page });

        if (res.code === 200) {
          const rawData = res.data?.subjects || [];
          const totalCount = res.data?.total || 0;

          const transformed = rawData.map((item) => ({
            subject_id: item.SubjectID,
            subjectName: item.SubjectName || "-",
            description: item.Description ? item.Description : "-",
            status: item.Status,
            addedOn: item.AddedOn,
          }));

          setTotal(totalCount);
          setSubjectList(transformed);
        } else {
          setSubjectList([]);
          toast.error(res.message || "Failed to fetch subjects");
          setApiFailed(true);
        }
      } catch (err) {
        console.error("Fetch subjects error:", err);
        setSubjectList([]);
        toast.error("Something went wrong while fetching subjects");
        setApiFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [activePage, limit],
  );

  useEffect(() => {
    fetchSubjects(searchText, activePage, limit);
  }, [fetchSubjects, searchText, activePage, limit]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setActivePage(1);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setActivePage(1);
  };

  const handlePageChange = (newPage) => {
    setActivePage(newPage);
  };

  const handleDeleteSubjectApi = async () => {
    try {
      setIsDeleting(true);
      // const res = await deleteSubject({ id: selectedId }); // API un-comment kar lena
      toast.success("Subject deleted successfully");
      setDeleteModal(false);
      await fetchSubjects(searchText, activePage, limit);
    } catch {
      toast.error("Something went wrong while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  // Table Columns Setup
  const subjectColumns = [
    columnHelper.display({
      id: "serial_no",
      header: "Sr.No",
      cell: (info) => (
        <div className="text-center font-medium">
          {info.row.index + 1 + (activePage - 1) * limit}
        </div>
      ),
    }),
    columnHelper.accessor("subjectName", {
      header: "Subject Name",
      cell: ({ row }) => (
        <span className="font-bold text-slate-700">
          {row.original.subjectName}
        </span>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: ({ row }) => (
        <span
          className="line-clamp-2 text-gray-600"
          title={row.original.description}
        >
          {row.original.description}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const subjectId = row.original.subject_id;
        return (
          <div className="flex gap-3">
                       <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedEditSubject(row.original);
                setEditModalOpen(true);
                // URL me ID update karega (eg. /subjects?id=12)
                navigate(`?id=${subjectId}`, { replace: true }); 
              }}
              className="flex cursor-pointer items-center justify-center rounded-lg p-1 text-blue-500 transition-colors hover:bg-blue-50"
            >
              <PencilIcon className="h-5 w-5" />
            </button>


            <button
              onClick={() => {
                setSelectedId(subjectId);
                setDeleteModal(true);
              }}
              className="flex cursor-pointer items-center justify-center rounded-lg p-1 text-red-500 transition-colors hover:bg-red-50"
              title="Delete Subject"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        );
      },
    }),
  ];

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
    },
    meta: {
      updateData: (rowIndex, columnId, value) => {
        skipAutoResetPageIndex();
        setSubjectList((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row,
          ),
        );
      },
      setTableSettings,
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

  return (
    <Page title="Manage Subjects">
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen &&
              "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3",
          )}
        >
          {/* Header Section */}
          <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3 px-(--margin-x) pt-6 pb-6">
            <div className="space-y-1">
              <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                Manage Subjects
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Add, update, or remove subjects from the system.
              </p>
            </div>

            <Button
              onClick={() => setAddModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgb(54, 109, 176), rgb(255, 69, 66))",
              }}
            >
              <PlusIcon className="h-4 w-4 font-bold text-white" />
              Add Subject
            </Button>

            <div className="absolute bottom-0 left-0 w-full">
              <div className="via-border h-[1.5px] w-full bg-gradient-to-r from-transparent to-transparent" />
              <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[rgb(54,109,176)] to-transparent" />
            </div>
          </div>

          {/* Inline Toolbar / Search Bar */}
          <div className="flex w-full items-center justify-between px-(--margin-x) pb-4">
            <div className="relative w-full max-w-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                value={searchText}
                onChange={handleSearchChange}
                className="block w-full rounded-md border-0 py-2 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6"
                placeholder="Search subjects..."
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div
            className={clsx(
              "transition-content flex grow flex-col pt-3",
              tableSettings.enableFullScreen
                ? "overflow-hidden"
                : "px-(--margin-x)",
            )}
          >
            <Card
              className={clsx(
                "relative flex grow flex-col",
                tableSettings.enableFullScreen && "overflow-hidden",
              )}
            >
              {loading ? (
                <TableSkeleton limit={limit} />
              ) : subjectList.length === 0 ? (
                <PremiumEmptyState
                  title={
                    apiFailed ? "Failed to Load Subjects" : "No Subjects Found"
                  }
                  desc={
                    apiFailed
                      ? "Unable to fetch subjects. Please check your connection and try again."
                      : searchText
                        ? `No results found for "${searchText}". Try a different search term.`
                        : "It looks like there are no subjects added yet. Start by adding a new one."
                  }
                  onAction={
                    !apiFailed ? () => setAddModalOpen(true) : undefined
                  }
                  actionText={
                    !apiFailed && !searchText ? "Add Subject" : undefined
                  }
                />
              ) : (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              )}

              {subjectList.length > 0 && (
                <div
                  className={clsx(
                    "pb-4 sm:pt-4",
                    tableSettings.enableFullScreen
                      ? "dark:bg-dark-800 bg-gray-50 px-4 sm:px-5"
                      : "px-4 sm:px-5",
                    !(
                      table.getIsSomeRowsSelected() ||
                      table.getIsAllRowsSelected()
                    ) && "pt-4",
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
            </Card>
          </div>
        </div>
      </div>

      {/* Render Add Subject Modal Here */}
      <AddSubjectModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => fetchSubjects(searchText, activePage, limit)}
      />

            <EditSubjectModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          // Modal band hone par URL se ID hata dega
          navigate(".", { replace: true }); 
        }}
        onSuccess={() => fetchSubjects(searchText, activePage, limit)}
        subjectData={selectedEditSubject}
      />


      {/* Inline Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Subject
              </h3>
              <button
                onClick={() => setDeleteModal(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this subject? This action cannot
                be undone.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                onClick={handleDeleteSubjectApi}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default Subjects;
