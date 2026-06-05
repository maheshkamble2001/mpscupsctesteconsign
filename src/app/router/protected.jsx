// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";
import RoleGuard from "middleware/RoleGuard";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => {
                const CurrentPage = (await import("app/pages/dashboards/home"))
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

        {
          path: "menuaccessmanagement",
          children: [
            {
              index: true,
              element: <Navigate to="/menuaccessmanagement/menu" />,
            },
            {
              path: "menu",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/menuaccessmanagement/menu/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={100001}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "assign-menu",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/menuaccessmanagement/assignMenu/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={100003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "assigned-menu",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/menuaccessmanagement/assignedMenus/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={100002}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
          ],
        },
        //user mangement
        {
          path: "usermanagement",
          children: [
            {
              index: true,
              element: <Navigate to="/usermanagement/manage-users" />,
            },
            {
              path: "manage-users",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/usermanagement/ManageUsers/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300001}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "update/:id",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/usermanagement/ManageUsers/UpdateUser")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300004}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "add-user",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/usermanagement/ManageUsers/AddUser")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "user-role",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/usermanagement/userRoles/UserRoles")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300002}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
          ],
        },
        //student management
        {
          path: "studentmanagement",
          children: [
            {
              index: true,
              element: <Navigate to="/studentmanagement/manage-students" />,
            },
            {
              path: "manage-students",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/studentManagment/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300001}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-students/update-student/:id",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/studentManagment/sub/UpdateStudent")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300004}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-students/add-student",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/studentManagment/sub/AddStudent")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },

          ],
        },

        //application management
        {
          path: "applicationmanagement",
          children: [
            {
              index: true,
              element: <Navigate to="/applicationmanagement/manage-subjects" />,
            },
            {
              path: "manage-subjects",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/subjects/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300001}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-exam-types",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/examtypes/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300002}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-questions-bank",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/questions/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-questions-bank/add-question",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/questions/sub/AddQuestions")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-questions-bank/update-question/:id",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/questions/sub/EditQuestions")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },

            {
              path: "manage-exams",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/exams/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },

            {
              path: "manage-exams/add-exam",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/exams/addexam")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },

            {
              path: "manage-exams/update-exam/:id",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/exams/updateexam")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },


            //manage courses
            {
              path: "manage-courses",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/courses/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-courses/add-course",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/courses/AddCourse")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-courses/edit-course",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/courses/EditCourse")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-curriculam",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/coursecurriculam/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-tests",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/tests/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-tests/add-test",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/tests/AddTests")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-tests/edit-test",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/applicationmanagement/tests/UpdateTests")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },

          ],
        },

        //coursse management
        {
          path: "coursemanagement",
          children: [
            {
              index: true,
              element: <Navigate to="/coursemanagement/manage-courses" />,
            },
            {
              path: "manage-students",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/studentManagment/index")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300001}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-students/update-student/:id",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/studentManagment/sub/UpdateStudent")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300004}>
                      <CurrentPage />
                    </RoleGuard>
                  ),
                };
              },
            },
            {
              path: "manage-students/add-student",
              lazy: async () => {
                const CurrentPage = (
                  await import("app/pages/studentManagment/sub/AddStudent")
                ).default;

                return {
                  Component: () => (
                    <RoleGuard userAllowRole={300003}>
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

export { protectedRoutes };
