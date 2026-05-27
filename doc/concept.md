# Static Typing Web App — Refined Implementation Plan

## 1. Goal

Build a lightweight, static, browser-native typing app that lets users:

- Type and edit plain text in a focused editor.
- Use normal system IMEs without interference.
- Optionally select in-app web input modes, such as Chinese Pinyin.
- Visualize keyboard and mouse input through an optional virtual input panel.
- Deploy the app as static files, including GitHub Pages support.

The V1 priority is reliable text editing, clean architecture, static deployment, and a modular foundation for future input methods.

Chinese Pinyin should be planned from the beginning but implemented after the editor, event routing, persistence, and virtual input panel are stable. For V1, Chinese Pinyin may exist as a selectable placeholder mode. The first real Pinyin implementation belongs in V1.1 unless the V1 fundamentals are already complete and tested.

---

## 2. Core Principles

- **Static-first:** no backend for V1.
- **Plain text only:** use a native `<textarea>` initially.
- **IME-safe:** never interrupt native composition events.
- **Modular input modes:** each web input method is a separate module.
- **Separated concerns:** text insertion, input-mode logic, and visual feedback stay independent.
- **Minimal dependencies:** start with React state, hooks, and simple CSS.
- **Static-host compatible:** build output must work from root or subpath deployment.
- **Privacy-conscious persistence:** saving typed text locally must be explicit and easy to disable or clear.
- **Native behavior first:** browser editing, selection, undo/redo, paste, and native IME behavior take priority over custom features.

---

## 3. Recommended Stack

```text
Vite + React + TypeScript
```

Use plain CSS for V1. Avoid heavy UI frameworks, CSS-in-JS, and global state libraries unless the project grows beyond V1 needs.

Suggested style files:

```text
src/styles/
  base.css
  layout.css
  components.css
  themes.css
```

---

## 4. App Layout

```text
+--------------------------------------------------+
| Top Bar                                          |
+--------------------------------------------------+
| Main Text Editor                                 |
| Native textarea for plain-text typing            |
+--------------------------------------------------+
| Optional Virtual Keyboard / Mouse Panel          |
+--------------------------------------------------+
```

### Top Bar Controls

Required for V1:

- App title
- Input mode selector
- Show/hide virtual input panel
- Clear text
- Copy text
- Theme toggle

Optional later:

- Font size
- Keyboard layout selector
- Import/export `.txt`
- Typing stats
- Input-method-specific settings

---

## 5. Project Structure

```text
src/
  app/
    App.tsx
    appState.ts
    config.ts

  components/
    TopBar/
    TextEditor/
    InputModeSelector/
    VirtualInputPanel/
      VirtualKeyboard.tsx
      VirtualMouse.tsx

  input/
    types.ts
    inputManager.ts
    textInsertion.ts
    composition.ts
    modes/
      systemInput.ts
      englishDirect.ts
      chinesePinyin/
        index.ts
        dictionary.ts
        candidates.ts

  keyboard/
    types.ts
    layouts/qwerty.ts
    keyNormalize.ts

  mouse/
    types.ts

  hooks/
    useKeyboardTracker.ts
    useMouseTracker.ts
    useLocalStorageState.ts

  utils/
    editorAdapter.ts
    clipboard.ts

  styles/
    base.css
    layout.css
    components.css
    themes.css

  main.tsx
```

---

## 6. Core State

```ts
type AppState = {
  inputModeId: string;
  virtualPanelVisible: boolean;
  activeKeys: Set<string>;
  activeMouseButtons: Set<string>;
  theme: 'light' | 'dark';
  saveTextLocally: boolean;
};
```

The textarea should own its live value during active typing. Sync text to app state/localStorage on `input`, `blur`, autosave debounce, and explicit actions.

Important state boundary:

- The DOM textarea value is the source of truth for committed editor text.
- React state may mirror the text for persistence, counters, and explicit actions, but should not re-render over active typing unless necessary.
- Visual input state, such as active keys and mouse buttons, must stay independent from text input state.

---

## 7. Text Editor Implementation

Use a semi-controlled native `<textarea>` for V1.

Requirements:

- Preserve typing, selection, copy/paste, undo/redo, and native IME behavior.
- Treat the DOM textarea as the source of truth while editing.
- Use an adapter for all programmatic text operations.
- Prefer native browser editing APIs for insertion so the undo stack behaves as normally as possible.
- Avoid direct `textarea.value = ...` writes during active editing except for explicit full-document actions such as clear, import, restore, or reset.

