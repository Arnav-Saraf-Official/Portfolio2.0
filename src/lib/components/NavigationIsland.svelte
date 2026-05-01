<script lang="ts">
	import {
		appState,
		pageIndex,
		mouseNearBottom,
		navigateToPage,
		PAGES
	} from '$lib/state/appState';

	let currentState = $state<string>('COVER');
	let currentPageIdx = $state(0);
	let nearBottom = $state(false);

	appState.subscribe((v) => (currentState = v));
	pageIndex.subscribe((v) => (currentPageIdx = v));
	mouseNearBottom.subscribe((v) => (nearBottom = v));

	let hoveringIsland = $state(false);
	let showIsland = $state(false);
	let hideTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (nearBottom && currentState !== 'COVER' && currentState !== 'OPENING') {
			showIsland = true;
			if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
			hideTimer = setTimeout(() => {
				if (!hoveringIsland) showIsland = false;
				hideTimer = null;
			}, 3000);
		}
	});

	$effect(() => {
		if (hoveringIsland && hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
		if (!hoveringIsland && showIsland && !nearBottom) {
			if (hideTimer) clearTimeout(hideTimer);
			hideTimer = setTimeout(() => {
				showIsland = false;
				hideTimer = null;
			}, 3000);
		}
	});

	function handleNavClick(index: number) {
		navigateToPage(index);
	}

	const fullLabels: Record<string, string> = { home: 'Home', projects: 'Projects', about: 'About' };
</script>

<div
	class="island"
	class:visible={showIsland}
	onmouseenter={() => { hoveringIsland = true; }}
	onmouseleave={() => { hoveringIsland = false; }}
>
	<div class="island-glow"></div>
	{#each PAGES as page, i}
		<button
			class="nav-item"
			class:active={i === currentPageIdx}
			onclick={() => handleNavClick(i)}
			disabled={i === currentPageIdx}
			aria-label={fullLabels[page]}
		>
			{fullLabels[page]}
		</button>
	{/each}
</div>

<style>
	.island {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%) translateY(20px);
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		max-width: 40vw;
		padding: 0.5rem 0.8rem;
		border-radius: 999px;
		background: rgba(61, 35, 20, 0.92);
		backdrop-filter: blur(14px);
		border: 1px solid rgba(224, 122, 95, 0.2);
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.5),
			0 2px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.island.visible {
		opacity: 1;
		pointer-events: auto;
		transform: translateX(-50%) translateY(0);
	}

	.island-glow {
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		background: linear-gradient(
			135deg,
			rgba(224, 122, 95, 0.15) 0%,
			transparent 40%,
			transparent 60%,
			rgba(224, 122, 95, 0.08) 100%
		);
		pointer-events: none;
	}

	.nav-item {
		position: relative;
		display: flex;
		align-items: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem 1.2rem;
		border-radius: 999px;
		font-family: 'Roboto', sans-serif;
		font-size: 0.8rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		color: rgba(234, 182, 118, 0.6);
		white-space: nowrap;
		transition: color 200ms ease, background 200ms ease;
	}

	.nav-item.active {
		color: #eab676;
	}

	.nav-item.active::after {
		content: '';
		position: absolute;
		bottom: 4px;
		left: 50%;
		width: 18px;
		height: 2px;
		border-radius: 1px;
		background: #e07a5f;
		transform: translateX(-50%);
		box-shadow: 0 0 8px rgba(224, 122, 95, 0.5);
	}

	.nav-item:hover:not(:disabled) {
		color: #f4e6d3;
		background: rgba(224, 122, 95, 0.15);
	}

	.nav-item:disabled {
		cursor: default;
	}
</style>
