# Version Plan

## v0.1.0

Official first release.

Main work:

1. Build a static Vite, React, and TypeScript typing workspace.
2. Add a native textarea editor with clear, copy, import, export, font size, and recovery flows.
3. Add opt-in local text saving with explicit privacy behavior.
4. Add system input, English direct input, and browser-based Chinese Pinyin input.
5. Add lazy-loaded real Pinyin dictionary data generated from Apache-2.0 `rime-pinyin-simp`.
6. Add Pinyin candidate ranking, segmentation, pagination, arrow navigation, number selection, fuzzy matching, and Chinese punctuation.
7. Add foldable `# title` text sections with mixed English and Chinese title spacing.
8. Add virtual QWERTY keyboard and mouse feedback panels.
9. Add typing stats with timer controls.
10. Add light, dark, and high-contrast themes.
11. Add responsive, bottom-anchored virtual panel layout.
12. Add File, Edit, Input Mode, Panel, Theme, About, and Help menu surfaces.
13. Add unit, browser smoke, accessibility, bundle, and static-host checks.
14. Release under MIT License.
15. Publish tested static build from the `deploy` branch.

Completed plan files:

- `plan/0-1-0/v0.md`
- `plan/0-1-0/v1.md`
- `plan/0-1-0/v1.1.md`
- `plan/0-1-0/v1.2.md`
- `plan/0-1-0/v2.md`
- `plan/0-1-0/v3.md`
- `plan/0-1-0/v4.md`

## v0.2.0

Multi-layout overlay input release.

Main work:

1. Add optional realistic input panel appearance with shared skins.
2. Add Classic light, Dark mechanical, Natural wood, and High contrast panel skins.
3. Keep realistic panel skins independent from the app theme.
4. Replace language-specific top-level input modes with `System Input` and `Overlay Input`.
5. Make overlay behavior depend on the selected panel layout.
6. Add `QWERTY`, `Pinyin (CN)`, `Nordic (SE/FI)`, `Nordic (NO)`, and `Nordic (DK)` layouts.
7. Remove the combined Nordic layout and merge only identical real-life Nordic mappings.
8. Add physical and virtual key mapping for country-specific Nordic layouts.
9. Preserve the existing Chinese Pinyin candidate, segmentation, fuzzy matching, and punctuation behavior under `Overlay Input` plus `Pinyin (CN)`.
10. Add migration handling for old v0.2.0 development input-mode and layout values.
11. Update Help text to describe general System/Overlay input behavior.
12. Add unit, browser smoke, accessibility, bundle, and static-host coverage for the new behavior.

Completed plan files:

- `plan/0-2-0/v1.md`
- `plan/0-2-0/v2.md`
- `plan/0-2-0/v3.md`