```ts
type EditorAdapter = {
  getValue(): string;
  setValue(value: string): void;
  getSelection(): { start: number; end: number };
  setSelection(start: number, end: number): void;
  focus(): void;
  insertText(text: string): void;
};
```

Centralize insertion logic:

```ts
export function insertTextAtSelection(params: {
  value: string;
  insertText: string;
  selectionStart: number;
  selectionEnd: number;
}): {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};
```

Programmatic insertion strategy:

1. Use `textarea.setRangeText()` for virtual key clicks and web input modes when replacing a known selection.
2. Dispatch a normal `input` event after adapter-driven insertion so persistence and derived UI update through the same path as native typing.
3. Preserve focus and selection after insertion.
4. Test undo/redo after every programmatic insertion path.
5. Use direct value replacement only for explicit whole-text actions.

---

## 8. Input Mode Architecture

Define a stable input-mode interface early.

```ts
export type InputContext = {
  text: string;
  selectionStart: number;
  selectionEnd: number;
};

export type InputResult = {
  text?: string;
  selectionStart?: number;
  selectionEnd?: number;
  handled: boolean;
  preventDefault?: boolean;
};

export type InputMode = {
  id: string;
  label: string;
  language?: string;
  description?: string;
  onBeforeInput?: (event: InputEvent, context: InputContext) => InputResult | null;
  onKeyDown?: (event: KeyboardEvent, context: InputContext) => InputResult | null;
  onCompositionStart?: (event: CompositionEvent, context: InputContext) => void;
  onCompositionUpdate?: (event: CompositionEvent, context: InputContext) => void;
  onCompositionEnd?: (event: CompositionEvent, context: InputContext) => InputResult | null;
};
```

Mode-specific UI state, such as a Pinyin buffer, candidate list, and selected candidate index, should live inside that input mode/controller. The shared editor should only consume generic render metadata and committed insertion results.

Initial modes:

```ts
export const systemInputMode: InputMode = {
  id: 'system',
  label: 'System Input',
};

export const englishDirectInputMode: InputMode = {
  id: 'en-direct',
  label: 'English Direct',
  language: 'en',
};

export const chinesePinyinInputMode: InputMode = {
  id: 'zh-pinyin',
  label: 'Chinese Pinyin',
  language: 'zh-CN',
};
```

### Event Handling Rules

Use layered browser event handling:

1. `compositionstart/update/end` — track native IME state.
2. `beforeinput` — intercept only when a web input mode must transform input.
3. `input` — final source of truth for committed text.
4. `keydown` — shortcuts, web input mode commands, and visual keyboard tracking.

Rules:

- Do not transform text while native composition is active.
- Never rely on a single browser event type.
- Prevent default browser behavior only when a mode explicitly handles the event.
- System input mode should not transform text.
- The `input` event must remain the final authority for text committed by the browser.
- `beforeinput` and `keydown` should not mutate text in system input mode.
- Visual keyboard tracking must not depend on the active input mode.
- Web input modes may intercept `keydown` only for mode commands such as candidate selection, commit, cancel, or buffer editing.

---

## 9. Virtual Keyboard

Represent keyboard layouts as data.

```ts
export type VirtualKey = {
  code: string;
  label: string;
  width?: number;
};

export type KeyboardLayout = {
  id: string;
  label: string;
  rows: VirtualKey[][];
};
```

V1 requirements:

- Render a QWERTY layout.
- Track physical `keydown`/`keyup` using `event.code`.
- Highlight matching virtual keys.
- Support virtual key clicks for simple character insertion.
- Prevent textarea blur on virtual key mouse down.
- Return focus to the textarea after virtual input.

Important distinction:

- Use `event.code` for physical key position.
- Use `event.key` only when character meaning is needed.
- Do not assume physical keys always map to Latin characters.
- Physical key tracking is visual feedback only.
- Virtual key clicks may insert text, but only through the editor adapter.

---

## 10. Virtual Mouse

V1 requirements:

- Render left, middle, and right mouse regions.
- Highlight real mouse clicks inside the app area.
- Animate virtual mouse button clicks.
- Do not globally disable the browser context menu.

```ts
export type MouseButtonId = 'left' | 'middle' | 'right';
```

---

## 11. Local Persistence

Use `localStorage` for V1.

Persist:

- Text, only when `saveTextLocally` is enabled
- Selected input mode
- Virtual panel visibility
- Theme

Implementation notes:

- Debounce text persistence.
- Make local text saving opt-in for V1, because typed content may be sensitive.
- Add a clear saved text action separate from clearing the editor.
- Clear text should ask for confirmation or support immediate undo/recovery.
- Do not persist an active web input composition buffer.

