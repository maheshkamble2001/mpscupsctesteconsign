import React, { useEffect, useState, useCallback } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { toast } from "sonner";
import { ShieldCheckIcon, FolderIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

// API
import { getRoleModuleList, getAssignMenuList } from "api/menuaccessmanagement/menus";

// UI Components
import { Page } from "components/shared/Page";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { Button } from "@headlessui/react";
import { Badge, Box, Card } from "components/ui";
import { useLockScrollbar, useLocalStorage } from "hooks";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { ListView } from "components/tables/users-datatable/ListView";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { GridSkeleton } from "components/shared/GridSkeleton";
import { Listbox } from "components/shared/form/Listbox";

// Modular Imported Selection Component
import { SelectionBar } from "./SelectionBar";
import { ConfirmAssignModal } from "./CofirmAssignModal";

// Utils
import { verifyRole } from "utils/utilities";
import Cookies from "js-cookie";
import { BUTTON_CONFIG } from "constants/app2.constant";
import { CustomToolbar } from "components/customs/CustomToolbar";

// ---------- Custom Checkbox Component ----------
const IndeterminateCheckbox = ({ checked, indeterminate, onChange, ...props }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
    
    />
  );
};

export default function AssignMenusUI() {
  const columnHelper = createColumnHelper();

  // ------------------ State -------------------------------
  const [allRoles, setAllRoles] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);   // Persistent CustomToolbar state logic
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
    enableSorting: true,
    enableColumnFilters: true,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [viewType, setViewType] = useLocalStorage("assign-menus-table-view-type", "list");
  const [columnVisibility, setColumnVisibility] = useLocalStorage("column-visibility-assign-menus", {});
  const [columnPinning, setColumnPinning] = useLocalStorage("column-pinning-assign-menus", {});
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const [rowSelection, setRowSelection] = useState({});

  // ------------------ Fetch Roles & Modules ----------------
  const fetchRoleModuleData = async () => {
    try {
      setLoading(true);
      const res = await getRoleModuleList({});
      if (res.code === 200) {
        const { userTypes, menumodules } = res.data;
        const roleid = parseInt(Cookies.get("roleid") || "0", 10);

        let roleOptions = userTypes?.rows?.map((r) => ({ label: r.UserType, value: r.UserTypeID })) || [];
        if (roleid !== 1) roleOptions = roleOptions.filter((r) => r.value !== 1);

        let moduleOptions = menumodules?.rows?.map((m) => ({ label: m.modulename, value: m.id })) || [];
        if (roleid !== 1) moduleOptions = moduleOptions.filter((m) => m.value !== 2);

        setAllRoles(roleOptions);
        setAllModules(moduleOptions);
      } else {
        toast.error(res.message || "Failed to fetch role/module list");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleModuleData();
  }, []);

  // ------------------ Fetch Unassigned Menus ------------------
  const fetchUnassignedMenus = useCallback(async () => {
    if (!selectedRole) return;
    setLoading(true);
    setApiFailed(false);
    try {
      const res = await getAssignMenuList({
        UserTypeID: selectedRole,
        moduleid: selectedModule,
        page: activePage,
        limit: limit,
        search: searchQuery,
      });
      if (res?.code === 200) {
        const transformed = res.data?.unassignedAccessList?.rows.map((item) => ({
          id: item.id,
          access_code: item.access_code,
          access_name: item.access_name,
          modulename: item.modulename,
          moduleid: item.moduleid,
        })) || [];
        setRecords(transformed);
        setTotal(res.data?.unassignedAccessList?.count || 0);
      } else {
        toast.error(res.message || "Failed to fetch records");
        setRecords([]);
        setTotal(0);
        setApiFailed(true);
      }
    } catch (error) {
      toast.error("Error fetching records");
      setRecords([]);
      setTotal(0);
      setApiFailed(true);
    } 
    finally{
      setLoading(false);
      setIsSearching(false);
    }
  }, [selectedRole, selectedModule, activePage, limit, searchQuery]);

  useEffect(() => {
    if (selectedRole && hasSearched) {
      fetchUnassignedMenus();
    }
  }, [selectedRole, selectedModule, activePage, limit, searchQuery, hasSearched, fetchUnassignedMenus]);

  useEffect(() => {
    setRowSelection({});
  }, [records]);

  // ------------------ Handlers ------------------
  const handleSearchClick = () => {
    if (!selectedRole) {
      toast.error("Please select a role first");
      return;
    }
    setHasSearched(true);
    setActivePage(1);
    setIsSearching(true);
    setSearchQuery(searchText);
    setRowSelection({});
  };

  const handleRoleChange = (val) => {
    setSelectedRole(val?.value || "");
    setSelectedModule("");
    setSearchText("");
    setSearchQuery("");
    setActivePage(1);
    setRecords([]);
    setTotal(0);
    setApiFailed(false);
    setHasSearched(false);
    setRowSelection({});
  };

  const handleModuleChange = (val) => {
    setSelectedModule(val?.value || "");
    setActivePage(1);
    setHasSearched(false);
    setRowSelection({});
  };

  const handleSearchInput = (value) => {
    setSearchText(value);
    setSearchQuery(value);
    setActivePage(1);
    setIsSearching(true);
    setHasSearched(true);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setActivePage(1);
  };

  const handlePageChange = (newPage) => setActivePage(newPage);

  // ------------------ Table Columns Setup ------------------
  const columns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <IndeterminateCheckbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    }),
    columnHelper.display({
      id: "serial_no",
      header: "Sr.No",
      cell: (info) => <div>{info.row.index + 1 + (activePage - 1) * limit}</div>,
    }),
    {
      header: "Module Name",
      accessorKey: "modulename",
      cell: ({ getValue }) => <span className="font-medium text-gray-800">{getValue()}</span>,
    },
    { header: "Access Code", accessorKey: "access_code", cell: ({ getValue }) => <span> <Badge variant="outlined" color="info" className="rounded-full px-3 py-2">{getValue() || "—"}</Badge></span> },
    { header: "Access Name", accessorKey: "access_name" },
  ];

  // ---------- React Table Configuration ----------
  const table = useReactTable({
    data: records,
    columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      rowSelection,
      tableSettings,
      viewType,
    },
    meta: { setTableSettings, setViewType },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    autoResetPageIndex,
    manualPagination: true,
    pageCount: Math.ceil(total / limit),
  });

  useLockScrollbar(tableSettings.enableFullScreen);

  const rows = table.getRowModel().rows;
  const selectedCount = Object.keys(rowSelection).length;

  // ---------- Premium Grid View Component ----------
 const MenuGridView = () => (
  <div className="space-y-4 p-5">
    {/* Grid Mode Selection Controller Header Bar */}
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <IndeterminateCheckbox
          id="grid-select-all"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
        <label htmlFor="grid-select-all" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
          Select All Grid Elements ({records.length})
        </label>
      </div>
      <span className="text-[11px] font-medium text-gray-400">Card Layout Action Module</span>
    </div>

    {/* Grid Cards Container */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {rows.map((row) => {
        const menu = row.original;
        const isSelected = row.getIsSelected();
        return (
          <Card
            key={menu.id}
            skin="shadow"
            onClick={() => row.toggleSelected()}
            className={clsx(
              "group relative overflow-hidden transition-all duration-300 cursor-pointer select-none",
              isSelected
                ? "ring-2 ring-indigo-500 ring-offset-2"
                : "hover:-translate-y-1"
            )}
          >
            {/* Gradient top bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3368AF] to-[#FE4543]" />
            
            {/* Content padding */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3368AF]/10 to-[#FE4543]/10 text-gray-700">
                    <FolderIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-1">{menu.modulename}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Module Unit</p>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <IndeterminateCheckbox
                    checked={isSelected}
                    onChange={row.getToggleSelectedHandler()}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Access Code:</span>
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      {menu.access_code}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 block mb-1">Access Name</span>
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100 break-words leading-relaxed">
                    {menu.access_name}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  </div>
);

  // Persistent toolbar logic handler
  const shouldShowToolbar = () => {
    if (!selectedRole || !hasSearched) return false;
    if (apiFailed) return false;
    if (loading && !isSearching) return false;
    if (records.length === 0 && !searchText) return false;
    return true;
  };

  const WrapComponent = viewType === "list" ? Card : Box;

  return (
    <Page title="Menu Management">
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen && "dark:bg-dark-900 fixed inset-0 z-40 bg-white pt-3"
          )}
        >
          {/* Header Section */}
          <div className="relative mb-4 px-5 pt-6 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                  Assign Menus
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                  Assign menu access to user roles from the unassigned list.
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full">
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[rgb(54,109,176)] to-transparent" />
            </div>
          </div>

          {/* Filters Area */}
          <div className="px-5 pb-4 flex flex-wrap items-center gap-4">
            <div className="w-64">
              <Listbox
                data={allRoles}
                value={allRoles.find((role) => role.value === selectedRole) || null}
                onChange={handleRoleChange}
                placeholder="Select Role"
                displayField="label"
              />
            </div>
            <div className="w-64">
              <Listbox
                data={allModules}
                value={allModules.find((mod) => mod.value === selectedModule) || null}
                onChange={handleModuleChange}
                placeholder="Select Module (Optional)"
                displayField="label"
              />
            </div>
            <Button
              onClick={handleSearchClick}
              disabled={!selectedRole}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-black shadow-md transition-all hover:scale-[1.02] ${
                !selectedRole ? "opacity-50 cursor-not-allowed bg-gray-400" : "bg-gradient-to-r from-[#3368AF] to-[#FE4543]"
              }`}
              style={{ background: !selectedRole ? "var(--app-btn-disabled)" : "var(--app-btn-primary)" }}
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Search
            </Button>
          </div>

          {/* Standard Data Grid Tool Bar */}
          {shouldShowToolbar() && (
            <CustomToolbar
              table={table}
              onExportExcel={false}
              onSearch={handleSearchInput}
              searchValue={searchText}
              className="px-5"
            />
          )}

          {/* Content Pipeline Area */}
          <div
            className={clsx(
              "transition-content flex grow flex-col pt-3 pb-8",
              tableSettings.enableFullScreen ? "overflow-hidden" : "px-5"
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
              ) : !selectedRole ? (
                <PremiumEmptyState
                  icon={ShieldCheckIcon}
                  title="Select a Role"
                  desc="Please select a user role from the dropdown and click Search to view unassigned menus."
                />
              ) : !hasSearched ? (
                <PremiumEmptyState
                  icon={ShieldCheckIcon}
                  title="Click Search"
                  desc="Click the Search button to fetch unassigned menus for the selected role."
                />
              ) : records.length === 0 ? (
                <PremiumEmptyState
                  icon={ShieldCheckIcon}
                  title={apiFailed ? "Failed to Load Data" : "No Unassigned Menus"}
                  desc={
                    apiFailed
                      ? "Unable to fetch menus. Please try again."
                      : searchText
                      ? `No results found for "${searchText}". Try a different search term.`
                      : "All menus are already assigned to this role."
                  }
                />
              ) : viewType === "list" ? (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              ) : (
                <MenuGridView />
              )}

              {/* Pagination Interface Footer */}
              {records.length > 0 && (
                <div
                  className={clsx(
                    "pb-4 sm:pt-4",
                    (viewType === "list" || tableSettings.enableFullScreen) && "px-4 sm:px-5",
                    tableSettings.enableFullScreen && "dark:bg-dark-800 bg-gray-50",
                    viewType === "grid" && !tableSettings.enableFullScreen && "mt-3 px-5"
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

      {/* Floating Selection Bar Module */}
      <SelectionBar
        table={table}
        selectedCount={selectedCount}
        totalRows={total}
        onAssign={() => setAssignModalOpen(true)}
        onCancel={() => table.resetRowSelection()}
      />

      {/* Confirm Action Trigger Modal */}
      <ConfirmAssignModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          table.resetRowSelection();
        }}
        data={{
          id: selectedRole,
          data: { table, selectedRows: table.getSelectedRowModel().rows.map(row => row.original) },
        }}
        onSuccess={() => {
          fetchUnassignedMenus();
          setAssignModalOpen(false);
          table.resetRowSelection();
          toast.success("Menus assigned successfully!");
        }}
      />
    </Page>
  );
}