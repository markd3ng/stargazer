# Stargazer — Agent Rules

## Commit & Push Protocol

### Rule 1: Changelog Synchronization (HARD REQUIREMENT)

**EVERY commit that changes user-facing behavior MUST include a corresponding `changelog.md` update in the SAME commit.**

Before `git push`:
1. Write a concise changelog entry under the current version heading in `changelog.md`
2. Use format: `- description` under `## 新功能`, `## 修复`, or `## 性能优化`
3. The changelog entry goes in the SAME commit as the code change

Example:
```
changelog.md:
# 1.10.0
## 新功能
- 新增 XXX 功能    ← added in the same commit as the code

src/xxx.ts:
// code changes for XXX feature
```

**No separate "update changelog" commits.** The changelog update is part of the feature/fix commit.

### Rule 2: Commit Message Format

```
<type>: <English description>

type: feat | fix | chore | refactor | perf
```

### Rule 3: Version Number Discipline

- **DO NOT** change version number or create tags during development
- **DO NOT** force-push tags
- Version bump + tag happens ONCE when all tasks in a Phase are complete
- Version format: `MAJOR.MINOR.PATCH` (semver)
- After version bump commit, create tag matching `package.json` version

### Rule 4: TDD Enforcement

- Define acceptance criteria (grep/Bash assertions) before implementation
- Implement minimum code to satisfy criteria
- Verify immediately with automated checks
- Only commit after all criteria pass

### Rule 6: Changelog Retention

**After a new version is released, remove old changelog entries.** Keep only the current version and the immediately previous version.

```
Before release v1.10.0:
  changelog.md contains: 1.10.0, 1.9.6, 1.9.5, 1.9.4, ...

After release v1.10.0:
  changelog.md contains: 1.10.0, 1.9.6   ← older entries removed

After release v1.11.0:
  changelog.md contains: 1.11.0, 1.10.0  ← only 2 most recent
```

- When removing a feature (e.g., sub-store, tutorial), remove ALL references
- Verify with `grep -rn "featureName" src/` before commit
- Check imports, types, IPC channels, preload whitelist, locale strings

## File Locations

| Purpose | Path |
|---|---|
| Changelog | `changelog.md` |
| Build Config | `electron-builder.yml` |
| CI/CD | `.github/workflows/build.yml` |
| Package | `package.json` |
| Types | `src/shared/types.d.ts` |
| Main Entry | `src/main/index.ts` |
| Config Template | `src/main/utils/template.ts` |
| Locales | `src/renderer/src/locales/*.json` |
