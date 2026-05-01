# UPDATES.md — Ancient Book Portfolio Implementation Plan

## Context

Current build works but has several UX/animation problems: scroll zoom is choppy (rAF lerp with unbounded accumulator), page flip lacks a back face (blank during 90-180°), navigation only appears in NAVIGATION state (no way to navigate while zoomed in), post-flip always returns to PAGE_FOCUS (loses zoom-out context), book sizing doesn't respect exact viewport proportions when zoomed out, and no page corner rounding. User wants GSAP for smooth animations, real-feeling book page drag, bottom-of-screen mouse trigger for nav, and consistent zoom minimums.

---

## Phase 1: Dependencies & Cleanup

### 1.1 Install GSAP
```bash
npm install gsap
```

### 1.2 Remove dead dependency
```bash
npm uninstall svelte-motion
```
`svelte-motion` is installed but never imported. `@use-gesture/vanilla` stays — will be adopted for drag gestures.

### 1.3 Clean `src/lib/motion/variants.ts`
- Delete `coverOpen`, `pageFlip`, `zoomIn`, `zoomOut` objects (lines 1-31) — Framer Motion-style variants, never imported
- Keep `TIMING`, `staggerDelay`, easing constants

---

## Phase 2: State Machine Fixes — `src/lib/state/appState.ts`

### 2.1 Add `previousState` tracking
- Add `export const previousState = writable<AppState>('COVER')`
- In `transition()`: save `from` to `previousState` before setting new state
- In `completeFlip()`: transition to `NAVIGATION` if `previousState === 'NAVIGATION'`, else `PAGE_FOCUS`
- Update `VALID`: `FLIPPING: ['PAGE_FOCUS', 'NAVIGATION']`

### 2.2 Fix zoom minimum — consistent 0.55
- Change `clampZoom` line 62: `Math.max(0.55, Math.min(1, value))` (was 0.6)
- This matches Book.svelte's `ZOOM_MIN = 0.55`

### 2.3 Add `mouseNearBottom` store
- `export const mouseNearBottom = writable(false)`
- Set by Book.svelte on mousemove

---

## Phase 3: GSAP Scroll System — `src/lib/components/Book.svelte`

### 3.1 Replace lerp zoom with GSAP
Delete: `scrollAccum`, `lerpZoom()`, `startZoomLerp()`, `zoomAnimFrame`, lerp `$effect` cleanup

New approach:
- `targetZoom = $state(1)` — incremental target, never accumulates unboundedly
- `currentZoomSmooth = $state(1)` — GSAP-animated display value
- `zoomTween: gsap.core.Tween | null`
- `handleWheel()`: compute `delta = -e.deltaY * 0.001`, clamp targetZoom to [0.55, 1], kill previous tween, `gsap.to()` with `duration: 0.4, ease: 'power2.out'`, `onUpdate` writes `currentZoomSmooth`
- State transitions check on `onComplete`

### 3.2 Add mousemove for bottom detection
```typescript
function handleMouseMove(e: MouseEvent) {
  mouseNearBottom.set(e.clientY >= window.innerHeight * 0.85);
}
```
Add `<svelte:window onwheel={handleWheel} onmousemove={handleMouseMove} />`

---

## Phase 4: @use-gesture Drag-to-Flip — `src/lib/components/Book.svelte`

### 4.1 Replace manual pointer handlers with `@use-gesture/vanilla`
- `import { Drag } from '@use-gesture/vanilla'`
- In `$effect` after `bookEl` bound: create `new Drag(bookEl, { ... })`
- **NAVIGATION mode only** — drag-to-flip only works when zoomed out. Guard with `get(appState) === 'NAVIGATION'` check on `dragstart`
- `dragstart`: check edge zones (25% left/right), set `isDragging = true` or `cancel()`
- `drag`: map `state.delta[0]` to `dragFlipAngle` (max ±150°)
- `dragend`: use `state.velocity[0]` for flick (threshold 0.5) or `state.delta[0]` for distance (threshold 80px) → `navigateToPage()`
- Cleanup: `dragGesture?.destroy()` in `$effect` return

### 4.2 Keep `dragFlipAngle` on book transform
Already works — `isDragging` disables CSS transition during drag

---

## Phase 5: PageFlip 3D with GSAP — `src/lib/components/PageFlip.svelte`

### 5.1 Add front + back faces
Replace single `.flip-front` with:
```svelte
<div class="flip-face flip-front">{@render currentPage()}</div>
<div class="flip-face flip-back">{@render nextPage()}</div>
```
- `.flip-front`: `backface-visibility: hidden`
- `.flip-back`: `position: absolute; inset: 0; backface-visibility: hidden; transform: rotateY(180deg)`
- Remove `showNext` state — both faces always in DOM, `backface-visibility` handles visibility

### 5.2 Replace rAF with GSAP timeline
Delete: `animFrame`, `easeInOut()`, `showNext`, rAF `tick()` loop

