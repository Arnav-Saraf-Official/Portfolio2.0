<script lang="ts">
	import {
		appState,
		pageIndex,
		targetPageIndex,
		zoom,
		clampZoom,
		enterNavigation,
		exitNavigation,
		navigateToPage,
		initFromUrl,
		onPopState,
		mouseNearBottom,
		previousState,
		PAGES
	} from '$lib/state/appState';
	import type { AppState } from '$lib/state/appState';
	import { get } from 'svelte/store';
	import gsap from 'gsap';
	import { DragGesture } from '@use-gesture/vanilla';
	import Cover from './Cover.svelte';
	import Page from './Page.svelte';
	import PageFlip from './PageFlip.svelte';
	import NavigationIsland from './NavigationIsland.svelte';
	import HomePage from './pages/HomePage.svelte';
	import ProjectsPage from './pages/ProjectsPage.svelte';
	import AboutPage from './pages/AboutPage.svelte';

	const componentMap: Record<string, any> = {
		home: HomePage,
		projects: ProjectsPage,
		about: AboutPage
	};

	function getPageComponent(idx: number) {
		const pageId = PAGES[idx];
		return componentMap[pageId] ?? HomePage;
	}

	// --- GSAP smooth zoom ---
	// Proxy object so GSAP can tween a plain number
	const zoomProxy = { value: 1 };
	let targetZoom = 1;
	let currentZoomSmooth = $state(1);
	let zoomTween: gsap.core.Tween | null = null;

	const ZOOM_MIN = 0.55;
	const ZOOM_NAV_THRESHOLD = 0.7;
	const ZOOM_FOCUS_THRESHOLD = 0.9;

	function handleWheel(e: WheelEvent) {
		const state = get(appState);
		if (state === 'COVER') return;
		e.preventDefault();

		const delta = e.deltaY * 0.001; // inverted zoom direction
		targetZoom = Math.max(ZOOM_MIN, Math.min(1, targetZoom + delta));
		clampZoom(targetZoom);

		// Kill previous tween, animate zoomProxy.value toward targetZoom
		if (zoomTween) zoomTween.kill();
		zoomTween = gsap.to(zoomProxy, {
			value: targetZoom,
			duration: 0.6,
			ease: 'power3.out',  // smoother deceleration curve
			onUpdate: () => {
				currentZoomSmooth = zoomProxy.value;
			},
			onComplete: () => {
				currentZoomSmooth = targetZoom;
				const s = get(appState);
				if (currentZoomSmooth <= ZOOM_NAV_THRESHOLD && s === 'PAGE_FOCUS') {
					enterNavigation();
				} else if (currentZoomSmooth >= ZOOM_FOCUS_THRESHOLD && s === 'NAVIGATION') {
					exitNavigation();
				}
			}
		});

		// Immediate state transitions for responsive feel
		const s = get(appState);
		if (targetZoom <= ZOOM_NAV_THRESHOLD && s === 'PAGE_FOCUS') {
			enterNavigation();
		} else if (targetZoom >= ZOOM_FOCUS_THRESHOLD && s === 'NAVIGATION') {
			exitNavigation();
		}
	}

	// --- Mouse near bottom for NavigationIsland ---
	function handleMouseMove(e: MouseEvent) {
		mouseNearBottom.set(e.clientY >= window.innerHeight * 0.85);
	}

	// --- @use-gesture drag-to-flip ---
	let isDragging = $state(false);
	let dragProgress = $state(0);
	let savedDragProgress = $state(0);
	let dragDirection = $state(1); // 1 = right-to-left (next), -1 = left-to-right (prev)
	let dragTargetPageIdx = $state(0);
	let bookEl: HTMLDivElement;
	let dragGesture: DragGesture | null = null;

	function setupDrag() {
		if (!bookEl || dragGesture) return;

		dragGesture = new DragGesture(
			bookEl,
			(state: any) => {
				if (state.event) {
					const rect = bookEl.getBoundingClientRect();
					const ptr = state.event as PointerEvent;
					const relX = ptr.clientX - rect.left;
					const edgeZone = rect.width * 0.25;
					if (relX >= edgeZone && relX <= rect.width - edgeZone) return;
				}

				if (state.first) {
					const s = get(appState);
					if (s !== 'NAVIGATION' && s !== 'PAGE_FOCUS') return;
					
					const pi = get(pageIndex);
					// Set initial direction to fallback
					dragDirection = 1;
					dragTargetPageIdx = pi;
				}

				if (state.active) {
					const dx = state.movement[0];
					const pi = get(pageIndex);

					if (dx < 0 && pi < PAGES.length - 1) {
						dragDirection = 1; // forward
						dragTargetPageIdx = pi + 1;
					} else if (dx > 0 && pi > 0) {
						dragDirection = -1; // backward
						dragTargetPageIdx = pi - 1;
					} else {
						dragProgress = 0;
						return; // Can't flip
					}

					isDragging = true;
					const rect = bookEl.getBoundingClientRect();
					const maxDrag = rect.width * 0.8;
					dragProgress = Math.min(1, Math.abs(dx) / maxDrag);
				}

				if (state.last) {
					const dx = state.movement[0];
					const velocity = state.velocity[0];

					if (isDragging && dragProgress > 0) {
						if (Math.abs(velocity) > 0.5 || Math.abs(dx) > 80) {
							// Complete the flip
							savedDragProgress = dragProgress;
							navigateToPage(dragTargetPageIdx);
						}
					}
					isDragging = false;
					dragProgress = 0;
				}
			},
			{
				pointer: { touch: true }
			}
		);
	}

	// --- Reactive mirrors of store values ---
	let currentState = $state<AppState>('COVER');
	let prevState = $state<AppState>('COVER');
	let currentPageIdx = $state(0);
	let targetPageIdx = $state(0);
	let currentZoom = $state(1);

	appState.subscribe((v) => (currentState = v));
	previousState.subscribe((v) => (prevState = v));
	pageIndex.subscribe((v) => (currentPageIdx = v));
	targetPageIndex.subscribe((v) => (targetPageIdx = v));
	zoom.subscribe((v) => (currentZoom = v));

	// --- URL routing ---
	$effect(() => {
		initFromUrl();
		const handler = () => onPopState();
		window.addEventListener('popstate', handler);
		return () => window.removeEventListener('popstate', handler);
	});

	// --- Setup drag gesture after book opens ---
	$effect(() => {
		if (bookEl && currentState !== 'COVER' && currentState !== 'OPENING') {
			// Defer so element is in DOM
			const id = requestAnimationFrame(() => setupDrag());
			return () => {
				cancelAnimationFrame(id);
				dragGesture?.destroy();
				dragGesture = null;
			};
		}
		return () => {
			dragGesture?.destroy();
			dragGesture = null;
		};
	});

	// --- Derived values ---
	let isZoomedOut = $derived(currentState === 'NAVIGATION' || (currentState === 'FLIPPING' && prevState === 'NAVIGATION'));

	// Page dimensions: 50vw × 50vh when zoomed out, full when focused
	let bookWidth = $derived(isZoomedOut ? '50vw' : '100vw');
	let bookHeight = $derived(isZoomedOut ? '50vh' : '100vh');

	let bookScale = $derived(
		currentState === 'COVER' ? 0.75 :
		isZoomedOut ? 1 : // zoomed-out pages are already small via vw/vh, no scale needed
		currentZoomSmooth
	);

	// Content interactive only at full zoom
	let contentInteractive = $derived(
		currentState === 'PAGE_FOCUS' && currentZoomSmooth >= ZOOM_FOCUS_THRESHOLD
	);

	let bookStyle = $derived(
		`width: ${bookWidth}; height: ${bookHeight}; ` +
		`transform: scale(${bookScale}); ` +
		`transition: ${isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'};`
	);

	let showContent = $derived(currentState !== 'COVER' && currentState !== 'OPENING');
	let CurrentPage = $derived(getPageComponent(currentPageIdx));
	let TargetPage = $derived(getPageComponent(isDragging ? dragTargetPageIdx : targetPageIdx));

	let flipDirection = $derived(isDragging ? dragDirection : (targetPageIdx > currentPageIdx ? 1 : -1));

	// Cleanup & Resets
	$effect(() => {
		if (currentState !== 'FLIPPING') {
			savedDragProgress = 0;
		}
		return () => {
			if (zoomTween) zoomTween.kill();
		};
	});
