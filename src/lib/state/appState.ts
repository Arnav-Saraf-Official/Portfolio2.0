import { writable, derived, get } from 'svelte/store';
import { replaceState } from '$app/navigation';

export type AppState = 'COVER' | 'OPENING' | 'PAGE_FOCUS' | 'NAVIGATION' | 'FLIPPING';

import pagesData from '$lib/data/pages.json' with { type: 'json' };

export const PAGES = pagesData as string[];
export type PageId = string;

// Route mapping
export const PAGE_ROUTES: Record<string, string> = {};
const ROUTE_TO_INDEX: Record<string, number> = {};

PAGES.forEach((page, index) => {
	const route = `/${page}`;
	PAGE_ROUTES[page] = route;
	ROUTE_TO_INDEX[route] = index;
});

// Writable stores
export const appState = writable<AppState>('COVER');
export const pageIndex = writable(0);
export const zoom = writable(1);
export const targetPageIndex = writable(0);
export const previousState = writable<AppState>('COVER');
export const mouseNearBottom = writable(false);

// Derived
export const currentPageId = derived(pageIndex, ($i) => PAGES[$i]);

// Valid state transitions
const VALID: Record<AppState, AppState[]> = {
	COVER: ['OPENING'],
	OPENING: ['PAGE_FOCUS', 'NAVIGATION'],
	PAGE_FOCUS: ['NAVIGATION', 'FLIPPING'],
	NAVIGATION: ['FLIPPING', 'PAGE_FOCUS'],
	FLIPPING: ['PAGE_FOCUS', 'NAVIGATION']
};

export function transition(to: AppState) {
	const from = get(appState);
	if (VALID[from]?.includes(to)) {
		previousState.set(from);
		appState.set(to);
	}
}

export function navigateToPage(index: number) {
	if (index >= 0 && index < PAGES.length && index !== get(pageIndex)) {
		targetPageIndex.set(index);
		transition('FLIPPING');
	}
}

export function completeFlip() {
	pageIndex.set(get(targetPageIndex));
	const prev = get(previousState);
	if (prev === 'NAVIGATION') {
		transition('NAVIGATION');
	} else {
		transition('PAGE_FOCUS');
	}
	// Sync URL after flip completes
	syncUrl();
}

export function openBook() {
	transition('OPENING');
}

export function finishOpening() {
	transition('NAVIGATION');
	// Sync URL when book first opens
	syncUrl();
}

export function enterNavigation() {
	if (get(appState) === 'PAGE_FOCUS') transition('NAVIGATION');
}

export function exitNavigation() {
	if (get(appState) === 'NAVIGATION') transition('PAGE_FOCUS');
}

export function clampZoom(value: number) {
	zoom.set(Math.max(0.55, Math.min(1, value)));
}

// --- URL Routing ---

function syncUrl() {
	const pi = get(pageIndex);
	const pageId = PAGES[pi];
	const route = PAGE_ROUTES[pageId];
	if (route && typeof window !== 'undefined') {
		replaceState(route, {});
	}
}

/** Parse current URL path to page index. Returns 0 if no match. */
export function urlToPageIndex(pathname: string): number {
	return ROUTE_TO_INDEX[pathname] ?? 0;
}

/** init page index from curr url */
export function initFromUrl() {
	if (typeof window === 'undefined') return;
	const pathname = window.location.pathname;
	const idx = urlToPageIndex(pathname);
	//skip cover if URL matches
	if (idx > 0 || ROUTE_TO_INDEX[pathname] !== undefined) {
		pageIndex.set(idx);
		targetPageIndex.set(idx);
		appState.set('PAGE_FOCUS');
	}
}

export function onPopState() {
	const idx = urlToPageIndex(window.location.pathname);
	if (idx !== get(pageIndex)) {
		navigateToPage(idx);
	}
}

export function navigateToPageId(pageId: PageId) {
	const idx = PAGES.indexOf(pageId);
	if (idx >= 0) navigateToPage(idx);
}