```ts
function useLocalStorageState<T>(key: string, initialValue: T): [T, (value: T) => void];
```

---

## 12. Chinese Pinyin Prototype

Build this after the editor, input manager, persistence, and virtual input panel are stable. Treat it as V1.1 by default.

V1 behavior:

1. User selects `Chinese Pinyin`.
2. Letter keys build a pinyin buffer.
3. Candidate row appears while composing.
4. `Space` commits the first candidate.
5. Number keys select candidates.
6. `Backspace` edits the pinyin buffer.
7. `Escape` cancels composition.
8. Unknown pinyin can be committed as plain text.

State ownership:

- The Pinyin mode owns its buffer, candidate list, and selected candidate index.
- The shared editor owns only committed text.
- Switching away from Pinyin cancels the active Pinyin buffer without changing committed text.
- Native system IME composition always takes priority over web Pinyin handling.

Minimal dictionary:

```ts
const dictionary = {
  ni: ['你', '尼'],
  hao: ['好', '号'],
  nihao: ['你好'],
  zhong: ['中'],
  guo: ['国'],
  zhongguo: ['中国'],
};
```

Acceptance checks:

- `nihao` + `Space` inserts `你好`.
- Candidate row appears while composing.
- Number selection works.
- Escape cancels composition.
- Unknown input does not break typing.

---

## 13. Accessibility and Usability

V1 requirements:

- Textarea has an accessible label.
- Buttons have accessible names.
- Virtual keys are real buttons.
- Virtual key clicks preserve focus and selection.
- App works with keyboard-only navigation.
- Layout is comfortable on desktop and tablet.

Nice-to-have:

- Font size setting
- High-contrast theme
- Reduced motion support
- Mobile layout improvements

Mobile scope:

- V1 should be responsive enough to use on smaller screens.
- V1 does not need to be a fully optimized mobile typing tool.
- Avoid custom behavior that conflicts with native mobile keyboards.

---

## 14. Deployment

Build output must be fully static.

```bash
npm run build
```

Expected output:

```text
dist/
  index.html
  assets/
```

For GitHub Pages, configure the Vite base path:

```ts
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/repo-name/' : '/',
});
```

The app should work on static hosts such as GitHub Pages, Cloudflare Pages, Netlify, Vercel static output, nginx, Apache, or Caddy.

---

## 15. Implementation Milestones

### Milestone 1 — App Shell

Tasks:

1. Create Vite + React + TypeScript project.
2. Configure static build output and GitHub Pages-compatible base path.
3. Add base styles and three-region layout.
4. Add top bar, editor area, and optional virtual panel container.
5. Confirm `npm run dev`, `npm run build`, and `npm run preview` work.

Done when the static app shell renders correctly and builds successfully.

Acceptance checks:

- App loads from the Vite dev server.
- Production build completes.
- Preview build loads without missing assets.
- Layout shows top bar, editor region, and virtual panel region.

---

### Milestone 2 — Text Editor

Tasks:

1. Create `TextEditor` with a semi-controlled `<textarea>`.
2. Add `EditorAdapter`.
3. Add clear and copy actions.
4. Add debounced local persistence.
5. Verify native typing, selection, paste, undo/redo, and system IME.

Done when text editing behaves like a normal browser textarea and survives refresh when persistence is enabled.

Acceptance checks:

- Type `abc`, undo once restores the previous value.
- Select `bc` in `abc`, insert `x`, and get `ax`.
- Paste text into the textarea.
- Clear text through the UI.
- Copy text through the UI.
- Refresh restores text only when local saving is enabled.

---

### Milestone 3 — Input Modes

Tasks:

1. Add input mode types and `inputManager`.
2. Implement system, English direct, and Chinese Pinyin placeholder modes.
3. Add input mode selector.
4. Persist selected mode.
5. Route events without breaking native input.

Done when users can switch modes and all placeholder modes keep typing stable.

Acceptance checks:

- System input mode never transforms text.
- English direct mode behaves like normal typing.
- Chinese Pinyin placeholder mode does not intercept or corrupt text.
- Switching modes does not change existing editor text.

---

### Milestone 4 — IME Safety

Tasks:

1. Track composition lifecycle.
2. Block app-level transformations during native composition.
3. Test English and CJK system IMEs.
4. Confirm no duplicated text or cursor corruption.

Done when native IME input remains reliable across supported browsers.

Acceptance checks:

- Native CJK composition does not duplicate committed text.
- Cursor position remains correct after composition ends.
- Web input transformations are skipped while native composition is active.
- System input mode remains compatible with browser spellcheck, paste, undo, and redo.

