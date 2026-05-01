<script lang="ts">
	import DynamicCard from '$lib/components/DynamicCard.svelte';
	import TiltCard from '$lib/components/TiltCard.svelte';
	import GlowText from '$lib/components/GlowText.svelte';
</script>

<div class="about-content">
	<div class="page-header animate-fade-up">
		<div class="page-label">Chapter III</div>
		<h1><GlowText text="About" /></h1>
	</div>

	<TiltCard delay={150}>
		<section class="bio">
			<p>
				I'm a developer who values craft over convention. I build things
				that feel right — where the interaction is intentional, the
				architecture is honest, and the details hold up under scrutiny.
			</p>
			<p>
				My work spans frontend, backend, and the space between — where
				user experience meets system design.
			</p>
		</section>
	</TiltCard>

	<DynamicCard delay={300}>
		<section class="values">
			<h2>What I Care About</h2>
			<ul>
				<li>
					<strong>Simplicity</strong>
					<span>Solving the right problem, not every problem</span>
				</li>
				<li>
					<strong>Craft</strong>
					<span>The gap between "works" and "works well" is where I live</span>
				</li>
				<li>
					<strong>Honesty</strong>
					<span>No magic abstractions, no hidden complexity</span>
				</li>
				<li>
					<strong>Iteration</strong>
					<span>Good work comes from refinement, not inspiration</span>
				</li>
			</ul>
		</section>
	</DynamicCard>

	<DynamicCard delay={450}>
		<section class="contact">
			<h2>Get in Touch</h2>
			<p>Reach out if you'd like to collaborate, or just want to talk shop.</p>
			<div class="links">
				<a href="mailto:hello@example.com">Email</a>
				<span class="link-sep">&#8226;</span>
				<a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
			</div>
		</section>
	</DynamicCard>
</div>

<style>
	.about-content {
		padding: 2rem 0;
		max-width: 560px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.page-header {
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

	h2 {
		font-family: var(--font-heading, 'Shivaraja', serif);
		font-size: 1.4rem;
		font-weight: 600;
		color: var(--ink, #2a1a0a);
		margin-bottom: 0.8rem;
	}

	.bio p {
		color: var(--ink-light, #5a4a3a);
		line-height: 1.8;
		margin-bottom: 1rem;
		font-family: var(--font-body, 'Roboto', sans-serif);
		font-size: 1.05rem;
	}

	.values ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.values li {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding-left: 1rem;
		border-left: 2px solid rgba(212, 168, 67, 0.3);
	}

	.values li strong {
		font-family: var(--font-heading, 'Shivaraja', serif);
		font-size: 1.1rem;
		color: var(--ink, #2a1a0a);
		font-weight: 600;
	}

	.values li span {
		font-family: var(--font-body, 'Roboto', sans-serif);
		font-size: 0.95rem;
		color: var(--ink-light, #5a4a3a);
	}

	.contact p {
		color: var(--ink-light, #5a4a3a);
		margin-bottom: 0.8rem;
		font-family: var(--font-body, 'Roboto', sans-serif);
	}

	.links {
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}

	.links a {
		font-family: var(--font-label, 'Cinzel', serif);
		font-size: 0.7rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--brass, #c9953c);
		text-decoration: none;
		border-bottom: 1px solid rgba(212, 168, 67, 0.3);
		padding-bottom: 2px;
		transition: border-color 200ms, color 200ms;
	}

	.links a:hover {
		border-color: var(--gold, #d4a843);
		color: var(--gold, #d4a843);
	}

	.link-sep {
		color: rgba(212, 168, 67, 0.3);
		font-size: 0.6rem;
	}
</style>
