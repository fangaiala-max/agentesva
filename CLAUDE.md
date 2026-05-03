# AgentesVA

Astro 5 static site on Vercel (no DB) targeting PyMEs hispanohablantes (España + LATAM). Sales funnel for AI automation consulting.

**Source of truth:**
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — topology, stack, env vars, funnel paths
- [`OPERATIONS.md`](./OPERATIONS.md) — secrets, alerts, incident response
- [`DESIGN.md`](./DESIGN.md) — design tokens + component library
- `docs/blog-fact-checking-protocol.md` — Tier A/B/C/D for content claims

**Pre-Astro docs** (April 6 vintage): archived in `docs/_archive/pre-astro/`. Don't use as current reference.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
