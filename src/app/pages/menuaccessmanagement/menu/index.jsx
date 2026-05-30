import React, { useState, useEffect, useCallback, useRef } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, getFacetedMinMaxValues, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Page } from "components/shared/Page";
import { Badge, Button } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { PencilIcon, TrashIcon, ShieldCheckIcon, } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ✅ API
import {
  getMenuModulesDropdown,
  getMenuAccessCodesList,
  updateMenuAccessCodeStatus,
} from "api/menuaccessmanagement/menus";

// ✅ UI Components
import { IdCell } from "components/tables/advanced-table/HRTable/rows";
import { Skeleton } from "components/ui/Skeleton";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { Box, Card } from "components/ui";
import { useLockScrollbar, useDidUpdate, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { ListView } from "components/tables/users-datatable/ListView";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { GridSkeleton } from "components/shared/GridSkeleton";

// ✅ Modals
import { AddMenuModal } from "./addMenu";
import { DeleteMenuAccessCodeModal } from "./deleteMenu";
import { EditMenuModal } from "./editMenu";

// ✅ Utils
import { verifyRole } from "utils/utilities";
import { Menu, MenuIcon } from "lucide-react";
import { BUTTON_CONFIG } from "constants/app2.constant";
import { CustomToolbar } from "components/customs/CustomToolbar";

export default function MenuList() {
  const columnHelper = createColumnHelper();

  // Brand Colors
  const srRed = "#FE4543";
  const srBlue = "#3368AF";

  // -------------------- States --------------------
  const [records, setRecords] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [allModules, setAllModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMenuAccessCode, setSelectedMenuAccessCode] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});

  // Table settings and view state
  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
    enableSorting: true,
    enableColumnFilters: true,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [viewType, setViewType] = useLocalStorage("menu-list-table-view-type", "list");
  const [columnVisibility, setColumnVisibility] = useLocalStorage("column-visibility-menu-list", {});
  const [columnPinning, setColumnPinning] = useLocalStorage("column-pinning-menu-list", {});
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // -------------------- Fetch Modules for Dropdown --------------------
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await getMenuModulesDropdown();
        if (res.code === 200) {
          const { rows } = res.data.menumodules || { rows: [] };
          const modules = (rows || []).map(({ id, modulename }) => ({
            label: modulename,
            value: id,
          }));
          setAllModules([{ label: "All", value: "" }, ...modules]);
        } else {
          toast.error(res.message || "Failed to fetch modules", { id: "fetch-modules-error" });
          setAllModules([{ label: "All", value: "" }]);
        }
      } catch (err) {
        console.error("Failed to fetch modules:", err);
        toast.error("Failed to fetch modules", { id: "fetch-modules-error" });
        setAllModules([{ label: "All", value: "" }]);
      }
    };

    fetchModules();
  }, []);

  // -------------------- Fetch Table Data --------------------
  const fetchAccessCodes = useCallback(async (search = "", page = activePage, pageSize = limit, moduleId = selectedModule) => {
    setLoading(true);
    setApiFailed(false);
    try {
      const res = await getMenuAccessCodesList({
        moduleid: moduleId,
        search,
        limit: pageSize,
        page,
      });

      if (res.code === 200) {
        const rows = res.data?.menuaccesscodes?.rows || [];
        const totalRecords = res.data?.menuaccesscodes?.count || 0;
        setRecords(rows);
        setTotal(totalRecords);
      } else {
        toast.error(res.message || "Failed to fetch access codes", { id: "fetch-access-codes-error" });
        setRecords([]);
        setTotal(0);
        setApiFailed(true);
      }
    } catch (err) {
      console.error("Failed to fetch access codes:", err);
      toast.error("Something went wrong while fetching access codes", { id: "fetch-access-codes-error" });
      setRecords([]);
      setTotal(0);
      setApiFailed(true);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [activePage, limit, selectedModule]);

  useEffect(() => {
    fetchAccessCodes(searchText, activePage, limit, selectedModule);
  }, [fetchAccessCodes, searchText, activePage, limit, selectedModule]);

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

  // -------------------- Handle Status Change --------------------
  const handleUpdateMenuStatus = async (id, newStatus, rowIndex, columnId) => {
    if (verifyRole(100007)) {
      toast.error("Not allowed to change status");
      return;
    }
    try {
      setStatusLoading((prev) => ({ ...prev, [id]: true }));
      const res = await updateMenuAccessCodeStatus({ id, status: newStatus ? 1 : 0 });
      if (res?.code === 200) {
        toast.success("Menu status updated");
        setRecords((prev) =>
          prev.map((row, idx) =>
            idx === rowIndex ? { ...row, [columnId]: newStatus ? 1 : 0 } : row
          )
        );
      } else {
        toast.error(res?.message || "Failed to update menu status");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Something went wrong while updating menu status");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // -------------------- Columns --------------------
  const menuColumns = [
    columnHelper.display({
      id: "serial_no",
      header: "Sr.No",
      cell: (info) => (
        <div>
          {info.row.index + 1 + (activePage - 1) * limit}
        </div>
      ),
    }),
    columnHelper.display({
      id: "modulename",
      header: "Module Name",
      accessorKey: "modulename",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(18%_.04_265)] text-xs font-bold text-white">
            {row.original.modulename ? row.original.modulename[0].toUpperCase() : "M"}
          </span>
          <span className="font-bold text-slate-700">{row.original.modulename}</span>
        </div>
      ),
    }),
    {
      id: "access_code",
      header: "Access Code",
      accessorKey: "access_code",
      cell: ({ getValue }) => <span className="text-sm text-gray-600">
        <Badge variant="outlined" color="info" className="rounded-full px-3 py-2">
          {getValue() || "—"}
        </Badge>
      </span>,
    },
    {
      id: "access_name",
      header: "Access Name",
      accessorKey: "access_name",
      cell: ({ getValue }) => <span className="text-sm text-gray-600">{getValue() || "—"}</span>,
    },
    columnHelper.accessor((row) => row.status, {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <StyledSwitch
            checked={row.original.status === 1}
            onChange={(checked) =>
              handleUpdateMenuStatus(row.original.id, checked, row.index, "status")
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
        const editDisabled = verifyRole(100005);
        const deleteDisabled = verifyRole(100006);
        return (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedMenuAccessCode(row.original);
                setIsEditOpen(true);
              }}
              disabled={editDisabled}
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
                  setSelectedMenuAccessCode(row.original);
                  setIsDeleteOpen(true);
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

  // -------------------- TABLE INSTANCE --------------------
  const table = useReactTable({
    data: records,
    columns: menuColumns,
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
        setRecords((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row
          ),
        );
      },

      setTableSettings,
      setViewType,
      onStatusChange: handleUpdateMenuStatus,
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

  // Determine if toolbar should be shown
  const shouldShowToolbar = () => {
    if (apiFailed) return false;
    if (loading && !isSearching) return false;
    if (records.length === 0 && !searchText && !selectedModule) return false;
    return true;
  };

  // Custom Grid View Component
  const MenuGridView = ({ table, rows }) => {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 p-4 bg-gray-50/50 dark:bg-gray-950">
        {rows.map((row) => {
          const menu = row.original;
          return (
            <div
              key={menu.id}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Top Info Section */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 ">
                    <div className="flex items-center gap-2">
                      <Menu className="h-5 w-5 text-gray-500" />
                      <h3 className="font-semibold tracking-tight text-gray-800 dark:text-gray-100 text-base leading-snug">
                        {menu.modulename || "—"}
                      </h3>
                    </div>
                    {/* Access Name - 100% Sharp Visibility with Zero Truncation */}
                    <p className="text-md text-gray-600 font-medium dark:text-gray-300 whitespace-normal break-words leading-relaxed pt-0.5">
                      {menu.access_name}
                    </p>
                  </div>

                  {/* Styled Switch Controller */}
                  <div className="shrink-0 pt-1">
                    <StyledSwitch
                      checked={menu.status === 1}
                      onChange={(checked) =>
                        handleUpdateMenuStatus(menu.id, checked, row.index, "status")
                      }
                      loading={statusLoading[menu.id]}
                    />
                  </div>
                </div>

                {/* Middle Section: Clean Access Code Indicator */}
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">Access Code:</span>
                  <Badge
                    variant="outlined"
                    color="info"
                  >
                    {menu.access_code || "—"}
                  </Badge>
                </div>
              </div>

              {/* Bottom Clean Actions Bar */}
              <div className="mt-5 flex items-center justify-end gap-1.5 border-t border-gray-100 pt-3 dark:border-gray-800/60">
                {/* Edit Button */}
                <button
                  onClick={() => {
                    setSelectedMenuAccessCode(menu);
                    setIsEditOpen(true);
                  }}
                  disabled={verifyRole(100005)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ${verifyRole(100005)
                    ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                    : "cursor-pointer text-blue-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                    }`}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    if (!verifyRole(100006)) {
                      setSelectedMenuAccessCode(menu);
                      setIsDeleteOpen(true);
                    }
                  }}
                  disabled={verifyRole(100006)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ${verifyRole(100006)
                    ? "cursor-not-allowed text-gray-200 dark:text-gray-700"
                    : "cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    }`}
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
    <Page title="Menu Management">
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
                Menus
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Create and manage menu access codes.
              </p>
            </div>

            <Button
              disabled={verifyRole(100004)}
              onClick={() => !verifyRole(100004) && setIsAddOpen(true)}
              className={`flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-semibold text-black shadow-lg transition-all hover:shadow-xl 
${verifyRole(100004) ? "cursor-not-allowed opacity-50" : ""}
${verifyRole(100004)
                  ? "bg-[var(--app-btn-disabled)]"
                  : "bg-[image:var(--app-btn-primary)]"
                }`}
            >
              <MenuIcon className="h-4 w-4" />
              Add Menu
            </Button>

            <div className="absolute bottom-0 left-0 w-full">
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[rgb(54,109,176)] to-transparent" />
            </div>
          </div>

          {/* Toolbar with Module Filter */}
          {shouldShowToolbar() && (
            <CustomToolbar
              table={table}
              onExportExcel={false}
              onSearch={handleSearch}
              searchValue={searchText}
            >
              <Listbox
                data={allModules}
                value={
                  allModules.find((type) => type.value === selectedModule) ||
                  { label: "All", value: "" }
                }
                onChange={(val) => {
                  setSelectedModule(val?.value ?? "");
                  setActivePage(1);
                }}
                placeholder="Select Module Name"
                displayField="label"
              />
            </CustomToolbar>
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
              ) : records.length === 0 ? (
                <PremiumEmptyState
                  icon={ShieldCheckIcon}
                  title={apiFailed ? "Failed to Load Menus" : "No Menus Found"}
                  desc={
                    apiFailed
                      ? "Unable to fetch menus. Please check your connection and try again."
                      : searchText
                        ? `No results found for "${searchText}". Try a different search term.`
                        : selectedModule
                          ? `No menus found for the selected module. Try a different module or add a new menu.`
                          : "It looks like there are no menus defined yet. Start by adding a new menu."
                  }
                />
              ) : viewType === "list" ? (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              ) : (
                <MenuGridView table={table} rows={rows} />
              )}

              {records.length > 0 && (
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

      {/* Modals */}
      <AddMenuModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => fetchAccessCodes(searchText, activePage, limit, selectedModule)}
      />

      <EditMenuModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedMenuAccessCode(null);
        }}
        menuAccessCode={selectedMenuAccessCode}
        onSuccess={() => fetchAccessCodes(searchText, activePage, limit, selectedModule)}
      />

      <DeleteMenuAccessCodeModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedMenuAccessCode(null);
        }}
        menuAccessCode={selectedMenuAccessCode}
        onSuccess={() => fetchAccessCodes(searchText, activePage, limit, selectedModule)}
      />
    </Page>
  );
}