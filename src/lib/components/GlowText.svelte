<script lang="ts">
	let { text, tag = 'span' }: { text: string; tag?: string } = $props();
</script>

<span class="glow-text">{text}</span>

<style>
	.glow-text {
		background: linear-gradient(
			135deg,
			#ffe4a0 0%,
			#f5c842 25%,
			#daa520 50%,
			#f5d060 75%,
			#ffe4a0 100%
		);
		background-size: 200% 200%;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: shimmer 4s ease-in-out infinite;
	}

	@keyframes shimmer {
		0%, 100% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
	}
</style>
