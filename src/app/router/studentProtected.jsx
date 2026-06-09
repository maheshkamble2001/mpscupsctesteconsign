// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";
import RoleGuard from "middleware/RoleGuard";
import StudentAuthGuard from "middleware/StudentAuthGuard";
import { StudentDynamicLayout } from "app/layouts/StudentDynamicLayout";

// ----------------------------------------------------------------------

const studentProtected = {
  id: "studentprotected",
  Component: StudentAuthGuard,
  children: [
    {
      Component: StudentDynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/student" />,
        },
        {
          path: "student",
          children: [
            {
              index: true,
              element: <Navigate to="/student/home" />,
            },
            {
              path: "home",
              lazy: async () => {
                const CurrentPage = (await import("app/pages/public/Home/index"))
                  .default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={200000}>
                      <CurrentPage />
                    </RoleGuard>
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
            Component: DynamicLayout,
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

export { studentProtected };
