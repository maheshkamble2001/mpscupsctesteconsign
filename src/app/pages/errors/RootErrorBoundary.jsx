// Import Depndencies
import { isRouteErrorResponse, Navigate, useLocation, useRouteError } from "react-router";
import { lazy } from "react";

// Local Imports
import { Loadable } from "components/shared/Loadable";
import { useAuthContext } from "app/contexts/auth/context";
import { REDIRECT_URL_KEY } from "constants/app.constant";

// ----------------------------------------------------------------------

const app = {
  401: lazy(() => import("./401")),
  404: lazy(() => import("./404")),
  429: lazy(() => import("./429")),
  500: lazy(() => import("./500")),
};

function RootErrorBoundary() {
  const error = useRouteError();
  const { isAuthenticated } = useAuthContext();
  
  if (isAuthenticated) {
    if (isRouteErrorResponse(error)) {
      const Component = Loadable(app[error.status]);
      return <Component />;
    }
  } else {
    return <Navigate to={`/login`} />;
  }

  console.error("Unhandled route error:", error);
  return (
    <div className="p-4 font-mono text-red-600">
      <h2 className="text-lg font-bold">Something went wrong</h2>
      <pre className="whitespace-pre-wrap">
        {error?.message || JSON.stringify(error)}
      </pre>
    </div>
  );
}

export default RootErrorBoundary;
