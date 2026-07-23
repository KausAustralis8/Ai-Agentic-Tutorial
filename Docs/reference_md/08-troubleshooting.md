# Troubleshooting — when the creator says "it's not working"

> Claude: use this to fix common problems **calmly and in plain language.** The creator can only tell you what they *see*. Ask for the observable symptom, match it below, fix it yourself, and tell them what to try. Never lecture them with the technical cause.

## How to run the fix loop
1. Ask what they see, plainly: "Is the page blank, or is there red text? What does it say?" If they can paste the red text, great — read it; don't show it back to them.
2. Match the symptom below (or read the relevant file).
3. Make the fix yourself. If a command is needed, give the exact copyable line and where to paste it.
4. Tell them what to check to confirm it's fixed. Reassure them this is normal.

---

## "You can't create files / nothing appears in my folder"
Your file-writing connection isn't on or isn't pointed at their folder. Common causes: they didn't fully quit and reopen Claude Desktop; a typo in the folder path; or Node isn't installed. Walk them back through step 2 of the setup guide. As a stopgap, give them the file contents and exact path to paste manually so building isn't blocked.

## "The command window says 'command not found' (node / pnpm / git)"
The tool isn't installed or the window was opened before install finished. Have them close the command window and open a fresh one, then re-run the check (`node --version`, `pnpm --version`). If still missing, re-do that tool's install in the setup guide. On Windows, `corepack` issues often need PowerShell reopened **as administrator**.

## "The app won't start / errors when I run the start command"
Usually a missing install or a code error. First, have them run the install command again, then start. If it still errors, ask them to paste the last chunk of red text; read it, open the file it names, and fix it. If it mentions a port already in use, another copy is running — have them stop it (`Ctrl+C` in the other window) or you switch the app to a different local port.

## "The page is blank / white screen"
A code error on that page. Ask if there's red text on the screen or in the command window; read it, find the file, fix it. Don't guess — the message names the file and line.

## "It can't connect to the database / my data won't save"
The database key is missing or wrong. Confirm you saved their **pooled** connection string as `DATABASE_URL` (it contains `-pooler`). If they just added or changed it, the running app needs a restart to pick it up — have them stop it (`Ctrl+C`) and start it again. If the migrate command failed, read its error and fix the SQL; keep migrations additive (never drop their data).

## "Sign-in / 'Continue with Google' isn't working"
Login is handled by **Clerk**, so it's almost always the keys or a dashboard toggle. Confirm both Clerk keys are in the private settings file — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts `pk_`) and `CLERK_SECRET_KEY` (starts `sk_`) — with no quotes or stray spaces, then restart the app (keys are read at startup). If the sign-in page is blank or errors, check that `<ClerkProvider>` wraps the app and `clerkMiddleware()` is in `middleware.ts`. If the **Google** button is missing, switch Google **on** in the Clerk dashboard (User & Authentication → Social Connections). If *every* page (even the welcome page) bounces to sign-in, the middleware is protecting too much — let the public landing page and Clerk's own routes through.

## "Updating how data is stored failed" (a migration error)
Read the error from the migrate command. Fix the SQL file you wrote (a typo, an already-existing table, or a missing extension). Make sure the vector extension was enabled in the first migration. Re-run the migrate command. Never solve this by wiping the database.

## "The AI features do nothing / pitches don't appear"
- If there's no AI key yet: that's fine by design — a clean fallback pitch should still appear. If instead it crashes, the graceful-fallback path is missing; add it (see conventions).
- If there is a key: the work may be stuck in the queue because the poller isn't re-calling the runner — check that. If the AI service returns an error code, a `400` usually means the request shape/schema (fix the call), while `403/429` means a key or quota problem (have them confirm the key, or wait and retry). Keep the per-call timeout and small batches so nothing hangs.

## "A pitch mentioned it was written by an AI / had a placeholder like [Brand]"
The guardrails aren't being applied firmly enough. Strengthen the guardrails text and make sure it's included in that engine's prompt; re-run. Pitches must be first-person as the creator, with real values only.

## "I changed a key but nothing changed"
The running app reads keys at start. Have them stop it (`Ctrl+C`) and start it again. Confirm you wrote the key into the private settings file correctly (name exactly right, no quotes, no spaces around the `=`).

## "Something broke badly and I want to go back"
Use their last save point. Have them run the command to return to the last save (you provide it), then re-do the step that broke, more carefully. This is exactly why we save after each working step.

## "The live site doesn't work but it worked on my computer"
Almost always the live app is missing the keys or has an old web address. Confirm the same secret keys are entered in the hosting service's settings (not just in the local file), and that any address that must change from the local one to the live one was updated (for example, the TikTok redirect). Re-deploy after fixing.

---

## When you're genuinely stuck
If two solid fix attempts don't work, don't spiral. Tell the creator plainly: "This one's being stubborn — let me try a different approach," step back, re-read the relevant file end to end, and reconsider. If it's outside the build (an account issue on a provider's site), tell them exactly which button to click there. Keep it calm; never make them feel it's their fault.
