// Timing constants (ms)
export const TIMING = {
	COVER_OPEN: 720,
	PAGE_FLIP: 600,
	ZOOM: 600,
	CONTENT_SWAP: 200
} as const;

// Stagger animation helper
export function staggerDelay(index: number, base: number = 100): number {
	return index * base;
}

// gsap ease names
export const EASE_STANDARD   = 'power2.out'    as const;
export const EASE_EXPRESSIVE = 'back.out(1.7)' as const;
export const EASE_IN_OUT     = 'power2.inOut'  as const;

// css ease strings
export const CSS_EASE_STANDARD   = 'cubic-bezier(0.0, 0.0, 0.2, 1)'    as const;
export const CSS_EASE_EXPRESSIVE = 'cubic-bezier(0.34, 1.56, 0.64, 1)' as const;
export const CSS_EASE_IN_OUT     = 'cubic-bezier(0.45, 0, 0.55, 1)'    as const;