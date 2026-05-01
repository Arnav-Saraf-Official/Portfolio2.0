<script lang="ts">
	import { appState, completeFlip } from '$lib/state/appState';
	import { TIMING } from '$lib/motion/variants';
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

		// Kill previous timeline if any
		if (flipTimeline) flipTimeline.kill();

		const proxy = { p: autoProgress };

		flipTimeline = gsap.timeline({
			onComplete: () => {
				completeFlip();
				autoProgress = 0;
				hasStarted = false;
			}
		});

		flipTimeline.to(proxy, {
			p: 1,
			duration: TIMING.PAGE_FLIP / 1000,
			ease: 'power2.inOut',
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
</script>

<div class="flip-container">
	<!-- Stationary bottom page -->
	<div class="stationary-page">
		{#if direction === 1}
			{@render nextPage()}
		{:else}
			{@render currentPage()}
		{/if}
	</div>

	<!-- Flipping top page -->
	<div class="flipping-page" style="transform: rotateY({rotateY}deg);">
		<div class="flip-face flip-front">
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
