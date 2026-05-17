# Security Policy

Personal learning archive. Each Node sub-project uses `npm overrides` to keep transitive deps on advisory-clean versions even though the lesson code itself is pedagogical.

**Report a vulnerability privately** — email shauryapunj404@gmail.com or use GitHub's "Security › Report a vulnerability" tab.

## Controls

- CodeQL `security-extended` on push, PR, and weekly schedule.
- Dependabot weekly per Node sub-project; `semver-major` ignored.
- Branch protection on `main`: required CodeQL check, linear history, no force-push, no deletion.
