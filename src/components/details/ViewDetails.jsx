// components/shared/ViewDetails.jsx

import { Card } from "components/ui";

export const ViewDetails = ({ title = "Details", fields = [] }) => {
  return (
    <div className="w-full">
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ label, value }, idx) => (
            <div key={idx}>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {label}
              </p>
              <p className="text-base text-gray-800 dark:text-gray-100">
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
