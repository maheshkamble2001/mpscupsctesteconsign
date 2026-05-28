import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { Fragment, useEffect, useRef, useState } from "react";

// UI Components
import { Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";

// Custom Components
import { CollapsibleSearch } from "components/shared/CollapsibleSearch";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { FrontendSearch } from "components/shared/table/FrontendSearch";
// Utils and Hooks
import { useBoxSize, useDidUpdate } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";

const isSafari = getUserAgentBrowser() === "Safari";

export function UsersTable({
  data = [],
  columns = [],
  meta = {},
  totalCount = 0,
  limit = 10,
  activePage = 1,
  setActivePage,
  setLimit,
  getRowCanExpand = () => false,
  setTableData,
  rowSelectionContent = <></>,
  renderSubComponent = null,
  toolbarRightContent = null,
  subComponentBg = "bg-gray-50",
  RowBg = "bg-gray-50",
  tablefromTask,
  onSearchAPI,
  loading = false,
  searchable = true,
  pagination = true,
}) {
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const theadRef = useRef();
  const { height: theadHeight } = useBoxSize({ ref: theadRef });

  const [users, setUsers] = useState(data);

  // Update table data when parent data changes
  useDidUpdate(() => {
    setUsers(data);
  }, [data]);

  // Initialize react-table without sorting
  const table = useReactTable({
    data: users,
    columns,
    state: {
      pagination: {
        pageIndex: activePage - 1,
        pageSize: limit,
      },
    },
    meta,
    filterFns: { fuzzy: fuzzyFilter },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
    autoResetPageIndex,
  });

  useEffect(() => {
    if (setTableData) {
      setTableData({
        table,
        height: theadHeight,
      });
    }
  }, [table.getSelectedRowModel().rows]);

  return (
    <div>
      {/* Toolbar - FIXED: Added relative and z-index to ensure search is visible */}
      <div className="table-toolbar relative z-30 flex w-full flex-wrap items-center justify-start gap-3 sm:flex-nowrap">
        {searchable && (
          /* FIXED: Removed max-width constraints that were blocking expansion */
          <div className="flex shrink-0 items-center justify-start min-h-[48px]">
            {onSearchAPI ? (
              <CollapsibleSearch
                placeholder="Search here..."
                onSearch={(text) => onSearchAPI(text)}
              />
            ) : (
              <FrontendSearch
                placeholder="Search here..."
                onLocalSearch={(query) => {
                  if (!query) setUsers(data);
                  else {
                    const filtered = data.filter((u) =>
                      Object.values(u).some((val) =>
                        String(val).toLowerCase().includes(query.toLowerCase()),
                      ),
                    );
                    setUsers(filtered);
                  }
                }}
              />
            )}
          </div>
        )}
        {toolbarRightContent && (
          <div className="flex flex-1 items-center justify-start">
            <div className="min-w-[140px]">{toolbarRightContent}</div>
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="relative z-10 mt-3">
        <div className="table-wrapper min-w-full overflow-x-auto">
          <Table hoverable className="w-full text-left rtl:text-right">
            <THead ref={theadRef}>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      className="dark:bg-dark-800 dark:text-dark-100 bg-[#3567AF] font-medium text-white uppercase first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </THead>

            <TBody>
              {loading ? (
                <Tr>
                  <Td colSpan={columns.length} className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      {/* Modern 3-Dot Loader using only Tailwind */}
                      <div className="flex space-x-2">
                        <div className="h-3 w-3 animate-bounce rounded-full bg-[#3368AF] [animation-duration:0.8s]"></div>
                        <div className="h-3 w-3 animate-bounce rounded-full bg-[#FE4543] [animation-delay:0.2s] [animation-duration:0.8s]"></div>
                        <div className="h-3 w-3 animate-bounce rounded-full bg-[#3368AF] [animation-delay:0.4s] [animation-duration:0.8s]"></div>
                      </div>
                      <div className="mt-4 flex flex-col items-center">
                        <span className="text-[10px] font-black tracking-[0.4em] text-slate-300 uppercase">
                          Loading
                        </span>
                        {/* Minimal Underline */}
                        <div className="mt-1 h-[2px] w-4 rounded-full bg-slate-100"></div>
                      </div>
                    </div>
                  </Td>
                </Tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <Tr>
                  <Td colSpan={columns.length} className="py-10">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="h-[1px] w-6 bg-slate-100"></div>
                      <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                        No Records Found
                      </span>
                      <div className="h-[1px] w-6 bg-slate-100"></div>
                    </div>
                  </Td>
                </Tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <Tr
                      className={
                        tablefromTask === "Yes"
                          ? `${typeof RowBg === "function" ? RowBg(row) : RowBg} mt-1 rounded-md border p-4`
                          : clsx(
                              "dark:border-b-dark-500 relative border-y border-transparent border-b-gray-200",
                              row.getIsSelected() &&
                                !isSafari &&
                                "row-selected after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500 after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent",
                            )
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </Td>
                      ))}
                    </Tr>

                    {row.getIsExpanded() && renderSubComponent && (
                      <Tr>
                        <Td colSpan={row.getVisibleCells().length}>
                          <div
                            className={`${subComponentBg} mt-1 rounded-md border p-4`}
                          >
                            {renderSubComponent({ row })}
                          </div>
                        </Td>
                      </Tr>
                    )}
                  </Fragment>
                ))
              )}
            </TBody>
          </Table>
        </div>

        {pagination && table.getRowModel().rows.length > 0 && (
          <div className="p-4 sm:px-5">
            <PaginationSection
              totalCount={totalCount}
              activePage={activePage}
              limit={limit}
              setActivePage={setActivePage}
              setLimit={(newLimit) => {
                setLimit(newLimit);
                setActivePage(1);
              }}
              table={table}
            />
          </div>
        )}

        {rowSelectionContent}
      </Card>
    </div>
  );
}