<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Founder login uses server-verified credentials and opaque expiring sessions, restored from sessionStorage; private credential/session tables have service-only access — why: custom passcodes must never be exposed or trusted from browser state.
- Live data goes through `useLiveTable` (load + realtime refetch) — why: one consistent sync path for all modules.
- The root CommandShell owns session, sidebar, security dialog and comms drawer while leaf routes render individual modules — why: module navigation must preserve founder and communications state.
- Existing team-data anon policies remain a lightweight shared-workspace model, not account-level security — why: preserve the requested founder gate without silently changing existing data permissions.
- Objective milestone templates and URL/progress helpers live in browser-safe domain modules — why: concrete rules can be tested independently of rendering.
