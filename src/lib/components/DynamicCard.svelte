<script lang="ts">
	let { children, delay = 0 }: { children: import('svelte').Snippet; delay?: number } = $props();

	let isHovered = $state(false);
	let card: HTMLDivElement;

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}
</script>

<div
	bind:this={card}
	class="dynamic-card"
	class:hovered={isHovered}
	style="--delay: {delay}ms"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	{@render children()}
</div>

<style>
	.dynamic-card {
		position: relative;
		padding: 1.5rem;
		border: 1px solid rgba(212, 168, 67, 0.15);
		border-radius: 6px;
		background: rgba(255, 244, 200, 0.04);
		transition:
			transform var(--duration-normal) var(--ease-standard),
			box-shadow var(--duration-normal) var(--ease-standard),
			border-color var(--duration-normal) var(--ease-standard);
		animation: card-appear var(--duration-normal) var(--ease-standard) both;
		animation-delay: var(--delay, 0ms);
	}

	.dynamic-card.hovered {
		transform: translateY(-4px);
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.3),
			0 0 20px rgba(212, 168, 67, 0.08);
		border-color: rgba(212, 168, 67, 0.35);
	}

	/* Glow border effect on hover */
	.dynamic-card::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: 7px;
		background: linear-gradient(135deg, rgba(212, 168, 67, 0.2), transparent 50%, rgba(212, 168, 67, 0.1));
		opacity: 0;
		transition: opacity 300ms ease;
		z-index: -1;
	}

	.dynamic-card.hovered::before {
		opacity: 1;
	}

	@keyframes card-appear {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
