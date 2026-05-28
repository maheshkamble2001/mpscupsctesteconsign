// Import Dependencies
import PropTypes from "prop-types";
import clsx from "clsx";
import { useRouteLoaderData } from "react-router";

// Local Imports
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { Badge } from "components/ui";
import { createScopedKeydownHandler } from "utils/dom/createScopedKeydownHandler";

// ----------------------------------------------------------------------

export function Item({
  id,
  title,
  isActive,
  Icon,
  component,
  onKeyDown,
  ...rest
}) {
  const Element = component || "button";
  const { lgAndUp } = useBreakpointsContext();
  const info = useRouteLoaderData("root")?.[id]?.info;

  return (
    <Element
      data-root-menu-item
      {...{
        "data-tooltip": lgAndUp ? true : undefined,
        "data-tooltip-content": title,
        "data-tooltip-place": "right",
      }}
      className={clsx(
        "relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg outline-hidden transition-colors duration-200",
        isActive
          ? " text-[#2A5589]"
          : "text-gray-500 hover:text-[#2A5589] ",
      )}
      onKeyDown={createScopedKeydownHandler({
        siblingSelector: "[data-root-menu-item]",
        parentSelector: "[data-root-menu]",
        activateOnFocus: false,
        loop: true,
        orientation: "vertical",
        onKeyDown,
      })}
      {...rest}
    >
      {Icon && (
        <Icon className="size-7 transition-colors duration-300" />
      )}

      {info && info.val && (
        <Badge
          color={info.color}
          className="absolute top-0 right-0 -m-1 h-4 min-w-[1rem] rounded-full px-1 py-0 ring-1 ring-white"
        >
          <span> {info.val}</span>
        </Badge>
      )}
    </Element>
  );
}

Item.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  Icon: PropTypes.elementType.isRequired,
  component: PropTypes.elementType,
  onKeyDown: PropTypes.func,
};