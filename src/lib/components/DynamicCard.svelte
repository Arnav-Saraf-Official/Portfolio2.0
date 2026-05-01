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
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
		border-color: rgba(212, 168, 67, 0.3);
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
