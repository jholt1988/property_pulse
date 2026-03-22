# Keyring OS Design System

This project uses the Keyring OS UI language as a **token-first** system.

## 1) Foundations

Token sources live in `lib/tokens/`:

- `color.ts`
- `spacing.ts`
- `radius.ts`
- `motion.ts`
- `typography.ts`
- `index.ts`

Compatibility export:
- `lib/tokens.ts` (legacy import surface + module accent classes)

Tailwind bridge:
- `tailwind.config.ts`

Global CSS vars:
- `app/globals.css`

## 2) Brand Intent

Keyring OS should feel like a **control plane for real-estate intelligence**:

- Analytical, technical, enterprise-ready
- Dark surfaces with restrained depth
- Color as signal (module + state), not decoration
- Motion for state change, not ornament

## 3) Color Contract

### Brand

- `brand.core` `#3B82F6`
- `brand.navy` `#0B1220`
- `brand.panel` `#111827`
- `brand.card` `#1F2937`
- `brand.gray` `#94A3B8`
- `brand.white` `#FFFFFF`

### Modules

- `module.core` `#3B82F6`
- `module.inspect` `#14B8A6`
- `module.lease` `#8B5CF6`
- `module.finance` `#10B981`
- `module.ai` `#22D3EE`
- `module.tenants` `#F59E0B`
- `module.properties` `#60A5FA`

### Semantic

- `semantic.success` `#10B981`
- `semantic.warning` `#F59E0B`
- `semantic.error` `#EF4444`
- `semantic.info` `#3B82F6`
- `semantic.pending` `#A78BFA`

## 4) Spacing / Radius / Motion

### Spacing

8-point system with tokens in `spacing.ts`.

### Radius

- `sm` 8
- `md` 12
- `lg` 16
- `xl` 20
- `2xl` 24

### Motion

- fast: 120ms
- base: 180ms
- slow: 260ms
- panel: 320ms

Easing:
- standard / entrance / exit in `motion.ts`

## 5) Typography

- Primary UI: **Inter**
- Display accent: **Space Grotesk**

Use `.font-display` for module/page headings that need product accent emphasis.

## 6) Component Architecture

Current key folders:

- `components/ui`
- `components/navigation`
- `components/layout`
- `components/data`
- `components/domain`
- `components/ai`
- `components/overlays`

P0 shared components available:

- `Button`
- `Badge`
- `StatusBadge`
- `AlertBlock`
- `MetricCard`
- `TableToolbar`
- `RightDrawerShell`
- `AIInsightCard`
- `ConfidenceBadge`

## 7) Authoring Rules

1. Prefer token classes/values over ad hoc hex.
2. Reuse shared components before creating one-off UI.
3. New reusable UI belongs in `components/*` with simple prop APIs.
4. Module color accents should map to `module.*` tokens.
5. Keep borders/subtle layers consistent (`--kr-border-primary`, `--kr-border-divider`).

## 8) Adding New Components (Checklist)

When adding a component:

- [ ] Uses existing tokens (color, spacing, radius, motion)
- [ ] Supports dark UI contrast
- [ ] Has semantic states where relevant
- [ ] Avoids hardcoded one-off styles
- [ ] Is reusable by at least one additional route

## 9) Regression Safety

Smoke tests:

```bash
npm run test:smoke
```

Build check:

```bash
npm run build
```

## 10) Future Enhancements

- Add charts token palette contract
- Add accessibility-specific token thresholds
- Add Storybook or visual snapshot tests for component variants
- Add light-mode token map if product requires dual theme
