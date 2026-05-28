// ======================================================================
// 🌐 MPSC/UPSC TEST SERIES ADMIN - API & NETWORK CONSTANTS
// ======================================================================

/**
 * @description 1. Server Environment Base URLs
 */
export const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.mpsc-upsc-test.com/v1";
export const ASSETS_URL = process.env.REACT_APP_ASSETS_URL || "https://assets.mpsc-upsc-test.com";

/**
 * @description 2. Dedicated API Endpoints Mapping
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/admin-login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    VERIFY_ROLE: "/auth/verify-role"
  },
  
  // Test Paper & MCQ Engine
  TESTS: {
    BASE: "/tests",
    CREATE: "/tests/generate",
    LIST: "/tests/all-papers",
    DETAILS: (id) => `/tests/details/${id}`,
    DELETE: (id) => `/tests/delete/${id}`
  },

  // Question Bank Matrix
  QUESTIONS: {
    BASE: "/questions",
    ADD: "/questions/add-mcq",
    BULK_UPLOAD: "/questions/bulk-excel-import",
    FETCH_BY_SUBJECT: (subject) => `/questions/subject/${subject}`
  },

  // Student Enrollment & Performance Analytics
  STUDENTS: {
    LIST: "/students/directory",
    REPORTS: (studentId) => `/students/performance/${studentId}`,
    BLOCK: (studentId) => `/students/restrict/${studentId}`
  }
};

/**
 * @description 3. Standard HTTP Status Code Dictionary
 */
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403, // Role restriction verification failures
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

/**
 * @description 4. Local & Session Storage Tokens
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "admin_access_token",
  REFRESH_TOKEN: "admin_refresh_token",
  USER_PROFILE: "admin_profile_meta",
  THEME_MODE: "admin_ui_theme" // 'light' or 'dark'
};