import React from "react";
import { Skeleton } from "components/ui/Skeleton";
import clsx from "clsx";

export const TableSkeleton = ({ limit = 10, columns = 6 }) => {
  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-gray-100 bg-white">
      <div className="flex items-center gap-6 border-b border-gray-50 bg-gray-50/50 px-6 py-4">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i === 1 ? "w-44" : "w-20"}`} />
        ))}
      </div>
      {[...Array(limit)].map((_, i) => (
        <div key={i} className="flex items-center gap-6 border-b border-gray-50 px-6 py-5">
          <Skeleton className="h-4 w-8" />
          <div className="flex w-[220px] flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex w-[220px] items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex w-[160px] gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="ml-auto h-6 w-16 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};