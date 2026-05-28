# FreeTyping

A lightweight static typing app built with Vite, React, and TypeScript.

## Current Version

Official v0.1.0.

Implemented:

- Static Vite React TypeScript project
- Top bar region
- Native textarea editor region
- Editor adapter for programmatic text operations
- Clear and copy actions
- Opt-in local text saving
- Persistent input mode, keyboard panel visibility, mouse panel visibility, save-text setting, and theme
- System and English Direct input modes
- Structured Chinese Pinyin input mode
- Lazy-loaded Apache-2.0 Pinyin dictionary generated from `rime-pinyin-simp`
- Pinyin composition buffer and candidate row
- Space commit, number selection, arrow navigation, Backspace edit, and Escape cancel
- Frequency-ranked candidates
- Multi-syllable phrase lookup and segmented continuous Pinyin input
- Optional fuzzy Pinyin matching for `z/zh`, `c/ch`, `s/sh`, and `n/l`
- Chinese punctuation insertion in Pinyin mode
- Font size setting
- Import and export `.txt`
- Keyboard help menu
- High-contrast theme
- Responsive layout and reduced-motion handling
- Focused unit tests
- Typing stats
- Restore flow for accidental clear/import replacement
- User-visible copy/import/export status messages
- Browser smoke tests for editing, virtual keyboard, persistence, Pinyin, and layout screenshots
- Composition-aware editor event routing
- Virtual QWERTY keyboard with physical key highlighting
- Virtual key click insertion
- Virtual mouse click feedback
- Basic light and dark theme variables
- Accessible labels for the editor and controls

Not implemented yet:

- Full mobile optimization
- Full automated browser test coverage

## Requirements

- Node.js 20 or newer
- npm

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173/
```

## Build

```bash
npm run build
```

The static production files are written to:

```text
dist/
```

## Rebuild Pinyin Dictionary

```bash
npm run build:pinyin-dictionary
```

This downloads `pinyin_simp.dict.yaml` from `rime/rime-pinyin-simp`, parses it, and writes:

```text
public/data/pinyin-dictionary.json
```

The generated dictionary is loaded by the browser only when Chinese Pinyin mode is active.

## Preview Production Build

```bash
npm run preview
```

Open the local URL printed by Vite, usually:

```text
http://localhost:4173/
```

## Browser Smoke Test

```bash
npm run test:browser
```

This builds the app, starts a local preview server, runs headless Chrome checks, and writes layout screenshots to:

```text
test-artifacts/
```

## GitHub Pages Base Path

The tested static build is published from the `deploy` branch. The `main`
branch is used for current development and can contain newer untested work.

After testing a version, run the GitHub Pages workflow or publish a built
`dist/` folder to `deploy`.

The workflow builds with the repository base path:

```bash
GITHUB_PAGES_BASE=/freetyping/ npm run build
```

For local development and normal static hosting, no environment variable is needed.

## License

FreeTyping is released under the MIT License.

The generated Pinyin dictionary is built from `rime/rime-pinyin-simp`, which is
licensed under Apache License 2.0. Its attribution and license copy are kept in
`third_party/rime-pinyin-simp/`.

## V4 Manual Check

1. Run `npm install`.
2. Run `npm run dev`.
3. Open the Vite local URL.
4. Confirm the page shows:
   - top bar
   - Input Mode menu
   - File menu
   - Panel dropdown with Keyboard and Mouse checkboxes
   - Theme menu
   - toolbar buttons
   - plain text editor
   - virtual keyboard
   - virtual mouse
5. Type in the editor and confirm normal textarea typing works.
6. Select and replace text in the editor.
7. Use browser undo and redo.
8. Open the `Input Mode` menu and confirm `System Input` is first, followed by a divider.
9. Open the `File` menu and confirm it contains `Import`, `Export`, `Save text`, `About`, and `Help`.
10. Open the Panel dropdown and separately toggle Keyboard and Mouse.
11. Press physical keys and confirm matching virtual keys highlight when Keyboard is enabled.
12. Click virtual character keys and confirm text inserts into the editor.
13. Click inside the app and confirm the virtual mouse highlights when Mouse is enabled.
14. Switch input modes and refresh; confirm the selection persists.
15. Open the `Theme` menu, select `High contrast`, refresh, and confirm the theme persists.
16. Enable `Save text` from the `File` menu, type text, refresh, and confirm text restores.
17. Disable `Save text`, refresh, and confirm saved text is not restored.
18. Disable `Save text` and confirm persisted editor text is removed.
19. Select `Chinese Pinyin`.
20. Type `nihao`, then press `Space`; confirm `你好` is inserted.
21. Type `ni`, then press `Space`; confirm `你` is inserted.
22. Type `ni`, press `ArrowRight`, then press `Space`; confirm the second ranked candidate is inserted.
23. Type `shi`, press `ArrowDown`, then press `Space`; confirm a candidate from the final page is inserted.
24. Type `ni`, press `ArrowRight`, press `ArrowUp`, then press `Space`; confirm `你` is inserted.
25. Type `zz`, then press `Space`; confirm `zz` is inserted as plain text.
26. Type `ni`, then press `Backspace`; confirm the buffer changes to `n`.
27. Type `ni`, then press `Escape`; confirm the buffer disappears and editor text is unchanged.
28. Start a Pinyin buffer, switch to `System Input`, and confirm the buffer disappears.
29. Type `xianshi`, then press `Space`; confirm `显示` is inserted.
30. Type `womende`, then press `Space`; confirm `我们的` is inserted through segmentation.
31. Open `Input Mode`, enable `Fuzzy matching`, type `si`, then press `Space`; confirm `是` is inserted.
32. With `Chinese Pinyin` active and no buffer, press `.`; confirm `。` is inserted.
33. Change the `Font` value and confirm the editor text size changes.
34. Use `Import` with a `.txt` file and confirm the editor text is replaced.
35. Use `Export` and confirm a `.txt` file downloads.
36. Open `Help` and confirm the Pinyin key behavior is listed.
37. Confirm the stats bar updates character count, word count, WPM, and session time.
38. Click `Clear`, then click `Restore`; confirm the previous text returns.
39. Import a `.txt`, then click `Restore`; confirm the previous text returns.
40. Stop the dev server.
41. Run `npm run test`.
42. Run `npm run test:browser`.
43. Run `npm run build`.
44. Run `GITHUB_PAGES_BASE=/freetyping/ npm run build`.
45. Run `npm run preview`.
46. Open the preview URL and confirm the same V4 UI appears.

## Pinyin Data And Privacy

The current V4 Pinyin dictionary is generated from `rime/rime-pinyin-simp`, licensed under Apache License 2.0. The source attribution and license copy are kept in `third_party/rime-pinyin-simp/`.

The app also keeps a small built-in fallback dictionary and phrase layer in source code so Pinyin still works before the generated dictionary finishes loading.

Pinyin preferences are stored in local browser storage. Candidate lookup runs in the browser and does not send typed text to a server. FreeTyping does not store custom Pinyin dictionaries or learned phrases.
