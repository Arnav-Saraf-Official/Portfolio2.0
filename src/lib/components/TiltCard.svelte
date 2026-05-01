<script lang="ts">
	let { children, delay = 0 }: { children: import('svelte').Snippet; delay?: number } = $props();

	let tiltX = $state(0);
	let tiltY = $state(0);
	let card: HTMLDivElement;

	function handleMouseMove(e: MouseEvent) {
		if (!card) return;
		const rect = card.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		tiltX = ((e.clientY - cy) / rect.height) * -4;
		tiltY = ((e.clientX - cx) / rect.width) * 4;
	}

	function handleMouseLeave() {
		tiltX = 0;
		tiltY = 0;
	}

	let transformStyle = $derived(
		`perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
	);
</script>

<div
	bind:this={card}
	class="tilt-card"
	style="transform: {transformStyle}; --delay: {delay}ms"
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
>
	{@render children()}

	<!-- Spotlight effect -->
	<div
		class="spotlight"
		style="background: radial-gradient(circle at {((tiltY / 4) + 0.5) * 100}% {((-tiltX / 4) + 0.5) * 100}%, rgba(212, 168, 67, 0.04), transparent 60%)"
	></div>
</div>

<style>
	.tilt-card {
		position: relative;
		padding: 1.5rem;
		border: 1px solid rgba(212, 168, 67, 0.12);
		border-radius: 8px;
		background: rgba(255, 244, 200, 0.03);
		transition: transform var(--duration-normal) var(--ease-in-out), box-shadow var(--duration-normal) var(--ease-in-out);
		transform-style: preserve-3d;
		will-change: transform;
		animation: card-appear var(--duration-normal) var(--ease-standard) both;
		animation-delay: var(--delay, 0ms);
		overflow: hidden;
	}

	.tilt-card:hover {
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
	}

	.spotlight {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0;
		transition: opacity 300ms ease;
	}

	.tilt-card:hover .spotlight {
		opacity: 1;
	}

	@keyframes card-appear {
		from {
			opacity: 0;
			transform: perspective(800px) rotateX(4deg) translateY(16px);
		}
		to {
			opacity: 1;
			transform: perspective(800px) rotateX(0) translateY(0);
		}
	}
</style>
