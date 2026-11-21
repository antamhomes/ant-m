# Architecture rules

- Keep the new-website announcement isolated and mounted outside route content in App; this preserves every existing page and shares dismissal across navigation using sessionStorage.
- Use the native HTML dialog for the announcement's modal behavior; this provides browser-managed focus trapping, background inertness and Escape support without new dependencies.
- Scope announcement spacing and fixed/sticky header offsets to its active root class and measured banner height; this keeps existing layouts unchanged before dismissal.