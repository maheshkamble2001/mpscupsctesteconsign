import { matchPath } from "react-router-dom";

/**
 * Checks if the given path matches the current pathname.
 *
 * @param {string} path - The path to check against the current location.
 * @param {string} pathname - The current path of the browser.
 * @returns {boolean} - Returns `true` if the path matches the current pathname, otherwise `false`.
 */
export function isRouteActive(path, pathname) {
  if (!path || !pathname) return false;
  try {
    return !!matchPath({ path, end: false }, pathname);
  } catch {
    return false;
  }
}
