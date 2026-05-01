<script lang="ts">
	import { zoom } from '$lib/state/appState.js';

	let {
		children,
		interactive = true
	}: {
		children: import('svelte').Snippet;
		interactive?: boolean;
	} = $props();

	let currentZoom = $state(1);
	$effect(() => {
		const unsub = zoom.subscribe((v) => (currentZoom = v));
		return unsub;
	});

	let vignetteStrength = $derived(0.3 + (1 - currentZoom) * 0.3);
</script>

<div
	class="page"
	class:locked={!interactive}
	style="--vignette: {vignetteStrength}"
>
	<div class="paper-base"></div>
	<div class="paper-vignette"></div>
	<div class="paper-grain"></div>
	<div class="content" style="--content-opacity: {0.7 + currentZoom * 0.3}">
		{@render children()}
	</div>
</div>

<style>
	.page {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 4px;
	}

	.page.locked .content {
		pointer-events: none;
		user-select: none;
	}

	.paper-base {
		position: absolute;
		inset: 0;
		background-image: url('/assets/paper.jpg');
		background-repeat: repeat;
		background-size: 100% 100%;
		border-radius: inherit;
		z-index: 0;
	}


	.paper-vignette {
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
		z-index: 1;
		will-change: opacity;
		opacity: var(--vignette, 0.5);

		background:
			radial-gradient(
				ellipse at center,
				transparent 40%,
				rgba(160, 110, 40, 0.12) 60%,
				rgba(120, 75, 20, 0.28) 80%,
				rgba(80, 50, 10, 0.45) 100%
			),
			radial-gradient(
				ellipse at 0% 100%,
				rgba(140, 90, 20, 0.18) 0%,
				transparent 55%
			);

		mix-blend-mode: multiply;
	}

	.paper-grain {
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
		z-index: 2;
		opacity: 0.05;
		mix-blend-mode: multiply;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		background-size: 256px 256px;
	}

	.content {
		position: relative;
		z-index: 3;
		height: 100%;
		padding: 2.5rem 3.5rem;
		color: var(--ink, #3a2a1a);
		font-family: var(--font-body, 'Roboto', sans-serif);
		font-size: 1.05rem;
		line-height: 1.7;
		overflow: hidden;
		opacity: var(--content-opacity, 1);
		transition: opacity 300ms ease-out;
		scrollbar-width: thin;
		scrollbar-color: rgba(140, 100, 60, 0.3) transparent;
	}

	.page:not(.locked) .content {
		overflow-y: auto;
		overflow-x: hidden;
	}

	.content::-webkit-scrollbar {
		height: 6px;
		width: 6px;
	}

	.content::-webkit-scrollbar-track {
		background: transparent;
	}

	.content::-webkit-scrollbar-thumb {
		background: rgba(140, 100, 60, 0.3);
		border-radius: 3px;
	}
</style>
