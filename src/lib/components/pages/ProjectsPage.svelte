<script lang="ts">
	import DynamicCard from '$lib/components/DynamicCard.svelte';
	import TiltCard from '$lib/components/TiltCard.svelte';
	import GlowText from '$lib/components/GlowText.svelte';
</script>

<div class="projects-content">
	<div class="page-header animate-fade-up">
		<div class="page-label">Chapter II</div>
		<h1><GlowText text="Projects" /></h1>
	</div>

	<section class="project-list">
		<TiltCard delay={150}>
			<article class="project">
				<div class="project-number">01</div>
				<h2>Project Alpha</h2>
				<p>A full-stack application built with modern tooling. Focus on performance, accessibility, and developer experience.</p>
				<div class="tags">
					<span class="tag">TypeScript</span>
					<span class="tag">SvelteKit</span>
					<span class="tag">PostgreSQL</span>
				</div>
			</article>
		</TiltCard>

		<TiltCard delay={300}>
			<article class="project">
				<div class="project-number">02</div>
				<h2>Project Beta</h2>
				<p>Real-time data visualization dashboard. Handles streaming data with sub-second latency and interactive charts.</p>
				<div class="tags">
					<span class="tag">React</span>
					<span class="tag">D3.js</span>
					<span class="tag">WebSocket</span>
				</div>
			</article>
		</TiltCard>

		<TiltCard delay={450}>
			<article class="project">
				<div class="project-number">03</div>
				<h2>Project Gamma</h2>
				<p>CLI tool for automating development workflows. Reduces boilerplate and enforces consistent project structures.</p>
				<div class="tags">
					<span class="tag">Go</span>
					<span class="tag">Cobra</span>
					<span class="tag">YAML</span>
				</div>
			</article>
		</TiltCard>
	</section>
</div>

<style>
	.projects-content {
		padding: 2rem 0;
	}

	.page-header {
		margin-bottom: 2rem;
		border-bottom: 1px solid rgba(212, 168, 67, 0.2);
		padding-bottom: 1rem;
	}

	.page-label {
		font-family: var(--font-label, 'Cinzel', serif);
		font-size: 0.7rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--brass, #c9953c);
		margin-bottom: 0.6rem;
	}

	h1 {
		font-family: var(--font-heading, 'Shivaraja', serif);
		font-size: 2.5rem;
		font-weight: 500;
		letter-spacing: 0.04em;
	}

	.project-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.project {
		position: relative;
	}

	.project-number {
		font-family: var(--font-heading, 'Shivaraja', serif);
		font-size: 2.5rem;
		font-weight: 300;
		color: rgba(212, 168, 67, 0.15);
		position: absolute;
		top: -0.5rem;
		right: 0;
		pointer-events: none;
	}

	.project h2 {
		font-family: var(--font-heading, 'Shivaraja', serif);
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--ink, #2a1a0a);
		margin-bottom: 0.5rem;
	}

	.project p {
		color: var(--ink-light, #5a4a3a);
		line-height: 1.7;
		margin-bottom: 0.8rem;
		font-family: var(--font-body, 'Roboto', sans-serif);
	}

	.tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tag {
		font-family: var(--font-label, 'Cinzel', serif);
		font-size: 0.6rem;
		padding: 0.25rem 0.7rem;
		border: 1px solid rgba(212, 168, 67, 0.25);
		border-radius: 999px;
		color: var(--brass, #c9953c);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
