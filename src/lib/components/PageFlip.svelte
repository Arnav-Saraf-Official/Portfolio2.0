<script lang="ts">
	import { appState, completeFlip } from '$lib/state/appState.js';
	import { TIMING } from '$lib/motion/variants.js';
	import { get } from 'svelte/store';
	import gsap from 'gsap';

	let {
		currentPage,
		nextPage,
		manualProgress = undefined,
		initialProgress = 0,
		direction = 1
	}: {
		currentPage: import('svelte').Snippet;
		nextPage: import('svelte').Snippet;
		manualProgress?: number;
		initialProgress?: number;
		direction?: number;
	} = $props();

	let autoProgress = $state(0);
	let flipTimeline: gsap.core.Timeline | null = null;
	let hasStarted = false;

	let flipProgress = $derived(manualProgress !== undefined ? manualProgress : autoProgress);

	function startFlip() {
		if (hasStarted) return;
		hasStarted = true;
		autoProgress = manualProgress !== undefined ? manualProgress : initialProgress;

		// kill prev timeline if any
		if (flipTimeline) flipTimeline.kill();

		const proxy = { p: autoProgress };
		const remaining = 1 - autoProgress;
		const duration = (TIMING.PAGE_FLIP / 1000) * remaining;
		const ease = remaining < 0.4 ? 'power1.out' : 'power2.inOut';

		flipTimeline = gsap.timeline({
			onComplete: () => {
				completeFlip();
				autoProgress = 0;
				hasStarted = false;
			}
		});

		flipTimeline.to(proxy, {
			p: 1,
			duration,
			ease,
			onUpdate: () => {
				autoProgress = proxy.p;
			}
		});
	}

	$effect(() => {
		if (get(appState) === 'FLIPPING') startFlip();
		return () => {
			if (flipTimeline) flipTimeline.kill();
		};
	});

	let rotateY = $derived(
		direction === 1
			? flipProgress * -180
			: -180 + flipProgress * 180
	);
	
	let shadowOpacity = $derived(
		flipProgress > 0 && flipProgress < 1
			? Math.sin(flipProgress * Math.PI) * 0.4
			: 0
	);

	let departOpacity = $derived(Math.max(0, 1 - flipProgress * 2));
	let arriveOpacity = $derived(Math.max(0, (flipProgress - 0.5) * 2));
</script>

<div class="flip-container">
	<div class="stationary-page" style="opacity: {arriveOpacity};">
		{#if direction === 1}
			{@render nextPage()}
		{:else}
			{@render currentPage()}
		{/if}
	</div>

	<div class="flipping-page" style="transform: rotateY({rotateY}deg);">
		<div class="flip-face flip-front" style="opacity: {departOpacity};">
			{#if direction === 1}
				{@render currentPage()}
			{:else}
				{@render nextPage()}
			{/if}
		</div>
		<div class="flip-face flip-back" style="transform: rotateY(180deg);">
			<div class="blank-back"></div>
		</div>
		<div class="flip-shadow" style="opacity: {shadowOpacity}"></div>
	</div>
</div>

<style>
	.flip-container {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
	}

	.stationary-page {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.flipping-page {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
		/* Hinges on the left edge (spine) */
		transform-origin: left center;
		will-change: transform;
		z-index: 2;
	}

	.flip-face {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
		backface-visibility: hidden;
	}

	.flip-front {
		z-index: 2;
	}

	.flip-back {
		z-index: 1;
	}

	.blank-back {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #eab676 0%, #d9a05b 100%);
		border-radius: 4px;
	}

	/* Shadow cast by the flipping page */
	.flip-shadow {
		position: absolute;
		inset: 0;
		background: linear-gradient(to right, rgba(0,0,0,0.5), transparent 60%);
		pointer-events: none;
		z-index: 10;
		transform: translateZ(1px);
	}
</style>
