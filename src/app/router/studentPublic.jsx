// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";
import RoleGuard from "middleware/RoleGuard";
import StudentAuthGuard from "middleware/StudentAuthGuard";
import PublicAuthGuard from "middleware/publicAuthGuard";
import { PublicDynamicLayout } from "app/layouts/PublicDynamicLayout";

// ----------------------------------------------------------------------

const studentPublic = {
  id: "studentPublic",
  children: [
    {
      Component: PublicDynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/public" />,
        },
        {
          path: "public",
          children: [
            {
              index: true,
              element: <Navigate to="/public/home" />,
            },
            {
              path: "home",
              lazy: async () => {
                const CurrentPage = (await import("app/pages/public/Home/index"))
                  .default;

                return {
                  Component: () => (
                      <CurrentPage />
                  ),
                };
              },
            },
          ],
        },

      ],
    },

    {
      children: [
        {
          path: "settings",
          lazy: async () => ({
            // Component: (await import("app/pages/settings/Layout")).default,
            // Component: DynamicLayout,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { studentPublic };
