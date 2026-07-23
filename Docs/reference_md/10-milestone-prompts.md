# Your Build Guide — what to ask for, in order

You build the whole app just by **talking to Claude**. Below is the order to build things in, with the exact words you can say for each step. They're written the way you'd naturally ask — so you can **copy them, or say them in your own words.** Claude takes care of everything technical behind the scenes.

## How to use this
1. Do **Step 0** (get your four free keys), then the **Getting started** message.
2. Then work down the list, one step at a time.
3. For each step: say the message → let Claude build it (click **Allow** if it asks; paste any command it gives you) → do the **✅ Check** → when it works, say **"save my progress"** → next step.

**One rule that saves you hours:** finish and check each step before starting the next. If anything looks broken, just tell Claude what you see: *"the page is blank"* or *"there's red text that says ___ — can you fix it?"*

> Your four main keys — the **database**, **sign-in** (with Google), the **AI**, and **brand discovery** — are set up together right at the start in **Step 0**. Two more sign-ups come later: hosting (when you go live) and TikTok (last). Claude walks you through every one in plain language. Steps that involve a sign-up are marked 🔑.

---

## Step 0 — Get your four free keys 🔑
*You'll get: the four free services your app needs — stored data (Neon), sign-in with Google (Clerk), brand discovery (Firecrawl), and the AI brain (Google Gemini) — signed up for and handed to Claude, so nothing stops you mid-build. (Nothing to see on screen yet.)*

