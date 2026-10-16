# Architecture
- Use React with Vite and React Router; this checkout is a client-side application, so privileged operations live in Cloud edge functions.
- Import the generated Cloud client for all browser access; Vite uses rebound public runtime bindings before stale local bindings so backend reconnects do not target an abandoned instance.
- Verify opaque founder session tokens in the team-api function; never authorize with browser-stored handles or plaintext passcodes.
- Store founder approval authority in a protected application table independent of editable member job titles.
- Load team and inventory from Cloud and reconcile realtime changes with polling; never use dummy arrays as persistent data.
- Keep semantic visual tokens in global CSS and interactive controls in the shared Button component.