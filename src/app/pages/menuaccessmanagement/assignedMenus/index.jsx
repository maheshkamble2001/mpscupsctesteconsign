import React, { useEffect, useState, useCallback } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, getFacetedMinMaxValues, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { toast } from "sonner";
import { TrashIcon, ShieldCheckIcon, FolderIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

// API
import { getAssignedMenuList, getUserRoleDropdown } from "api/menuaccessmanagement/menus";

// UI Components
import { Page } from "components/shared/Page";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { Button } from "@headlessui/react";
import { Badge, Box, Card } from "components/ui";
import { useLockScrollbar, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { CustomToolbar } from "app/pages/usermanagement/ManageUsers/CustomToolbar";
import { ListView } from "components/tables/users-datatable/ListView";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { GridSkeleton } from "components/shared/GridSkeleton";
import { Listbox } from "components/shared/form/Listbox";

// Modals
import { DeleteMenuModal } from "./DeleteMenuModal";

// Utils
import { verifyRole } from "utils/utilities";

const AssignedMenus = () => {
  const columnHelper = createColumnHelper();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");        
  const [searchQuery, setSearchQuery] = useState("");      
  const [apiFailed, setApiFailed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);   
  const [hasSearched, setHasSearched] = useState(false);  

  // Role dropdown
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Table settings and view state
  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
    enableSorting: true,
    enableColumnFilters: true,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [viewType, setViewType] = useLocalStorage("assigned-menus-table-view-type", "list");
  const [columnVisibility, setColumnVisibility] = useLocalStorage("column-visibility-assigned-menus", {});
  const [columnPinning, setColumnPinning] = useLocalStorage("column-pinning-assigned-menus", {});
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // ---------------------- Fetch Roles ----------------------
  const fetchRoles = useCallback(async () => {
    try {
      const res = await getUserRoleDropdown();
      if (res.code === 200) {
        const { rows } = res.data.userTypes;
        setAllRoles(rows.map(({ UserTypeID, UserType }) => ({ label: UserType, value: UserTypeID })));
      } else {
        toast.error(res.message || "Failed to load roles");
      }
    } catch (err) {
      toast.error("Something went wrong while loading roles");
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ---------------------- Fetch Assigned Menus ----------------------
  const fetchAssignedMenus = useCallback(async (page = activePage, pageSize = limit, role = selectedRole, query = searchQuery) => {
    if (!role) {
      return;
    }

    setLoading(true);
    setApiFailed(false);
    try {
      const res = await getAssignedMenuList({
        page,
        limit: pageSize,
        search: query,
        UserTypeID: role,
      });

      if (res.code === 200) {
        const { count, rows } = res.data.roleAccessList;
        const transformed = rows.map((item) => ({
          id: item.id,
          access_code: item.access_code,
          access_name: item.access_name,
          addedon: item.addedon,
          moduleid: item.moduleid,
          modulename: item.modulename,
          status: item.status === 1,
        }));
        setRecords(transformed);
        setTotal(count || 0);
      } else {
        toast.error(res.message || "Failed to fetch assigned menus");
        setRecords([]);
        setTotal(0);
        setApiFailed(true);
      }
    } catch (err) {
      toast.error("Something went wrong");
      setRecords([]);
      setTotal(0);
      setApiFailed(true);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [activePage, limit, selectedRole, searchQuery]);

  // Handler: Search button click (Triggers API call)
  const handleSearchClick = () => {
    if (!selectedRole) {
      toast.error("Please select a role first");
      return;
    }
    setHasSearched(true);
    setActivePage(1);
    setIsSearching(true);
    setSearchQuery(searchText);
  };

  // Handler: Role change – strictly resets state, NO API call
  const handleRoleChange = (val) => {
    setSelectedRole(val?.value || "");
    setSearchText("");
    setSearchQuery("");
    setActivePage(1);
    setRecords([]);
    setTotal(0);
    setApiFailed(false);
    setHasSearched(false);
  };

  // Handler: Search input change from CustomToolbar
  const handleSearch = (searchValue) => {
    setSearchText(searchValue);
    setSearchQuery(searchValue);
    setActivePage(1);
    setIsSearching(true);
  };

  // Handler: Limit change
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setActivePage(1);
  };

  // Handler: Page change
  const handlePageChange = (newPage) => {
    setActivePage(newPage);
  };

  // Trigger fetch ONLY if hasSearched is true (ensures search button or toolbar action happened)
  useEffect(() => {
    if (selectedRole && hasSearched) {
      fetchAssignedMenus(activePage, limit, selectedRole, searchQuery);
    }
  }, [activePage, limit, selectedRole, searchQuery, hasSearched, fetchAssignedMenus]);

  const columns = [
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
    { header: "Access Code", accessorKey: "access_code",cell: ({ getValue }) => <span> <Badge variant="outlined" color="info" className="rounded-full px-3 py-2">{getValue() || "—"}</Badge></span> },
    { header: "Access Name", accessorKey: "access_name" },
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const canDelete = verifyRole(100008);
        return (
          <button
            onClick={() => {
              if (!canDelete) {
                setSelectedItem(row.original);
                setDeleteModalOpen(true);
              }
            }}
            disabled={canDelete}
            className={`rounded-lg transition-colors ${
              canDelete ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-red-500 hover:bg-red-50"
            }`}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        );
      },
    }),
  ];

  // ---------------------- Table Instance ----------------------
  const table = useReactTable({
    data: records,
    columns,
    initialState: { pagination: { pageSize: limit } },
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
      viewType,
    },
    meta: { setTableSettings, setViewType },
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

  // ---------------------- Custom Grid View ----------------------
 const MenuGridView = ({ rows }) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 p-5">
      {rows.map((row) => {
        const menu = row.original;
        return (
          <div
            key={menu.id}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            {/* Gradient top bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3368AF] to-[#FE4543]" />
            
            {/* Content padding */}
            <div className="p-5">
              {/* Header with icon and title */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3368AF]/10 to-[#FE4543]/10 text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 truncate" title={menu.modulename}>
                      {menu.modulename}
                    </h3>
             
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Access Information</p>
                </div>
              </div>

              {/* Access Code as Badge */}
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Access Code:</span>
                    <Badge color="info" variant="outlined" className="text-xs font-medium p-2" >
                      {menu.access_code}
                    </Badge>
                </div>
              </div>

              {/* Access Name with full visibility */}
              <div className="mt-3">
                <span className="text-xs font-medium text-gray-500 block mb-1">Access Name</span>
                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100 break-words leading-relaxed">
                  {menu.access_name}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => {
                    if (!verifyRole(100008)) {
                      setSelectedItem(menu);
                      setDeleteModalOpen(true);
                    }
                  }}
                  disabled={verifyRole(100008)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    verifyRole(100008)
                      ? "cursor-not-allowed text-gray-300 bg-gray-50"
                      : "cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Determine if toolbar should be shown (Keeps open during search/no data)
  const shouldShowToolbar = () => {
    if (!selectedRole || !hasSearched) return false;
    if (apiFailed) return false;
    if (loading && !isSearching) return false;
    if (records.length === 0 && !searchText) return false;
    return true;
  };

  return (
    <Page title="Menu Management">
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen && "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3"
          )}
        >
          {/* Header Section */}
          <div className="relative mb-4 px-(--margin-x) pt-6 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                  Assigned Menus
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                  View and manage menu access assigned to user roles.
                </p>
              </div>
            </div>

            {/* Gradient Divider Line */}
            <div className="absolute bottom-0 left-0 w-full">
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[rgb(54,109,176)] to-transparent" />
            </div>
          </div>

          {/* Role Dropdown + Search Button Section */}
          <div className="px-(--margin-x) pb-4 flex flex-wrap items-center gap-4">
            <div className="w-64">
              <Listbox
                data={allRoles}
                value={allRoles.find((role) => role.value === selectedRole) || null}
                onChange={handleRoleChange}
                placeholder="Select Role"
                displayField="label"
              />
            </div>
            <Button
              onClick={handleSearchClick}
              disabled={!selectedRole}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-xl ${
                !selectedRole ? "opacity-50 cursor-not-allowed bg-gray-400" : "bg-gradient-to-r from-[#3368AF] to-[#FE4543]"
              }`}
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Search
            </Button>
          </div>

          {/* Custom Toolbar */}
          {shouldShowToolbar() && (
            <CustomToolbar
              table={table}
              onExportExcel={false}
              onSearch={handleSearch}
              searchValue={searchText}
            />
          )}

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
              ) : !selectedRole ? (
                <PremiumEmptyState
                  icon={ShieldCheckIcon}
                  title="Select a Role"
                  desc="Please select a user role from the dropdown and click Search to view assigned menus."
                />
              ) : !hasSearched ? (
                <PremiumEmptyState
                  icon={ShieldCheckIcon}
                  title="Click Search"
                  desc="Click the Search button to fetch and view assigned menus for the selected role."
                />
              ) : records.length === 0 ? (
                <PremiumEmptyState
                  icon={ShieldCheckIcon}
                  title={apiFailed ? "Failed to Load Data" : "No Menus Found"}
                  desc={
                    apiFailed
                      ? "Unable to fetch assigned menus. Please try again."
                      : searchText
                      ? `No results found for "${searchText}". Try a different search term.`
                      : "No menu access assigned to this role yet."
                  }
                />
              ) : viewType === "list" ? (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              ) : (
                <MenuGridView rows={rows} />
              )}

              {records.length > 0 && (
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

      {/* Delete Modal */}
      <DeleteMenuModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        data={{
          UserTypeID: selectedRole,
          access_code: selectedItem?.access_code,
        }}
        onSuccess={() => {
          fetchAssignedMenus(activePage, limit, selectedRole, searchQuery);
          setDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        title="Remove Menu Access"
      />
    </Page>
  );
};

export default AssignedMenus;