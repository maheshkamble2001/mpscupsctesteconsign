// Import Dependencies
import { useState } from "react";
import { toast } from "sonner";
import PropTypes from "prop-types";

// Local Imports
import { Avatar, Badge } from "components/ui";
import { StyledSwitch } from "components/shared/form/StyledSwitch";

// ----------------------------------------------------------------------

const roleColors = {
  admin: "info",
  superadmin: "error",
  user: "neutral",
  author: "success",
  moderator: "warning",
};

export function AvatarCell({ row,color }) {
  return (
    <Avatar
      size={10}
      name={row.original.name}
      initialColor={color || "#fdaf19"}
      classNames={{
        initial: "text-sm",
      }}
    />

  );
}

export function NameCell({ getValue }) {
  return (
    <div className="font-medium text-gray-800 dark:text-dark-100">
      {getValue()}
    </div>
  );
}

export function RoleCell({ getValue }) {
  const val = getValue();
  return (
    <Badge color={roleColors[val]} variant="outlined" className="capitalize">
      {val}
    </Badge>
  );
}

// components/tables/StatusCell.jsx
export function StatusCell({ getValue, row, column, table, disabled=false}) {
  const val = getValue();
  const [loading, setLoading] = useState(false);

  const onChange = async (checked) => {
    setLoading(true);
    try {
          const id = row.original.id|| row.original.lectureid||row.original.LectureID ||row.original.GalleryId ||row.original.ID||row.original.customerId|| row.original.user_id || row.original.usertypeid || row.original.BannerId  || row.original.PageID || row.original.categoryId;
      const metaKey = column?.columnDef?.meta?.updateFnKey || "updateUserStatus";
      const updateFn = table.options.meta?.[metaKey];

      if (typeof updateFn === "function") {
        await updateFn(id, checked, row.index, column.id);
      } else {
        console.warn(`Update function "${metaKey}" not found in table.meta`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return <StyledSwitch checked={!!val} disabled={disabled} onChange={onChange} loading={loading} />;
}



AvatarCell.propTypes = {
  row: PropTypes.object,
};

NameCell.propTypes = {
  getValue: PropTypes.func,
};

RoleCell.propTypes = {
  getValue: PropTypes.func,
};

StatusCell.propTypes = {
  getValue: PropTypes.func,
  row: PropTypes.object,
  column: PropTypes.object,
  table: PropTypes.object,
};
