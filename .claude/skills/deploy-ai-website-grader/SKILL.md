---
name: deploy-ai-website-grader
description: Deploy the AI Website Grader — runs the pre-deploy gate, then branch/PR/merge flow. Vercel autodeploys on merge to main.
disable-model-invocation: true
---

> **Path note:** Commands below assume the project root at `c:/Users/shane/work/SI/projects/ai-website-grader`. If you're not Shane, locate it with `find ~ -name "deploy.sh" -path "*/ai-website-grader/deploy.sh" 2>/dev/null | head -1` and substitute.

**Project root:** `c:/Users/shane/work/SI/projects/ai-website-grader`
**Live URL:** https://ai-website-grader.vercel.app
**Repo:** https://github.com/searchinfluence/ai-website-grader
**Vercel dashboard:** https://vercel.com/will-scotts-projects/ai-website-grader

Current branch: !`cd c:/Users/shane/work/SI/projects/ai-website-grader && git branch --show-current`
Pending changes: !`cd c:/Users/shane/work/SI/projects/ai-website-grader && git status --short`

---

## How this deploys

Vercel auto-deploys on merge to `main` via the GitHub integration. There is **no manual `vercel --prod` step**. Your job is to make sure nothing bad reaches `main`.

---

## Step 1 — Work on a feature branch

Always work on a branch — direct commits to `main` skip the PR review step. From `main`:

```bash
git checkout -b <kebab-case-branch-name>
```

Commit early and often — small, focused commits with clear messages.

---

## Step 2 — Run the pre-deploy gate

From the project root:

```bash
./deploy.sh
```

This runs, fails-fast on first error:

1. `npm run test:run` — Vitest
2. `npm run lint` — `next lint`
3. `npm run type-check` — `tsc --noEmit`
4. `npm run build` — `next build`

**If any step fails:** fix the root cause. Do not `.skip` tests, do not suppress lint/type errors, do not bypass the gate. Re-run `./deploy.sh` until it passes end-to-end.

---

## Step 3 — Secret scan

```bash
gitleaks detect --source . --verbose --redact
```

(GitHub Actions runs this on every PR too, but catch it locally first.)

---

## Step 4 — Push the branch and open a PR

```bash
git push -u origin <branch-name>
gh pr create --base main --title "..." --body "..."
```

Share the PR URL with the human. **Do not merge without approval.**

---

## Step 5 — After approval: merge

Once Shane says "approved":

```bash
gh pr merge <pr-number> --squash --delete-branch
```

Vercel picks up the merge and deploys to production automatically. Confirm at:

- GitHub Actions (Gitleaks must be green)
- Vercel dashboard (deployment shows "Ready")
- https://ai-website-grader.vercel.app (spot-check the changed surface)

---

## Recovery paths

- **Gate fails on tests:** fix the code or the test — never delete the assertion to ship.
- **Gate fails on build:** check the last file touched; `next build` surfaces most real issues.
- **Gitleaks hit:** if it's a real secret, rotate it immediately, purge from history with `git filter-repo`, **ask Shane before force-pushing**. If false positive, add a narrowly-scoped `.gitleaks.toml` allowlist entry.
- **Bad merge reached prod:** revert the merge commit on a new branch, open a revert PR, run the full gate on it, get approval, merge. Vercel will redeploy the reverted state.

---

## Hard rules

- **Don't push directly to `main`** — direct pushes skip the pre-deploy gate (tests + lint + typecheck + build) and the PR review step, risking broken code in production.
- **Don't run `vercel --prod` manually** — Vercel's GitHub integration auto-deploys on merge to `main`. Manual deploys bypass the PR review and the gate.
- **Don't `.skip` a test to make the gate pass** — `.skip` hides the underlying bug and ships broken code to users. Fix the code, or fix the test if it's actually wrong.
- **Don't merge your own PR without Shane's approval** — the human review step is the last check before production.
- **Don't rewrite history on `main` without explicit instruction** — collaborators rely on stable refs, and force-pushes can lose commits.
