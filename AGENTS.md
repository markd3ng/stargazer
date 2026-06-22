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

## Code Style & Architecture (Rule 7)

### File & Directory Conventions
- File naming: `kebab-case` (e.g. `connection-table.tsx`, `proxy-item.tsx`)
- One component per file, file named after the component
- `src/renderer/src/components/` groups by domain: `proxies/`, `profiles/`, `settings/`, etc.
- Hooks: `use-` prefix (e.g. `use-app-config.tsx`)
- Pages: flat in `src/renderer/src/pages/`, named after the route (e.g. `connections.tsx`)

### Component Patterns
- Function components + Hooks only. No class components.
- Prefer Tailwind utility classes over custom CSS files.
- Keep components focused — extract reusable logic into hooks.

### IPC Discipline
- All IPC handlers registered centrally in `src/main/utils/ipc.ts` (flat map pattern).
- **Before adding a new IPC channel**, register it in all three allowlists in `src/preload/index.ts`:
  - `validInvokeChannels` — for `invoke` calls
  - `validListenChannels` — for `on` event listeners
  - `validSendChannels` — for `send` calls
- Renderer accesses IPC exclusively through the typed Proxy in `src/renderer/src/utils/ipc.ts`.

## Tech Stack Constraints (Rule 8)

### Allowed Libraries
- **UI Framework**: HeroUI (`@heroui/react`) only. Do NOT add Ant Design, MUI, or any other UI framework.
- **State Management**: SWR v2 + React Context only. Do NOT add Redux, Zustand, or other state managers.
- **Animation**: framer-motion (already used). No additional animation libraries.
- **Editor**: Monaco Editor (already used). No alternative editors.
- **Styling**: Tailwind CSS v4 only (zero-config via `@tailwindcss/vite`).

### Package Management
- **pnpm only**. Do NOT commit `package-lock.json` or `yarn.lock`.
- New dependency proposals MUST include:
  - The specific problem it solves
  - Why existing libraries cannot handle it
  - Security check (known CVEs)
- Prioritize pure JS/TS solutions over native modules.

### Electron Security (HARD REQUIREMENT)
- Keep `contextIsolation: true` — never set to `false`.
- Keep `nodeIntegration: false` — never set to `true`.
- `sandbox: false` is allowed only for native modules (sysproxy-rs).
- Preload script must use `contextBridge.exposeInMainWorld` — never expose `ipcRenderer` directly.

## TypeScript Strictness (Rule 9)
- `tsconfig.json` MUST have `"strict": true` enabled.
- ESLint rules:
  - `no-explicit-any`: **error** (not warn)
  - `explicit-function-return-type`: enabled for new files
  - `no-non-null-assertion`: **error**
  - `no-unused-vars`: **error**
- Legacy code may be exempted temporarily with `// TODO: strict-fix` comment, but must be migrated.

## Testing Strategy (Rule 10)

### Framework & Setup
- **Vitest** is the test framework (Vite-native, aligned with the build toolchain).
- Commands:
  - `pnpm test` — watch mode (development)
  - `pnpm test:run` — CI mode (single run)

### Coverage Priority (Phase 1)
1. Utility functions in `src/**/utils/*.ts`
2. IPC invocation layer (`src/renderer/src/utils/ipc.ts`)
3. Shared logic (`src/shared/`)

### File Placement
- Test files go in `__tests__/` subdirectory next to the source file:
  ```
  src/renderer/src/utils/
    ipc.ts
    __tests__/ipc.test.ts
  ```

## Internationalization (Rule 11)

### Key Conventions
- Format: `module.submodule.description` (e.g. `mihomo.error.coreStartFailed`, `common.error.initFailed`)
- Supported languages (5): `zh-CN`, `zh-TW`, `en-US`, `ru-RU`, `fa-IR`
- Default fallback: `en-US`

### Adding a Language
1. Create JSON file in `src/renderer/src/locales/<locale>.json`
2. Register in `src/shared/i18n.ts` resources
3. Ensure all existing keys are translated (or at minimum fill `en-US` values as TODO)

### Rules
- **NEVER** hardcode UI text in components — always use `t()` from react-i18next.
- When adding/modifying a key, update ALL 5 locale files in the same commit.
- Use `en-US` as the reference; other locales may lag with `// TODO` markers.

## Security Policy (Rule 12)

### IPC Security
- Three allowlists in `src/preload/index.ts` are the gate — every channel must be listed before use (see Rule 7 IPC Discipline).
- All IPC handler arguments MUST be type-validated. Never pass input directly to `eval()`, `exec()`, or shell commands.

### External Links
- Renderer MUST open external URLs via `shell.openExternal` (IPC to main process).
- **NEVER** use `window.open()` or direct navigation for external URLs.

### CSP & Content Security
- Modify CSP headers in `index.html` / `floating.html` only with security review.
- Keep `'unsafe-inline'` only for Tailwind (`style-src`).
- Do NOT add `'unsafe-eval'` or relax `script-src`.

### Dependency Security
- Before adding a new npm dependency, check for known vulnerabilities (`pnpm audit`).
- Prefer well-maintained libraries with >weekly downloads and <30d since last publish.

## Release & Build Process (Rule 13)

### CI/CD
- GitHub Actions: `v*` tag push triggers full build (Windows x64+arm64, Linux x64+arm64, macOS arm64).
- Manual dispatch publishes to `dev` prerelease.
- No other trigger patterns.

### Pre-release Checklist
- [ ] Version bumped in `package.json` (semver)
- [ ] `changelog.md` complete for this version
- [ ] `pnpm review` passes (format + lint + typecheck)
- [ ] All platform builds succeed in CI
- [ ] Checksum files generated
- [ ] Release notes drafted

### Auto-Updater
- Keep the custom update mechanism (`src/main/resolve/autoUpdater.ts` + `scripts/updater.mjs`).
- Do NOT introduce `electron-updater` or other update frameworks.
- `latest.yml` is generated by `scripts/updater.mjs` and published alongside release artifacts.

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
| IPC Handlers | `src/main/utils/ipc.ts` |
| Preload Whitelist | `src/preload/index.ts` |
| Auto-Updater | `src/main/resolve/autoUpdater.ts` |
| Tests | `src/**/__tests__/*.test.ts` |
