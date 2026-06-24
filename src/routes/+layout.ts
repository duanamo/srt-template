// This MVP is frontend-only: all data lives in localStorage and there is no
// server, auth, or database. Disabling SSR keeps rendering in the browser where
// localStorage is available, so the data store never runs in a server context.
export const ssr = false;
