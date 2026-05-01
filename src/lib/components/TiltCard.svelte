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
		tiltX = ((e.clientY - cy) / rect.height) * -8;
		tiltY = ((e.clientX - cx) / rect.width) * 8;
	}

	function handleMouseLeave() {
		tiltX = 0;
		tiltY = 0;
	}

	let transformStyle = $derived(
		`perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${tiltX === 0 && tiltY === 0 ? 1 : 1.02})`
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
		style="background: radial-gradient(circle at {((tiltY / 8) + 0.5) * 100}% {((-tiltX / 8) + 0.5) * 100}%, rgba(212, 168, 67, 0.1), transparent 60%)"
	></div>
</div>

<style>
	.tilt-card {
		position: relative;
		padding: 1.5rem;
		border: 1px solid rgba(212, 168, 67, 0.12);
		border-radius: 8px;
		background: rgba(255, 244, 200, 0.03);
		transition: transform 200ms ease-out, box-shadow 200ms ease;
		transform-style: preserve-3d;
		will-change: transform;
		animation: card-appear 600ms cubic-bezier(0.0, 0.0, 0.2, 1) both;
		animation-delay: var(--delay, 0ms);
		overflow: hidden;
	}

	.tilt-card:hover {
		box-shadow:
			0 12px 30px rgba(0, 0, 0, 0.35),
			0 0 30px rgba(212, 168, 67, 0.06);
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
			transform: perspective(800px) rotateX(4deg) translateY(20px);
		}
		to {
			opacity: 1;
			transform: perspective(800px) rotateX(0) translateY(0);
		}
	}
</style>
