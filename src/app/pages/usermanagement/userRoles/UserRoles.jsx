import React, { useEffect, useState, useCallback, useRef } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, getFacetedMinMaxValues, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { toast } from "sonner";
import { PencilIcon, TrashIcon, UserGroupIcon, ArrowUpRightIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import clsx from "clsx";

// API
import { updateUserRoleStatus, getUserRolesList, deleteUserRole } from "api/usermanagement/roles";

// UI Components
import { Page } from "components/shared/Page";
import { IdCell } from "components/tables/advanced-table/HRTable/rows";
import { Skeleton } from "components/ui/Skeleton";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { Button } from "@headlessui/react";
import { Box, Card, Avatar, AvatarDot, Badge } from "components/ui";
import { useLockScrollbar, useDidUpdate, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { CustomToolbar } from "../ManageUsers/CustomToolbar";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { ListView } from "components/tables/users-datatable/ListView";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { GridSkeleton } from "components/shared/GridSkeleton";

// Modals
import { AddUserRole } from "./AddUserRole";
import { EditUserRole } from "./EditUserRole";
import { DeleteUserRoleModal } from "./DeleteUserRoleModal";

// Utils
import { verifyRole } from "utils/utilities";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "—";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    return "—";
  }
};

const UserRoles = () => {
  const columnHelper = createColumnHelper();

  // Brand Colors
  const srRed = "#FE4543";
  const srBlue = "#3368AF";

  const [rolesData, setRolesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [apiFailed, setApiFailed] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Track search state

  // Table settings and view state
  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
    enableSorting: true,
    enableColumnFilters: true,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [viewType, setViewType] = useLocalStorage("user-roles-table-view-type", "list");
  const [columnVisibility, setColumnVisibility] = useLocalStorage("column-visibility-user-roles", {});
  const [columnPinning, setColumnPinning] = useLocalStorage("column-pinning-user-roles", {});
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Modal States
  const [open, setOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // ---------------- FETCH ----------------
  const fetchUserRoles = useCallback(async (search = "", page = activePage, pageSize = limit) => {
    try {
      setLoading(true);
      setApiFailed(false);
      const res = await getUserRolesList({
        search,
        page,
        limit: pageSize,
      });

      if (res.code === 200) {
        const rawData = res.data.usertypes || [];
        const transformed = rawData.map((item) => ({
          usertypeid: item.UserTypeID,
          role: item.UserType,
          status: item.Status === 1 ? 1 : 0,
          addedOn: item.AddedOn || "",
          description: item.Description || "",
        }));

        setRolesData(transformed);
        setTotal(res.data.pagination?.totalRecords || 0);
      } else {
        toast.error(res.message || "Failed to fetch roles" ,{id : "fetch-roles-error"});
        setRolesData([]);
        setTotal(0);
        setApiFailed(true);
      }
    } catch (err) {
      toast.error("Something went wrong",{id : "fetch-roles-error-catchblock"});
      setRolesData([]);
      setTotal(0);
      setApiFailed(true);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [activePage, limit]);

  useEffect(() => {
    fetchUserRoles(searchText, activePage, limit);
  }, [fetchUserRoles, searchText, activePage, limit]);

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
  const handleUpdateUserRoleStatus = async (usertypeid, newStatus) => {
    if (verifyRole(300010)) {
      toast.error("Not allowed to change status");
      return;
    }
    try {
      setStatusLoading((prev) => ({ ...prev, [usertypeid]: true }));
      const res = await updateUserRoleStatus({
        usertypeid,
        status: newStatus ? 1 : 0,
      });

      if (res.code === 200) {
        toast.success("Role status updated");
        setRolesData((prev) =>
          prev.map((item) =>
            item.usertypeid === usertypeid
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
      setStatusLoading((prev) => ({ ...prev, [usertypeid]: false }));
    }
  };

  // ---------------- DELETE ----------------
  const handleDeleteUserRole = async (usertypeid) => {
    if (verifyRole(300009)) {
      toast.error("Not allowed to delete role");
      throw new Error("Not allowed");
    }
    const res = await deleteUserRole({ usertypeid });
    if (res.code === 200) {
      toast.success("Role deleted successfully");
      await fetchUserRoles(searchText, activePage, limit);
      return;
    } else {
      toast.error(res.message || "Failed to delete role");
      throw new Error(res.message || "Delete failed");
    }
  };

  // ---------------- HANDLERS ----------------
  const handleEditUserRoleSuccess = (updatedRole) => {
    setRolesData((prev) =>
      prev.map((role) =>
        role.usertypeid === updatedRole.usertypeid
          ? { ...role, role: updatedRole.usertype, description: updatedRole.description }
          : role
      )
    );
    setIsEditOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteUserRoleSuccess = () => {
    fetchUserRoles(searchText, activePage, limit);
    setIsDeleteOpen(false);
    setSelectedRole(null);
  };

 
  // ---------------- COLUMNS ----------------
  const userColumns = [
    columnHelper.display({
      id: "serial_no",
      header: "Sr.No",
      cell: (info) => (
        <div >
          {info.row.index + 1 + (activePage - 1) * limit}
        </div>
      ),
    }),
    columnHelper.display({
      id: "role",
      header: "User Role",
      accessorKey: "role",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0a3a5] text-xs font-bold text-[#1E1E2D]">
            {row.original.role ? row.original.role[0].toUpperCase() : "R"}
          </span>
          <span className="font-bold text-slate-700">{row.original.role}</span>
        </div>
      ),
    }),
    {
      id: "addedOn",
      header: "Added On",
      accessorKey: "addedOn",
      cell: ({ getValue }) => {
        const dateValue = getValue();
        return <span className="text-sm text-gray-600">{formatDate(dateValue)}</span>;
      }
    },
    columnHelper.accessor((row) => row.status, {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <StyledSwitch
            checked={row.original.status === 1}
            onChange={(checked) =>
              handleUpdateUserRoleStatus(row.original.usertypeid, checked)
            }
            loading={statusLoading[row.original.usertypeid]}
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
        const usertypeid = row.original.usertypeid;
        return (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedRole(row.original);
                setIsEditOpen(true);
              }}
              disabled={editDisabled}
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
                  setSelectedRole(row.original);
                  setIsDeleteOpen(true);
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

  // ---------------- TABLE INSTANCE ----------------
  const table = useReactTable({
    data: rolesData,
    columns: userColumns,
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
        setRolesData((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row,
          ),
        );
      },
      deleteRow: async (row) => {
        await handleDeleteUserRole(row.original.usertypeid);
      },
      setTableSettings,
      setViewType,
      onEditRole: (roleId) => {
        const role = rolesData.find((r) => r.usertypeid === roleId);
        if (role) {
          setSelectedRole(role);
          setIsEditOpen(true);
        }
      },
      onStatusChange: handleUpdateUserRoleStatus,
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
    // If API failed, hide toolbar
    if (apiFailed) return false;
    // If loading and not searching, don't show toolbar
    if (loading && !isSearching) return false;
    // If no data and not searching, hide toolbar
    if (rolesData.length === 0 && !searchText) return false;
    // Show toolbar in all other cases (including search with no results)
    return true;
  };

  // Custom Grid View Component for Roles
  const RoleGridView = ({ table, rows }) => {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
        {rows.map((row) => {
          const role = row.original;
          return (
            <div
              key={role.usertypeid}
              className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-lg font-bold text-blue-700">
                    {role.role ? role.role[0].toUpperCase() : "R"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{role.role}</h3>
                  </div>
                </div>
                <StyledSwitch
                  checked={role.status === 1}
                  onChange={(checked) =>
                    handleUpdateUserRoleStatus(role.usertypeid, checked)
                  }
                  loading={statusLoading[role.usertypeid]}
                />
              </div>
              {role.addedOn && (
                <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                  <span className="font-medium text-gray-600">Added on: </span>
                  {formatDate(role.addedOn)}
                </p>
              )}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => {
                    setSelectedRole(role);
                    setIsEditOpen(true);
                  }}
                  disabled={verifyRole(300008)}
                  className={`rounded-lgtransition-colors ${
                    verifyRole(300008)
                      ? "cursor-not-allowed text-gray-300"
                      : "cursor-pointer text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    if (!verifyRole(300009)) {
                      setSelectedRole(role);
                      setIsDeleteOpen(true);
                    }
                  }}
                  disabled={verifyRole(300009)}
                  className={`rounded-lg transition-colors ${
                    verifyRole(300009)
                      ? "cursor-not-allowed text-gray-200"
                      : "cursor-pointer text-red-500 hover:bg-red-50"
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

  // ---------------- UI ----------------
  return (
    <Page title="User Management">
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
                User Roles
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Manage user roles, assign permissions, and control access levels.
              </p>
            </div>

            <Button
              disabled={verifyRole(300007)}
              onClick={() => !verifyRole(300007) && setOpen(true)}
              className={`flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-semibold text-white shadow-lg transition-all hover:shadow-xl ${
                verifyRole(300007) ? "cursor-not-allowed opacity-50" : ""
              }`}
              style={{
                background: verifyRole(300007)
                  ? "#9CA3AF"
                  : "linear-gradient(135deg, rgb(54, 109, 176), rgb(255, 69, 66))",
              }}
            >
              <UserGroupIcon className="h-4 w-4" />
              Add Role
            </Button>

            <div className="absolute bottom-0 left-0 w-full">
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[rgb(54,109,176)] to-transparent" />
            </div>
          </div>

          {/* Conditionally render CustomToolbar */}
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
              ) : rolesData.length === 0 ? (
                <PremiumEmptyState
                icon={ShieldCheckIcon}
                  title={apiFailed ? "Failed to Load Roles" : "No Roles Found"}
                  desc={
                    apiFailed
                      ? "Unable to fetch user roles. Please check your connection and try again."
                      : searchText
                      ? `No results found for "${searchText}". Try a different search term.`
                      : "It looks like there are no user roles defined yet. Start by adding a new role."
                  }
           
                />
              ) : viewType === "list" ? (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              ) : (
                <RoleGridView table={table} rows={rows} />
              )}

              {rolesData.length > 0 && (
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
      <AddUserRole
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          fetchUserRoles(searchText, activePage, limit);
          setOpen(false);
        }}
      />

      <EditUserRole
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedRole(null);
        }}
        selectedRole={selectedRole}
        onSuccess={handleEditUserRoleSuccess}
      />

      <DeleteUserRoleModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedRole(null);
        }}
        selectedRole={selectedRole}
        onSuccess={handleDeleteUserRoleSuccess}
      />
    </Page>
  );
};

export default UserRoles;