<script lang="ts">
	import { appState, openBook, finishOpening } from '$lib/state/appState.js';
	import { TIMING } from '$lib/motion/variants.js';
	import { get } from 'svelte/store';

	let container: HTMLDivElement;
	let mouseX = $state(0);
	let mouseY = $state(0);

	let currentState = $state<string>('COVER');
	$effect(() => {
		const unsub = appState.subscribe((v) => (currentState = v));
		return unsub;
	});

	let isOpening = $derived(currentState === 'OPENING');
	let isVisible = $derived(currentState === 'COVER' || currentState === 'OPENING');

	function handleClick() {
		if (get(appState) === 'COVER') openBook();
	}

	function handleMouseMove(e: MouseEvent) {
		if (!container || get(appState) !== 'COVER') return;
		const rect = container.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		mouseX = ((e.clientX - cx) / rect.width) * 12;
		mouseY = ((e.clientY - cy) / rect.height) * 12;
	}

	function handleMouseLeave() {
		mouseX = 0;
		mouseY = 0;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!container || get(appState) !== 'COVER') return;
		const touch = e.touches[0];
		const rect = container.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		mouseX = ((touch.clientX - cx) / rect.width) * 10;
		mouseY = ((touch.clientY - cy) / rect.height) * 10;
	}

	function handleTouchEnd() {
		mouseX = 0;
		mouseY = 0;
	}

	$effect(() => {
		if (currentState === 'OPENING') {
			const timer = setTimeout(() => finishOpening(), TIMING.COVER_OPEN);
			return () => clearTimeout(timer);
		}
	});

	let coverTransform = $derived(
		isVisible
			? `rotateY(${isOpening ? -175 : 0}deg) rotateX(${!isOpening ? -mouseY * 0.3 : 0}deg) rotateZ(${!isOpening ? mouseX * 0.08 : 0}deg)`
			: ''
	);
</script>

{#if isVisible}
	<div class="cover-bg" class:opening={isOpening}>
		<div class="cover-ambient"></div>
		<div class="cover-particles"></div>
	</div>

	<div
		bind:this={container}
		class="cover-wrapper"
		onclick={handleClick}
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		role="button"
		tabindex="0"
		aria-label="Open book"
	>
		<div
			class="cover-book"
			style="transform: {coverTransform}; transition: transform {isOpening ? TIMING.COVER_OPEN + 'ms cubic-bezier(0.22, 0.05, 0.08, 1)' : 'var(--duration-fast) var(--ease-standard)'};"
		>
			<div class="spine-shadow"></div>

			<div class="cover-face">
				<img src="/assets/cover.png" alt="Book cover" class="cover-image" />
				<div class="cover-overlay"></div>

				<!-- title -->
				<div class="cover-title" style="transform: translate({mouseX * 0.4}px, {mouseY * 0.4}px); transition: transform 200ms ease-out;">
					<h1><span class="title-text">My Website</span></h1>
					<div class="cover-ornament">&#8226; &#8226; &#8226;</div>
					<div class="cover-subtitle">Touch to open</div>
				</div>

				<div class="page-edges"></div>
			</div>

			<div class="cover-back"></div>
		</div>
	</div>
{/if}

<style>
	.cover-bg {
		position: fixed;
		inset: 0;
		background: radial-gradient(ellipse at 40% 50%, #3d2314 0%, #221108 60%, #0f0602 100%);
		z-index: 90;
		transition: opacity 580ms 120ms ease-out;
	}

	.cover-bg.opening {
		opacity: 0;
	}

	.cover-ambient {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at 55% 45%,
			rgba(224, 122, 95, 0.1) 0%,
			rgba(234, 182, 118, 0.05) 30%,
			transparent 55%
		);
		pointer-events: none;
	}

	.cover-particles {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='d'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23d)'/%3E%3C/svg%3E");
		opacity: 0.02;
		mix-blend-mode: overlay;
		pointer-events: none;
	}

	.cover-wrapper {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transform-style: preserve-3d;
		perspective: 2500px;
		cursor: pointer;
		z-index: 100;
	}

	/* Book container — flips from left edge (spine) */
	.cover-book {
		position: relative;
		transform-style: preserve-3d;
		transform-origin: left center;
		will-change: transform;
	}

	/* Spine shadow — left edge depth */
	.spine-shadow {
		position: absolute;
		left: -8px;
		top: 2%;
		bottom: 2%;
		width: 16px;
		background: linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent);
		transform: translateZ(-2px);
		border-radius: 2px 0 0 2px;
		z-index: -1;
	}

	/* Cover face — horizontal book proportions */
	.cover-face {
		position: relative;
		width: 70vmin;
		max-width: 700px;
		aspect-ratio: 4 / 3;
		transform-style: preserve-3d;
		backface-visibility: hidden;
		border-radius: 2px 6px 6px 2px;
		overflow: hidden;
		background: linear-gradient(135deg, #8c4a24 0%, #5c2c10 100%);
		box-shadow:
			0 20px 50px rgba(0, 0, 0, 0.6),
			0 4px 16px rgba(0, 0, 0, 0.35);
	}

	.cover-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 0;
		transform: translateZ(0);
	}

	.cover-overlay {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 6%),
			linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, transparent 15%, transparent 80%, rgba(0,0,0,0.1) 100%);
		pointer-events: none;
		z-index: 1;
		transform: translateZ(1px);
	}

	/* Title — Shivaraja font, bright golden gradient */
	.cover-title {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 3;
		transform: translateZ(2px);
	}

	.cover-title h1 {
		font-family: 'Shivaraja', serif;
		font-size: clamp(2.2rem, 7vmin, 4.5rem);
		font-weight: normal;
		letter-spacing: 0.12em;
		text-align: center;
		line-height: 1.15;
		filter: drop-shadow(0 0 8px rgba(234, 182, 118, 0.25));
	}

	.title-text {
		background: linear-gradient(
			135deg,
			#f4e6d3 0%,
			#eab676 20%,
			#e07a5f 40%,
			#8c4a24 60%,
			#eab676 80%,
			#f4e6d3 100%
		);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		/* Glow via drop-shadow on parent h1 instead of filter on this element */
		display: inline-block;
	}

	.cover-ornament {
		margin-top: 0.8rem;
		color: rgba(234, 182, 118, 0.5);
		font-size: 0.7rem;
		letter-spacing: 1em;
	}

	.cover-subtitle {
		margin-top: 0.6rem;
		font-family: var(--font-label, 'Cinzel', serif);
		font-size: clamp(0.6rem, 1.4vmin, 0.8rem);
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: rgba(234, 182, 118, 0.7);
		animation: pulse 2.5s ease-in-out infinite;
	}

	/* Page edges stack — right side of book */
	.page-edges {
		position: absolute;
		right: -4px;
		top: 3%;
		bottom: 3%;
		width: 8px;
		background: repeating-linear-gradient(
			to right,
			#eab676 0px,
			#d9a05b 1px,
			#eab676 2px
		);
		border-radius: 0 1px 1px 0;
		box-shadow: 2px 0 4px rgba(0,0,0,0.3);
		transform: translateZ(-1px);
	}

	/* Back face during flip */
	.cover-back {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #753d1b 0%, #4a2410 100%);
		backface-visibility: visible;
		transform: rotateY(180deg);
		border-radius: 6px 2px 2px 6px;
		box-shadow: inset 0 0 40px rgba(0,0,0,0.3);
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.65; }
		50% { opacity: 0.9; }
	}
</style>