</script>

<svelte:window onwheel={handleWheel} onmousemove={handleMouseMove} />

<div class="book-container">
	<Cover />

	{#if showContent}
		<div class="book-wrapper">
			<!-- Book spine — LEFT side (spine edge), visible when zoomed out -->
			<div class="book-spine" class:visible={isZoomedOut}></div>

			<div
				bind:this={bookEl}
				class="book"
				style={bookStyle}
			>
				{#if currentState === 'FLIPPING' || isDragging}
					<PageFlip manualProgress={isDragging ? dragProgress : undefined} initialProgress={savedDragProgress} direction={flipDirection}>
						{#snippet currentPage()}
							<Page interactive={contentInteractive}>
								<CurrentPage />
							</Page>
						{/snippet}
						{#snippet nextPage()}
							<Page interactive={contentInteractive}>
								<TargetPage />
							</Page>
						{/snippet}
					</PageFlip>
				{:else}
					<Page interactive={contentInteractive}>
						<CurrentPage />
					</Page>
				{/if}
			</div>
		</div>

		<!-- Drag hint edges -->
		{#if isZoomedOut && !isDragging}
			<div class="drag-hint left"></div>
			<div class="drag-hint right"></div>
		{/if}
	{/if}
</div>

<NavigationIsland />

<style>
	.book-container {
		position: fixed;
		inset: 0;
		perspective: 2000px;
		transform-style: preserve-3d;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: radial-gradient(ellipse at center, #3d2314 0%, #1f1008 70%, #0d0602 100%);
	}

	/* Wrapper holds book + spine together */
	.book-wrapper {
		display: flex;
		align-items: stretch;
		transform-style: preserve-3d;
	}

	.book {
		transform-style: preserve-3d;
		transform-origin: center center;
		will-change: transform;
		touch-action: none;
		position: relative;
	}

	/* Book spine — LEFT side (spine edge) */
	.book-spine {
		width: 0;
		overflow: hidden;
		transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		position: relative;
		border-radius: 4px 0 0 4px;
		background: repeating-linear-gradient(
			to right,
			#8c4a24 0px,
			#753d1b 1px,
			#5c2c10 2px,
			#8c4a24 3px
		);
		box-shadow:
			-2px 0 6px rgba(0,0,0,0.4),
			inset 1px 0 2px rgba(0,0,0,0.2),
			inset -1px 0 1px rgba(255,255,255,0.1);
	}

	.book-spine.visible {
		width: 14px;
	}

	.drag-hint {
		position: fixed;
		top: 20%;
		bottom: 20%;
		width: 60px;
		z-index: 40;
		pointer-events: none;
		opacity: 0;
		animation: hint-pulse 2s ease-in-out infinite;
	}

	.drag-hint.left {
		left: 0;
		background: linear-gradient(to right, rgba(224, 122, 95, 0.1), transparent);
		border-right: 1px solid rgba(224, 122, 95, 0.15);
	}

	.drag-hint.right {
		right: 0;
		background: linear-gradient(to left, rgba(224, 122, 95, 0.1), transparent);
		border-left: 1px solid rgba(224, 122, 95, 0.15);
	}

	@keyframes hint-pulse {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.8; }
	}
</style>
