# Setup Guide — walk the creator through this (plainly)

> Claude: this is your **script** for helping the creator set up the few things they must do themselves. Everything here is accurate — the sites, commands, and values are correct. But **deliver it in plain language, one step at a time, waiting for a "done" before the next step.** Never dump this whole list on them. Never use the jargon in the headings when you talk to them — the headings are for you.
>
> The creator is on a Mac or Windows PC. Ask which, once, and give them only their platform's steps. Assume they've never opened a terminal. Be patient and encouraging.

## What setup covers (your checklist, not theirs)
1. Installing the behind-the-scenes tools (Node, pnpm, an editor).
2. Making sure you can write files into their project folder.
3. Creating a home folder for the project.
4. Getting the secret keys, at the moment each is needed.
5. Knowing how they run commands and save progress.

You do **not** need all of this before starting to build. The minimum to begin building is: tools installed, you can write files, and the project folder exists. Keys can come as each feature needs them.

---

## 1. The tools (do this once, before building)

Explain simply: "We need to install a few free tools that let your app run. Takes about 20 minutes. I'll guide each click."

**Node.js** (the engine that runs the app):
- Send them to **https://nodejs.org** and have them download the big **LTS** button and install it (Mac: open the `.pkg`, click through; Windows: open the `.msi`, click through, allow it).
- To confirm, have them open their command window and run `node --version`. It should print a version like `v20.x`. (Teach them to open it: Mac → press `Cmd+Space`, type **Terminal**, Enter. Windows → Start menu, type **PowerShell**, open **Windows PowerShell**.)

