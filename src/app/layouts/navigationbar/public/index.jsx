import React from 'react'
import { Outlet } from 'react-router'
import Navbar from './Navbar'

export default function PublicMainNavbar() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}
