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
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import clsx from "clsx";

import {
  deleteUser,
  getUsersList,
  updateUserStatus,
} from "api/usermanagement/user";

// UI & Components
import { Page } from "components/shared/Page";
import PremiumEmptyState from "components/EmptyState/EmptyState";
import { useNavigate } from "react-router-dom";
import { Button } from "@headlessui/react";
import { Box, Card, Avatar, AvatarDot, Badge } from "components/ui";
import { useLockScrollbar, useDidUpdate, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { UserDrawer } from "./UserDrawer";
import { ModalBox } from "./ModalBox";
import { verifyRole } from "utils/utilities";
import { TableSkeleton } from "components/shared/TableSkeleton";
import { GridSkeleton } from "components/shared/GridSkeleton";
import { ListView } from "components/tables/users-datatable/ListView";
import { UserGridView } from "./userGridview";
import { CustomToolbar } from "components/customs/CustomToolbar";

const ManageUsers = () => {
  const navigate = useNavigate();
  const columnHelper = createColumnHelper();

  const srBlue = "#3368AF";

  const [userslist, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [apiFailed, setApiFailed] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Track search state

  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
    enableSorting: true,
    enableColumnFilters: true,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [viewType, setViewType] = useLocalStorage(
    "users-table-view-type",
    "list",
  );
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-users",
    {},
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-users",
    {},
  );
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const [deleteModal, setDeleteModal] = useState(false);
  const [seletedId, setSelectedId] = useState("");
  const [statusLoading, setStatusLoading] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  const safeInitial = (name) => (name ? name[0].toUpperCase() : "");

  const fetchUsers = useCallback(
    async (search = "", page = activePage, pageSize = limit) => {
      try {
        setLoading(true);
        setApiFailed(false);
        const res = await getUsersList({ search, limit: pageSize, page });

        if (res.code === 200) {
          const rawUsers = res.data?.users || [];
          const totalCount = res.data?.total || 0;
          const transformed = rawUsers.map((user) => ({
            user_id: user.UserID,
            name: `${user.FirstName || ""} ${user.LastName || ""}`.trim(),
            initials:
              `${safeInitial(user.FirstName)}${safeInitial(user.LastName)}` ||
              "U",
            email: user.EmailID || user.Email,
            mobile: user.Mobile || "-",
            status: user.Status ? 1 : 0,
            addedOn: user.AddedOn || "",
            role: user.Role || "N/A",
            State: user.StateName || user.State?.StateName || "-",
            FirstName: user.FirstName || "",
            LastName: user.LastName || "",
            EmailID: user.EmailID || user.Email,
            City: user.City || "-",
            Address: user.Address || "-",
            StateName: user.StateName || user.State?.StateName || "-",
          }));
          setTotal(totalCount);
          setUserList(transformed);
        } else {
          setUserList([]);
          toast.error(res.message || "Failed to fetch users", { id: "fetch-users-error" });
          setApiFailed(true);
        }
      } catch (err) {
        console.error("Fetch users error:", err);
        setUserList([]);
        toast.error("Something went wrong while fetching users", { id: "fetch-users-error-catchblock" });
        setApiFailed(true);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [activePage, limit],
  );

  useEffect(() => {
    fetchUsers(searchText, activePage, limit);
  }, [fetchUsers, searchText, activePage, limit]);

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

  const handleUpdateUserStatus = async (userId, newStatus) => {
    if (verifyRole(300006)) {
      toast.error("Not allowed to change status");
      return;
    }
    try {
      setStatusLoading((prev) => ({ ...prev, [userId]: true }));
      const res = await updateUserStatus({
        userid: userId,
        newStatus: newStatus ? 1 : 0,
      });
      if (res.code === 200) {
        toast.success("Status updated successfully");
        setUserList((prev) =>
          prev.map((user) =>
            user.user_id === userId
              ? { ...user, status: newStatus ? 1 : 0 }
              : user,
          ),
        );
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch {
      toast.error("Something went wrong while updating status");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUserApi = async (userId) => {
    if (verifyRole(300005)) {
      toast.error("Not allowed to delete user");
      throw new Error("Not allowed");
    }
    const res = await deleteUser({ userid: userId });
    if (res.code === 200) {
      toast.success("User deleted successfully");
      await fetchUsers(searchText, activePage, limit);
      return;
    } else {
      toast.error(res.message || "Failed to delete user");
      throw new Error(res.message || "Delete failed");
    }
  };

  const handleViewUser = (userId) => {
    const user = userslist.find((u) => u.user_id === userId);
    if (user) {
      setSelectedUser(user);
      setIsDrawerOpen(true);
    }
  };

  const handleEditUser = (userId) => {
    navigate(`/usermanagement/update/${userId}`);
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      const res = await getUsersList({
        page: 1,
        limit: total || 1000,
        search: searchText,
      });
      if (!res?.data?.users || res.data.users.length === 0) {
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
      const excelData = res.data.users.map((u, idx) => ({
        "SR No": idx + 1,
        Name: `${u.FirstName || ""} ${u.LastName || ""}`.trim(),
        Email: u.EmailID || u.Email,
        Role: u.Role || "N/A",
        Status: u.Status ? "Active" : "Inactive",
        "Added On": formatDate(u.AddedOn),
        State: u.StateName || "-",
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      XLSX.writeFile(workbook, "Users_List.xlsx");
      toast.success("Users exported successfully");
    } catch {
      toast.error("Failed to export users");
    } finally {
      setLoading(false);
    }
  };

  // Determine if toolbar should be shown
  const shouldShowToolbar = () => {
    // If API failed, hide toolbar
    if (apiFailed) return false;
    // If loading and not searching, don't show toolbar
    if (loading && !isSearching) return false;
    // If no data and not searching, hide toolbar
    if (userslist.length === 0 && !searchText) return false;
    // Show toolbar in all other cases (including search with no results)
    return true;
  };

  // Table columns for list view
  const userColumns = [
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
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(18%_.04_265)] text-xs font-bold text-white">
            {row.original.initials}
          </span>
          <span className="font-bold text-slate-700">{row.original.name}</span>
        </div>
      ),
    }),
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    { header: "Mobile", accessorKey: "mobile" },
    { header: "State", accessorKey: "State" },
    columnHelper.accessor((row) => row.status, {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <StyledSwitch
            checked={row.original.status === 1}
            onChange={(checked) =>
              handleUpdateUserStatus(row.original.user_id, checked)
            }
            loading={statusLoading[row.original.user_id]}
          />
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const editDisabled = verifyRole(300004);
        const deleteDisabled = verifyRole(300005);
        const userId = row.original.user_id;
        return (
          <div className="flex gap-3">
            <button
              onClick={() => handleViewUser(userId)}
              className="btn-base btn bg-gray-150 dark:bg-surface-2 dark:text-dark-50 dark:hover:bg-surface-1 size-8 shrink-0 rounded-full p-0 text-gray-900 hover:bg-gray-200"
            >
              <ArrowUpRightIcon className="h-4 w-4" />
            </button>
            <button
              disabled={editDisabled}
              onClick={() => !editDisabled && handleEditUser(userId)}
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
                  setSelectedId(userId);
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

  // Table definition
  const table = useReactTable({
    data: userslist,
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
        setUserList((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row,
          ),
        );
      },
      deleteRow: async (row) => {
        await handleDeleteUserApi(row.original.user_id);
      },
      setTableSettings,
      setViewType,
      onViewUser: handleViewUser,
      onEditUser: handleEditUser,
      onStatusChange: handleUpdateUserStatus,
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

        // Clean up cooking state safely
        import("js-cookie").then((Cookies) => {
          Cookies.default.set("isFullScreenEnabled", "false");
          window.dispatchEvent(new Event("fullscreenchange-state"));
        });

        return { ...prev, enableFullScreen: false };
      });
    };

    // 1. Handle Keydown 'Escape'
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleExitFullScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // 2. Handle Navigation / Unmounting clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      handleExitFullScreen(); // Reset if user clicks a sidebar link or changes page
    };
  }, [location.pathname]);

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
                Manage Users
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Update profile details, assign roles, or remove members.
              </p>
            </div>

            <Button
              disabled={verifyRole(300003)}
              onClick={() => navigate("/usermanagement/add-user")}
              className={`flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-semibold text-black shadow-lg transition-all hover:shadow-xl ${verifyRole(300003) ? "cursor-not-allowed opacity-50" : ""
                }`}
              style={{
                background: verifyRole(300003)
                  ? "#9CA3AF"
                  : "var(--app-btn-primary)",
              }}
            >
              <UserPlusIcon className="h-4 w-4" />
              Add User
            </Button>

            <div className="absolute bottom-0 left-0 w-full">
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[rgb(54,109,176)] to-transparent" />
            </div>
          </div>

          {/* Conditionally render CustomToolbar - it will stay visible during search */}
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
              ) : userslist.length === 0 ? (
                <PremiumEmptyState
                  title={apiFailed ? "Failed to Load Users" : "No Users Found"}
                  desc={
                    apiFailed
                      ? "Unable to fetch users. Please check your connection and try again."
                      : searchText
                        ? `No results found for "${searchText}". Try a different search term.`
                        : "It looks like there are no users registered yet. Start by adding a new user."
                  }
                  onAction={!apiFailed ? () => navigate("/usermanagement/add-user") : undefined}
                  actionText={!apiFailed && !searchText ? "Add User" : undefined}
                />
              ) : viewType === "list" ? (
                <ListView table={table} rows={rows} flexRender={flexRender} />
              ) : (
                <UserGridView table={table} rows={rows} />
              )}

              {userslist.length > 0 && (
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

      <ModalBox
        show={deleteModal}
        onClose={() => setDeleteModal(false)}
        data={seletedId}
        list={() => fetchUsers(searchText, activePage, limit)}
      />

      <UserDrawer
        isOpen={isDrawerOpen}
        close={() => setIsDrawerOpen(false)}
        user={selectedUser}
      />
    </Page>
  );
};

export default ManageUsers;