**pnpm** (installs the app's building blocks) — in the command window, one line at a time:
```
corepack enable
```
```
corepack prepare pnpm@11.3.0 --activate
```
Confirm with `pnpm --version` → should show `11.3.0`. (If Windows blocks it, have them reopen PowerShell as administrator and retry.)

**A code editor** (mostly to view files): **https://code.visualstudio.com** → download for their system → install. Optional but handy.

## 2. Let me write files (the file-writing connection)

The creator talks to you in **Claude Desktop**. By default you can only chat — you need their permission to create files in their project folder. If you can't yet write files, guide them to turn it on:

- Easiest path: in Claude Desktop **Settings**, look for **Connectors** (may be under a Developer/Extensions area), find **Filesystem**, add it, and point it at their project folder. Then fully quit and reopen Claude Desktop.
- If there's no Connectors screen: in **Settings → Developer → Edit Config**, add the filesystem server pointing at the project folder, save, and fully restart Claude Desktop. The config entry runs `npx -y @modelcontextprotocol/server-filesystem <the project folder path>`. The config file lives at `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows). Give them the exact JSON with their real folder path filled in, and tell them to replace the file's contents with it.
- Confirm by creating a tiny test file in their folder and asking them to check it appeared. From then on, tell them plainly "click **Allow**" whenever you save a file.
- If they truly can't enable it: fall back to giving them each file's full contents and exact location to paste into the editor. Slower, but nothing is lost — reassure them.

## 3. The project's home folder

Have them create one empty folder for everything. Give the command for their system:
- Mac: `mkdir -p ~/Desktop/creator-manager`
- Windows: `mkdir "$HOME\Desktop\creator-manager"`

This is where you'll build. Point your file-writing at this folder. Tell them: "Don't put anything in here yourself — I'll fill it up."

**Running commands later:** teach them once that before running commands, they "move into" the folder with:
- Mac: `cd ~/Desktop/creator-manager`
- Windows: `cd "$HOME\Desktop\creator-manager"`
Then commands like starting the app work. When you give a command, tell them to paste it there and press Enter, and what they should see when it's done.

---

## 4. The secret keys (get the four main ones up front — Step 0)

A "key" is just a password-like code a service gives them so their app can use it. Explain it that simply. **You** decide where each key goes (into a private settings file called `.env.local` in the project folder — create/update it yourself; never make them find it). All of these have free tiers; reassure them they won't be charged for this.

**Step 0 — the creator's first move in the build guide — gathers the four main keys together, before building:** the database (Neon), sign-in/accounts (Clerk), the AI brain (Gemini), and brand discovery (Firecrawl). Walk them through each sign-up one at a time. If the project folder doesn't exist yet, hold the keys and write them into `.env.local` the moment it's created (during Getting started). Getting all four up front means the app runs on real data, login, and AI from the first build step. Later: hosting (Vercel, Step 16); and at Step 17, TikTok plus `AUTH_SECRET` (a local token-encryption secret — no account).

**Database — Step 0 (used from Step 2).** Site: **https://neon.tech** → sign up (Google/GitHub is fastest) → create a project (any name) → copy the **Pooled** connection string (there's a "Pooled connection" toggle — on; the string contains `-pooler`). It starts with `postgresql://`. Save it as `DATABASE_URL`.

**Sign-in / accounts (Clerk) — Step 0 (used from Step 3).** Site: **https://clerk.com** → sign up → **create an application** → give it a name, and under the sign-in options turn **ON** *Email* and *Google* → on the API keys screen, copy the **Publishable key** (starts `pk_`) and the **Secret key** (starts `sk_`). Save them as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. (Clerk supplies shared Google credentials in development, so "Continue with Google" works right away; at go-live Clerk walks you through adding your own — nothing to do now.)

**The AI brain — Step 0 (powers your agents from the first AI feature).** With it set, everything the agents write is the real thing; without it they fall back to placeholder text. Site: **https://aistudio.google.com/apikey** → sign in with Google → **Create API key** → copy it (starts with `AIza`). Save as `GEMINI_API_KEY`.

**Brand discovery — Step 0 (used at Step 11).** Site: **https://firecrawl.dev** → sign up → find **API Keys** → copy (starts with `fc-`). Save as `FIRECRAWL_API_KEY`. (Before this key is set, discovery shows a few example brands so the flow still works.)

**Going live — Step 16.** Hosting at **https://vercel.com** (sign up with GitHub). Covered in the build plan's Go-live step; you'll re-enter the same keys there as the live app's settings (not as a file).

**TikTok auto-fill — Step 17, on the live site.** TikTok's web login only works over a secure `https://` address, so this is set up **after** going live (Step 17). Walk them slowly — it's the fiddliest one. At **https://developers.tiktok.com**: create an app → add the **Login Kit** product with scopes `user.info.basic` / `user.info.profile` / `user.info.stats` → build in **Sandbox** with the creator added as a test user. Set the redirect to the **exact** live `https://<their-live-domain>/api/auth/tiktok/callback` — entered **identically** in the TikTok portal and in the app's settings (it must match byte-for-byte, or the login errors). Save the **client key** + secret as `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET`, and set `TIKTOK_REDIRECT_URI` to that same live callback URL. Without these, the Connect-TikTok card simply hides and the Media Kit stays manual. Also generate a local **token-encryption secret** here so the stored TikTok token is encrypted at rest — Mac `openssl rand -hex 32` (Windows: any 40+ random characters) — saved as `AUTH_SECRET`. No account needed; it's the one place the app uses it.

When you receive a key from the creator, confirm you saved it, and if the app is running, remind them you'll restart it so it picks up the new key (they stop it with `Ctrl+C` and run the start command again).

---

## 5. Saving progress (do this after each working step)

Set up saving on the first step: have them run `git init` once in the project folder (if git asks for a name/email, it prints two commands — have them paste those, then continue). After that, saving is always:
```
git add -A
```
```
git commit -m "a short note about what we just finished"
```
Explain it plainly: "This is a save point — if anything ever breaks badly, we can jump back here." Prompt them to save after each step passes its check. (Near the end, this same saved history is what puts the app online.)

---

## Your setup manner
- One step, then wait. Confirm each worked before the next.
- Translate every technical word into plain language or skip it.
- If a step errors, read what they paste, tell them in a sentence what's up, and give the fix.
- Keep it warm. Setup is the least fun part; get them through it with encouragement, then the building begins.
