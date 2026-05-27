# FreeTyping

A lightweight static typing app built with Vite, React, and TypeScript.

## Current Version

V2 product hardening slice.

Implemented:

- Static Vite React TypeScript project
- Top bar region
- Native textarea editor region
- Editor adapter for programmatic text operations
- Clear and copy actions
- Opt-in local text saving
- Persistent input mode, keyboard panel visibility, mouse panel visibility, save-text setting, and theme
- System and English Direct input modes
- Minimal Chinese Pinyin input mode
- Pinyin composition buffer and candidate row
- Space commit, number selection, arrow navigation, Backspace edit, and Escape cancel
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

- Larger Chinese Pinyin dictionary
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

The app deploys to GitHub Pages through `.github/workflows/pages.yml` on every push to `main`.
The workflow builds with the repository base path:

```bash
GITHUB_PAGES_BASE=/freetyping/ npm run build
```

For local development and normal static hosting, no environment variable is needed.

## V2 Manual Check

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
9. Open the `File` menu and confirm it contains `Import`, `Export`, `Save text`, and `Clear Saved`.
10. Open the Panel dropdown and separately toggle Keyboard and Mouse.
11. Press physical keys and confirm matching virtual keys highlight when Keyboard is enabled.
12. Click virtual character keys and confirm text inserts into the editor.
13. Click inside the app and confirm the virtual mouse highlights when Mouse is enabled.
14. Switch input modes and refresh; confirm the selection persists.
15. Open the `Theme` menu, select `High contrast`, refresh, and confirm the theme persists.
16. Enable `Save text` from the `File` menu, type text, refresh, and confirm text restores.
17. Disable `Save text`, refresh, and confirm saved text is not restored.
18. Use `Clear Saved` from the `File` menu to remove persisted editor text.
19. Select `Chinese Pinyin`.
20. Type `nihao`, then press `Space`; confirm `你好` is inserted.
21. Type `ni`, then press `2`; confirm `尼` is inserted.
22. Type `ni`, press `ArrowRight`, then press `Space`; confirm `尼` is inserted.
23. Type `ni`, press `ArrowDown`, then press `Space`; confirm `尼` is inserted.
24. Type `ni`, press `ArrowRight`, press `ArrowUp`, then press `Space`; confirm `你` is inserted.
25. Type `zz`, then press `Space`; confirm `zz` is inserted as plain text.
26. Type `ni`, then press `Backspace`; confirm the buffer changes to `n`.
27. Type `ni`, then press `Escape`; confirm the buffer disappears and editor text is unchanged.
28. Start a Pinyin buffer, switch to `System Input`, and confirm the buffer disappears.
29. Change the `Font` value and confirm the editor text size changes.
30. Use `Import` with a `.txt` file and confirm the editor text is replaced.
31. Use `Export` and confirm a `.txt` file downloads.
32. Open `Help` and confirm the Pinyin key behavior is listed.
33. Confirm the stats bar updates character count, word count, WPM, and session time.
34. Click `Clear`, then click `Restore`; confirm the previous text returns.
35. Import a `.txt`, then click `Restore`; confirm the previous text returns.
36. Stop the dev server.
37. Run `npm run test`.
38. Run `npm run test:browser`.
39. Run `npm run build`.
40. Run `GITHUB_PAGES_BASE=/freetyping/ npm run build`.
41. Run `npm run preview`.
42. Open the preview URL and confirm the same V2 UI appears.