New:
- `flipTimeline: gsap.core.Timeline | null`
- `startFlip()`: kill previous timeline, `gsap.timeline({ onComplete: completeFlip })`, `.to({ progress: 0 }, { progress: 1, duration: 0.6, ease: 'power2.inOut', onUpdate: ... })`
- `rotateY = $derived(flipProgress * 180)` (no custom easing — GSAP handles it)

### 5.3 Fix double perspective
Remove `perspective: 2500px` from `.flip-container` — it inherits from `.book-container` (2000px). Double perspective causes distortion.

---

## Phase 6: Page Sizing & Corners — `src/lib/components/Page.svelte` + `Book.svelte`

### 6.1 Exact viewport proportions when zoomed out
In `Book.svelte`, change `.book` sizing:
- NAVIGATION/FLIPPING: `width: 55vmin; height: 73vmin;` (maintains ~4:3 book ratio)
- PAGE_FOCUS: `width: 100%; height: 100%;`
- Add width/height to `bookStyle` derived with transitions

### 6.2 Constrain page content height for scrolling
In `Page.svelte`:
- `.page`: change `min-height: 100%` → `height: 100%` (constrain, not grow)
- `.content`: add `height: 100%` so overflow scrolling works at zoom=1

### 6.3 Round page corners
In `Page.svelte`:
- `.page`: add `border-radius: 4px`
- `.paper-base`, `.paper-vignette`, `.paper-grain`: add `border-radius: inherit`

### 6.4 Fix paper-base background-size
- Change `background-size: cover` → `background-size: 100% 100%` (stretch to fill page, not tile-breaking `cover`)

---

## Phase 7: Navigation Island — `src/lib/components/NavigationIsland.svelte`

### 7.1 Mouse-bottom trigger
- Import `mouseNearBottom` from appState
- Subscribe: `let nearBottom = $state(false); mouseNearBottom.subscribe(v => nearBottom = v)`
- `visible = $derived(currentState === 'NAVIGATION' || nearBottom)`

### 7.2 Fix DOM destruction — remove `{#if visible}`
Replace `{#if visible}` block with always-rendered element:
```svelte
<div class="side-nav" class:visible={visible}>
```
The CSS already handles `opacity: 0` → `opacity: 1` transition. Always in DOM = exit transitions work.

### 7.3 Content scroll behavior
Already handled by Page.svelte `.content` overflow. When at zoom=1 (PAGE_FOCUS), the content div fills viewport and `overflow: auto` works. Navigation stays on side. Horizontal/vertical scroll inside content, not whole page.

---

## Phase 8: Cover Improvements — `src/lib/components/Cover.svelte`

### 8.1 Brighter title
- Increase gradient brightness: `#ffe4a0` → `#fff0b0`, `#f5c842` → `#f5d060`, `#daa520` → `#e8b830`
- Increase `filter: brightness(1.2)` → `brightness(1.4)`
- Shivaraja font already set — confirmed

### 8.2 Cover flip depth (already done)
- `transform-origin: left center` ✓
- `backface-visibility: hidden` ✓
- Spine shadow ✓
- Page edge stack ✓
- 4:3 aspect ratio ✓

---

## Phase 9: Dead Code Final Sweep

### 9.1 Files to clean
| File | Remove |
|------|--------|
| `variants.ts` | `coverOpen`, `pageFlip`, `zoomIn`, `zoomOut` objects |
| `Book.svelte` | `scrollAccum`, `lerpZoom()`, `startZoomLerp()`, `zoomAnimFrame`, old pointer handlers |
| `PageFlip.svelte` | `showNext`, `easeInOut()`, `animFrame`, rAF `tick()` |

### 9.2 Verify no broken imports
- `variants.ts` exports used: `TIMING` (Cover.svelte, PageFlip.svelte)
- Deleted variant objects have no importers

---

## Files Modified (ordered)

1. `package.json` — add `gsap`, remove `svelte-motion`
2. `src/lib/state/appState.ts` — previousState, mouseNearBottom, fix clampZoom, VALID transitions
3. `src/lib/motion/variants.ts` — remove dead variant objects
4. `src/lib/components/Book.svelte` — GSAP scroll, @use-gesture drag, mousemove, page sizing
5. `src/lib/components/PageFlip.svelte` — dual faces, GSAP timeline, remove rAF
6. `src/lib/components/Page.svelte` — border-radius, height constraint, background-size fix
7. `src/lib/components/NavigationIsland.svelte` — mouseNearBottom trigger, remove {#if}
8. `src/lib/components/Cover.svelte` — brighter title gradient

---

## Verification

1. `npm run build` — must pass (adapter-static, prerender)
2. `npm run dev` — must start without errors
3. Scroll zoom — smooth, no choppiness, reversible after heavy scrolling
4. Page flip — front face visible 0-90°, back face visible 90-180°, no blank space
5. Flip while zoomed out — returns to NAVIGATION, not PAGE_FOCUS
6. Navigation island — appears on mouse near bottom (even in PAGE_FOCUS), exits smoothly
7. Page corners — rounded at all zoom levels
8. Zoomed-out page — exact vmin proportions, no overflow
9. Content scroll — works at zoom=1, horizontal and vertical
10. Cover title — brighter, Shivaraja font, golden gradient visible on dark bg