---

### Milestone 5 — Virtual Keyboard

Tasks:

1. Define keyboard layout data.
2. Render QWERTY keyboard.
3. Track physical key press/release.
4. Add key highlighting.
5. Add basic virtual key insertion.
6. Preserve textarea focus, selection, undo behavior, and IME state.

Done when physical and virtual keyboard interactions are visually reflected and simple virtual typing works.

Acceptance checks:

- Pressing a physical key highlights the matching virtual key.
- Releasing the physical key removes the highlight.
- Clicking a virtual character key inserts at the current selection.
- Virtual key mouse down does not blur the textarea.
- Undo works after virtual key insertion.

---

### Milestone 6 — Virtual Mouse

Tasks:

1. Define mouse button model.
2. Render virtual mouse.
3. Highlight left, middle, and right clicks.
4. Add virtual click animations.
5. Avoid global context-menu blocking.

Done when mouse interaction feedback works without disrupting normal browser behavior.

Acceptance checks:

- Left, middle, and right clicks are represented visually.
- Right click still allows normal browser context-menu behavior where appropriate.
- Mouse feedback only reflects app-area interaction.

---

### Milestone 7 — Settings and Polish

Tasks:

1. Add theme toggle.
2. Add font size setting.
3. Add show/hide virtual panel setting.
4. Add import/export `.txt`.
5. Improve responsive layout.
6. Add keyboard shortcut help.
7. Add clear saved text action.

Done when settings persist and the app feels practical for regular use.

Acceptance checks:

- Theme, font size, and virtual panel visibility survive refresh.
- Import replaces editor text intentionally.
- Export downloads the current editor text as `.txt`.
- Clear saved text removes persisted text without requiring editor text to be cleared first.

---

### Milestone 8 — Testing

Unit tests:

- Text insertion helper
- Editor adapter insertion behavior
- Input mode selection
- Keyboard code normalization
- Local storage state parsing and fallback

Manual tests:

- English system typing
- CJK system IME typing
- Paste, undo, redo
- Select and replace text
- Virtual keyboard clicks
- Virtual mouse clicks
- Refresh and persistence recovery
- Root and subpath static preview behavior

Target browsers:

- Chrome/Chromium
- Firefox
- Safari, if available
- Android Chrome for basic responsive behavior, if mobile support matters

---

### Milestone 9 — Chinese Pinyin Prototype

Tasks:

1. Add `input/modes/chinesePinyin/`.
2. Add minimal dictionary and candidate lookup.
3. Track pinyin buffer inside the Pinyin mode/controller.
4. Render composition preview and candidate row.
5. Support `Space`, number selection, `Backspace`, and `Escape`.
6. Cancel the Pinyin buffer when switching modes.

Done when the minimal Pinyin flow works without affecting system IME mode.

Acceptance checks:

- `nihao` + `Space` inserts `你好`.
- Candidate row appears while composing.
- Number selection works.
- `Escape` cancels composition without changing committed text.
- Unknown input can be committed as plain text.
- Native system IME mode remains unaffected.

---

## 16. First Coding Session Order

1. Create Vite + React + TypeScript app.
2. Add GitHub Pages-compatible build config.
3. Add three-region layout.
4. Add textarea editor and top bar controls.
5. Add opt-in localStorage persistence.
6. Add input mode selector with system, English, and Chinese placeholder modes.
7. Run `npm run build`.
8. Add virtual keyboard layout data and rendering.
9. Track physical key presses.
10. Add virtual mouse component.
11. Run `npm run build` again.

Stop before implementing the real Chinese input method.

---

## 17. V1 Definition of Done

V1 is complete when:

- The app is fully static and deployable to GitHub Pages.
- Users can type and edit plain text reliably.
- Native system IMEs work normally.
- Users can switch input modes.
- Chinese Pinyin exists as a placeholder mode.
- Virtual keyboard reacts to physical key presses.
- Virtual mouse reacts to mouse clicks.
- Settings persist locally.
- Text persists locally only when the user enables local saving.
- Users can clear saved text.
- The codebase is modular enough to add more input methods later.
- `npm run build` passes.

## 18. V1.1 Definition of Done

V1.1 is complete when:

- Chinese Pinyin has a minimal working dictionary-backed prototype.
- `nihao` + `Space` inserts `你好`.
- Candidate number selection works.
- `Backspace` edits the active Pinyin buffer.
- `Escape` cancels the active Pinyin buffer.
- Unknown Pinyin can be committed as plain text.
- Switching modes cancels uncommitted Pinyin state without changing committed text.
- Native system IME behavior remains reliable.
