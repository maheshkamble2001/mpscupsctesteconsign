// App.jsx
import { RouterProvider } from "react-router";
import { AuthProvider } from "app/contexts/auth/Provider";
import { BreakpointProvider } from "app/contexts/breakpoint/Provider";
import { LocaleProvider } from "app/contexts/locale/Provider";
import { SidebarProvider } from "app/contexts/sidebar/Provider";
import { ThemeProvider } from "app/contexts/theme/Provider";
import AxiosInterceptor from "components/AxiosInterceptor";

import router from "app/router/router";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocaleProvider>
          <BreakpointProvider>
            <SidebarProvider>
           
          
            
              {/* ✅ Only wrap inside RouterProvider */}
              <RouterProvider
          
                router={router}  
                fallbackElement={
                  <AxiosInterceptor>
                    <div>Loading...</div>
                  </AxiosInterceptor> 
                 
                }
              /> 
            </SidebarProvider>
          </BreakpointProvider>
        </LocaleProvider>
      </ThemeProvider>
    </AuthProvider>

  );
}

export default App;
