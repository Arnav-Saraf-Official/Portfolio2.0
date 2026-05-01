<script lang="ts">
	let { text, tag = 'span' }: { text: string; tag?: string } = $props();
</script>

<span class="glow-text">{text}</span>

<style>
	.glow-text {
		background: linear-gradient(
			135deg,
			#e8ca80 0%,
			#d4a843 30%,
			#c49030 55%,
			#d4a843 75%,
			#e8ca80 100%
		);
		background-size: 200% 200%;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: shimmer 8s ease-in-out infinite;
	}

	@keyframes shimmer {
		0%, 100% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
	}
</style>
