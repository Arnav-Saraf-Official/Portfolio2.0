<script lang="ts">
	import DynamicCard from '$lib/components/DynamicCard.svelte';
	import TiltCard from '$lib/components/TiltCard.svelte';
	import GlowText from '$lib/components/GlowText.svelte';
</script>

<div class="home-content">
	<div class="home-hero animate-fade-up">
		<div class="home-label">Chapter I</div>
		<h1><GlowText text="Welcome" /></h1>
		<p class="subtitle">Crafted with care, built to last</p>
	</div>

	<TiltCard delay={200}>
		<section class="intro">
			<p>
				This is my corner of the web — a collection of projects and ideas
				brought to life through code, design, and relentless iteration.
				Every piece here was made with intention.
			</p>
		</section>
	</TiltCard>

	<DynamicCard delay={400}>
		<section class="callout">
			<blockquote>
				"The details are not the details.<br/>They make the design."
				<footer>— Charles Eames</footer>
			</blockquote>
		</section>
	</DynamicCard>

	<div class="home-stats">
		<TiltCard delay={500}>
			<div class="stat">
				<span class="stat-num">3</span>
				<span class="stat-label">Projects</span>
			</div>
		</TiltCard>
		<TiltCard delay={600}>
			<div class="stat">
				<span class="stat-num">&infin;</span>
				<span class="stat-label">Curiosity</span>
			</div>
		</TiltCard>
		<TiltCard delay={700}>
			<div class="stat">
				<span class="stat-num">1</span>
				<span class="stat-label">Mission</span>
			</div>
		</TiltCard>
	</div>
</div>

<style>
	.home-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 80vh;
		text-align: center;
		gap: 1.5rem;
	}

	.home-hero {
		margin-bottom: 1rem;
	}

	.home-label {
		font-family: var(--font-label, 'Cinzel', serif);
		font-size: 0.7rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--brass, #c9953c);
		margin-bottom: 0.8rem;
	}

	h1 {
		font-family: var(--font-heading, 'Shivaraja', serif);
		font-size: 3.5rem;
		font-weight: 500;
		color: var(--ink, #2a1a0a);
		margin-bottom: 0.5rem;
		letter-spacing: 0.04em;
	}

	.subtitle {
		font-family: var(--font-label, 'Cinzel', serif);
		font-size: 0.85rem;
		color: var(--ink-light, #5a4a3a);
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	.intro {
		max-width: 480px;
		font-size: 1.05rem;
		color: var(--color-foreground, #3a2a1a);
		line-height: 1.8;
	}

	.callout {
		max-width: 400px;
	}

	blockquote {
		border-left: 3px solid rgba(212, 168, 67, 0.4);
		padding-left: 1.2rem;
		font-style: italic;
		color: var(--ink-light, #5a4a3a);
		font-size: 1rem;
		font-family: var(--font-body, 'Roboto', sans-serif);
	}

	blockquote footer {
		margin-top: 0.5rem;
		font-style: normal;
		font-size: 0.8rem;
		color: var(--brass, #c9953c);
	}

	.home-stats {
		display: flex;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.stat {
		text-align: center;
		min-width: 80px;
	}

	.stat-num {
		display: block;
		font-family: var(--font-heading, 'Shivaraja', serif);
		font-size: 2rem;
		font-weight: 700;
		color: var(--gold, #d4a843);
	}

	.stat-label {
		font-family: var(--font-label, 'Cinzel', serif);
		font-size: 0.55rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--ink-light, #5a4a3a);
	}
</style>
