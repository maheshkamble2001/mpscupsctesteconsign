import { useAuthContext } from 'app/contexts/auth/context'
import React, { lazy } from 'react'
// const PageNotFound = lazy(() => import("app/pages/errors/404"))
const PageNotFound = lazy(() => import("app/pages/errors/401"))

export default function RoleGuard({ userAllowRole,children}) {
    const {role}=useAuthContext();
    if(!role?.includes(userAllowRole)){
        return <PageNotFound/>
       
    }

  return (
    <>{children}</>
  )
}
