import PropTypes from "prop-types";
 
// Local Imports
import {
  Pagination,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
  Select,
} from "components/ui";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
 
 
// ----------------------------------------------------------------------
 
export function PaginationSection({
  table,
  totalCount,
  limit,
  activePage,
  setLimit,
  setActivePage,
}) {
  const paginationState = table.getState().pagination;
  const { isXl, is2xl } = useBreakpointsContext();
  // console.log(table.getState())
  // useEffect(()=>{
  //   table.setPageSize(limit);
  //   table.setPageIndex(activePage - 1)
  // },[limit,activePage])

  const totalPages = limit > 0 ? Math.ceil(totalCount / limit) : 0;
 
  return (
    <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
      <div className="text-xs-plus flex items-center space-x-2">
        <span>Show</span>
        <Select
          data={[ 10, 20, 30, 40, 50, 100]}
          // value={paginationState.pageSize}
          value={limit}
          onChange={(e) => {
            setActivePage(1);
            setLimit(Number(e.target.value));
            // table.setPageSize(Number(e.target.value));
          }}
          classNames={{
            root: "w-fit",
            select: "h-7 rounded-full py-1 text-xs ltr:pr-7! rtl:pl-7!",
          }}
        />
        <span>entries</span>
      </div>
      <div>
        {
          (totalCount > limit && (
            <Pagination
              // total={table.getPageCount()}
              total={(totalCount % limit>0)? ((totalCount/limit)+1) : (totalCount/limit)}
              // value={paginationState.pageIndex + 1}
              // onChange={(page) => table.setPageIndex(page - 1)}
              value={activePage}
              onChange={(page) => setActivePage(page)}
              siblings={isXl ? 2 : is2xl ? 3 : 1}
              boundaries={isXl ? 2 : 1}
            >
              {/* First Page Button */}
              <button
                type="button"
                className="px-2 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={() => setActivePage(1)}
                disabled={activePage === 1}
              >
                &laquo;
              </button>

              <PaginationPrevious />
              <PaginationItems />
              <PaginationNext />

              {/* Last Page Button */}
              <button
                type="button "
                className="px-2 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={() => setActivePage(totalPages)}
                disabled={activePage === totalPages}
              >
                &raquo;
              </button>
            </Pagination>
          ))
        }
      </div>
      <div className="text-xs-plus truncate">
        {/* {paginationState.pageIndex * paginationState.pageSize + 1} -{" "}
        {table.getRowModel().rows.length} of{" "}
        {table.getCoreRowModel().rows.length} entries */}
        {(() => {
          const page = Number(activePage) || 1;
          const size = Number(limit) || 0;
          const total = Number(totalCount) || 0;
 
          if (total === 0 || size === 0) return "0 entries";
 
          const start = (page - 1) * size + 1;
          const end = Math.min(page * size, total);
 
          return `${start} - ${end} of ${total} entries`;
        })()}
      </div>
    </div>
  );
}
 
PaginationSection.propTypes = {
  table: PropTypes.object,
};