```
Before we build anything, I want to get set up so nothing stops me halfway. My app needs four free services: one that stores my data, one that handles sign-up and login (with a "Continue with Google" option), one that finds brands online, and the AI one behind my helpers. Please walk me through signing up for all four now, one at a time, in plain English — for each, tell me exactly which website to open, what to click, and what to copy, then keep it safe for me. If my project folder isn't ready yet, just hold onto them and drop them in the moment it is. Wait for me to give you each one before moving to the next.
```
✅ **Check:** you've signed up for all four and given Claude each key, and it's confirmed it has them (it'll slot them into your project during the next step). No browser change yet — that's expected.

---

## Getting started

```
Hey! I want to build an app that helps me manage my brand deals as a content creator — I'm going to call it Creator Manager. I'm not a coder, so I need you to handle all the technical parts and guide me through anything I have to do myself. Before we start building, can you help me get everything set up? Walk me through it one step at a time, in plain English, and wait for me to tell you each step is done before giving me the next one.
```
✅ **Check:** you've installed what you need, Claude can create files for you (and has saved the four keys from Step 0), and you're ready to build. Then start Step 1.

---

# Getting it running

## Step 1 — Landing page + your live dashboard ⭐
*You'll get: your app open in your browser — a full, polished landing page for Creator Manager, led by your signature "AI team at work" dashboard (your agents circling you, glowing and gently floating), followed by real sections that explain the app, with Log in / Sign up buttons.*

**Your look, your call.** This prompt asks for a warm, dark, polished style (the default). Want a different vibe? Just change that one line to describe yours — *"light and minimal," "glassy and modern," "bold and colorful"* — and Claude builds the whole app **and** this dashboard in that style. You can change it later too.

```
Let's start building! I want a proper landing page for Creator Manager — the kind of page a real product has. Lead it with the screen that makes this app special: my AI team arranged in a circle around me, connected with glowing lines, gently floating and pulsing like they're at work (show my ready-made team with example activity for now, so it looks alive the moment it opens). Below that, add real landing-page sections that explain the app: a clear headline and short pitch, what it does (finds brands, writes pitches in my voice, drafts proposals, follows up, books calls), how it works in a few simple steps, why a creator would want it, and a closing call-to-action — plus "Log in" and "Sign up" buttons up top and a simple footer. For the overall style, give it a warm, dark, polished look. Make it feel finished and professional. Get it running so I can open it in my browser, and tell me exactly what to do to see it.
```
✅ **Check:** the landing page opens in your browser — the orbit dashboard up top (team floating/glowing), then real sections that explain the app, in the style you asked for, with Log in / Sign up — and no errors.
💾 Say *"save my progress."*

## Step 2 — Database
*You'll get: the storage that lets your app remember everything. (Nothing new to see yet.)*

```
Next, I want my app to actually save things — like accounts and brand info — so nothing disappears when I close it. Please set that up using the storage key I already gave you at the start. I know I might not see anything new yet — just tell me how to know it worked.
```
✅ **Check:** the command Claude gives you finishes with no errors, and the app still opens.
💾 Save.

## Step 3 — Accounts & login
*You'll get: real accounts — sign up and log in (including "Continue with Google"), and log out. Forgotten-password is handled for you.*

```
Now I want people to be able to sign up and log into my app — with an email option and a "Continue with Google" button — and log out. Make the app private, so only signed-in people can get in. Use the sign-in service I set up at the start. Please set that up and show me how to try it.
```
✅ **Check:** you can sign up (with email or Google), log in, log out, and log back in; logged out, the app sends you to the sign-in page; the public landing page still opens.
💾 Save.

## Step 4 — Navigation & settings
*You'll get: a menu you can click around, a search box, and a settings page.*

```
I'd like my app to feel like a real app now. Please add a menu with sections for my dashboard, brand deals, agents, chat, calendar, analytics, profile, and settings, plus a search box and a settings page where I can turn my notifications on and off. Add my name and a log-out button too. My dashboard's already the real thing from the start — the other sections can be simple "coming soon" pages for now. Then show me how to click around.
```
✅ **Check:** you can click to every section; search and the settings page open; log out works.
💾 Save.

---

# Making it about you

## Step 5 — Media Kit
*You'll get: your creator profile — what makes every pitch sound like you.*

```
Time to make it about me. I want to fill in my creator profile — my niche, my audience, the platforms I'm on and my follower counts, my tone/vibe, deals I've done, and my rates. And I want a friendly step-by-step setup that new users go through the first time. Ask me whatever you need to fill mine in, then show me where I can see and edit it.
```
✅ **Check:** you're guided through the first-time setup, finish it, land in the app, and can edit your profile later and it stays saved.
💾 Save.

## Step 6 — AI agents & teams
*You'll get: five ready-made AI helpers — with their real AI brains already switched on — plus the ability to make your own and group them into teams.*

```
Now the fun part — my AI team. I want a ready-made team of five AI helpers: one that finds brands, one that writes first pitches, one that makes proposals, one that follows up, and one that books calls. I also want to be able to make my own helpers and put them into teams. Their AI brain is already switched on from the keys I set up at the start, so everything they write should be the real thing, not filler. Please set that up and show me how to make a new helper and a team.
```
✅ **Check:** the five helpers appear with the AI switched on; you can create your own helper and a team, and they stick around.
💾 Save.

---

# The AI does the work

## Step 7 — Deals pipeline
*You'll get: a board that tracks brands from "new" to "booked call," plus an approval area.*

```
Let's build the place where I track my brand deals. I want a board that shows brands moving through stages — from "new" all the way to "booked a call." I want to add a brand myself or import a list, and I want a separate "needs my approval" area for brands before my agents work on them. Show me how to add a brand and move it along the stages.
```
✅ **Check:** you can add a brand, assign it to a helper, and move it between stages; the approval area is there.
💾 Save.

## Step 8 — Pitch writing ⭐
*You'll get: the big one — click a button and an agent writes a personalized pitch as you, ready to open in your own mail app.*

```
Okay, this is the one I've been waiting for. I want to open one of my brands, click a button, and have one of my AI helpers write a personalized pitch to that brand — in my own voice, like I wrote it myself, and specific to that brand rather than generic. If it's a brand I only have a social profile for, make it a short friendly message instead of an email. Keep each pitch as a draft I can open in my own email app to send, or copy. When it's ready, show me how to try it and where to read what it wrote.
```
✅ **Check:** you click the pitch button on a brand and read a *real, brand-specific* pitch written as you — it names the brand and reflects your Media Kit, not fill-in-the-blanks filler — then open it in your mail app; the brand moves to "pitched."
💾 Save. *(Take a second to enjoy this — the hardest part works now.)*

## Step 9 — Brand research
*You'll get: a helper that writes a short brief so your pitches hit harder.*

```
I want a helper that can quickly research a brand and write me a short brief — what they care about and the best angle to pitch them — so my pitches hit harder. Show me how to run it on a brand and where the brief shows up.
```
✅ **Check:** you run it on a brand and see a summary, hooks, and an angle.
💾 Save.

## Step 10 — Proposals & follow-ups
*You'll get: a helper that drafts a scoped, priced proposal — and your Follow-up helper sending a friendly nudge to brands that go quiet.*

```
Now I want a helper that writes a proper proposal for a brand — scoped and priced based on my profile, my audience, and my rates. And while we're at it, I want my Follow-up helper to actually work too: for a brand that went quiet after I pitched, it should write a short, friendly nudge in my voice that builds on what I already said. Show me how to create a proposal and read it, and how to send a follow-up.
```
✅ **Check:** you create a proposal for a brand and it's scoped and priced, written in your voice; and you can send a real follow-up nudge on a brand that went quiet.
💾 Save.

## Step 11 — Brand discovery
*You'll get: your Research helper finding real brands and dropping them in your approval area.*

```
I want my Research helper to go out and find real brands for me — ones that fit my niche — and put them in my "needs approval" area so I can pick which to keep. It already has the web-search key I set up at the start, so it's ready to go. Show me how to run a search and approve a brand.
```
✅ **Check:** a search brings brands into your approval area; approving one moves it into your pipeline.
💾 Save.

## Step 12 — Self-running teams
*You'll get: a team that gets to work on its own, handing brands along and checking in with you.*

```
I want to hit one button on a team and have them start working through my brands together — finding brands and lining up the next steps — passing each brand from one helper to the next, and checking in with me before the big steps like sending. Set that up and show me how to start it and watch them work together.
```
✅ **Check:** a team run visibly gets going, produces work, and hands back to you for the steps that need your say-so.
💾 Save.

---

# Talking to your team & going live

## Step 13 — Team chat
*You'll get: a group chat where you ask your team for things and they do them.*

```
I want a group chat with my AI team. I'd like to type something like "@Research find me some fitness brands" and have that helper actually go do it and report back right there in the chat. Build that and show me how to try it.
```
✅ **Check:** you mention a helper with a request, it runs the real task and replies in the chat.
💾 Save.

## Step 14 — Calendar
*You'll get: booked brand calls on a calendar, bookable in plain English.*

```
I want a calendar that shows my booked brand calls. And I want to book one just by saying it in plain English — like "book a call with Acme next Tuesday at 2pm" — or straight from a brand. Show me how to book one and see it on the calendar.
```
✅ **Check:** you book a call (from a brand or by asking) and it shows on the calendar.
💾 Save.

## Step 15 — Make the dashboard real ⭐
*You'll get: that signature dashboard you've had since day one, now wired to your real work — real numbers, and helpers that light up live as they actually work.*

```
Time to make my dashboard real. It's looked great since day one — now I want it showing my actual results instead of example activity: the pitches I've drafted, brands I've worked, calls I've booked, with the helpers lighting up and pulsing whenever they're genuinely working on a brand right now, plus a notifications bell for recent activity. Then show me how to check it — including running a pitch so I can watch a helper light up for real.
```
✅ **Check:** your dashboard now shows your real numbers; running a pitch or a team makes a helper visibly "work" (a green pulse); the notifications bell reflects what you've actually done, and clearing it doesn't change your totals.
💾 Save.

## Step 16 — Go live 🔑
*You'll get: a real web link to your app you can share with anyone.*

```
I'm ready to put my app on the real internet so I can share it with a link. Walk me step by step through getting it online, and make sure the live version works fully — including the AI. Handle the technical settings yourself and just tell me where to click or copy.
```
✅ **Check:** the live link opens your working app, you can sign up on it, and the AI features work there too.
💾 Save. 🎉 **You built and launched a real product.**

## Step 17 — Connect TikTok 🔑
*You'll get: your TikTok stats auto-filling your Media Kit, and your photo in the center of your dashboard.*

```
Last thing — I want to connect my TikTok so it fills in my follower stats automatically and puts my profile photo in the middle of my dashboard. I know this one only works on my live site (not on my computer), since TikTok needs a secure web address. Walk me through setting it up and connecting it on my live site, step by step.
```
✅ **Check:** on your live site you click Connect TikTok, approve it, and your stats and photo fill in automatically (in the Media Kit and at the center of the dashboard).
💾 Save.
