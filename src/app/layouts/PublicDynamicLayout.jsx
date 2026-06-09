// Import Dependencies
import { lazy, useMemo } from "react";

// Local Imports
import { useThemeContext } from "app/contexts/theme/context";
import { Loadable } from "components/shared/Loadable";
import { SplashScreen } from "components/template/SplashScreen";

// ----------------------------------------------------------------------

const themeLayouts = {
  "1": lazy(() => import("./navigationbar/public/index")),
};

export function PublicDynamicLayout() {
  const { themeLayout } = useThemeContext();

  const CurrentLayout = useMemo(
    () => Loadable(themeLayouts["1"], SplashScreen),
    [themeLayout],
  );

  return <CurrentLayout />;
}
