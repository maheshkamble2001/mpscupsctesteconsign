// src/components/layout/sidebar/CollapsibleItem.jsx
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { MenuItem } from "./MenuItem";

export function CollapsibleItem({ data }) {
  const { childs, transKey, title: fallbackTitle } = data;
  const { t } = useTranslation();
  const title = t(transKey) || fallbackTitle;

  return (
    <div className="flex flex-col w-full mb-3">
      {/* 🏷️ MINIMALIST EDITORIAL GROUP LABEL */}
      <div className="px-3 pt-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase truncate">
        {title}
      </div>

      {/* 🌿 NESTED ITEMS GRID CONTAINER */}
      <div className="flex flex-col gap-0.5 mt-0.5">
        {childs?.map((item) => (
          <MenuItem key={item.path || item.id} data={item} />
        ))}
      </div>
    </div>
  );
}

CollapsibleItem.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    transKey: PropTypes.string,
    childs: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};