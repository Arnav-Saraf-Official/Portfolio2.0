// Timing constants (ms)
export const TIMING = {
	COVER_OPEN: 800,
	PAGE_FLIP: 600,
	ZOOM: 400,
	CONTENT_SWAP: 300
} as const;

// Stagger animation helper
export function staggerDelay(index: number, base: number = 100): number {
	return index * base;
}

// Easing curves (cubic-bezier control points)
export const SPRING_EASE = [0.34, 1.56, 0.64, 1] as const;
export const EASE_OUT = [0.0, 0.0, 0.2, 1] as const;
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;
