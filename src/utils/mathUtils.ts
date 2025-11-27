export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface Dimensions {
	width: number;
	height: number;
}

export interface Hotspot {
	x: number; // percentage (0-100)
	y: number; // percentage (0-100)
	width: number; // percentage (0-100)
	height: number; // percentage (0-100)
	targetPageId: string;
	label?: string;
	diceRoll?: {
		enabled: boolean;
		difficulty?: number;
		type?: "combat" | "stealth" | "persuasion" | "custom";
		failurePageId?: string;
	};
}

/**
 * Converts absolute pixel coordinates to percentages relative to the container.
 * This ensures the hotspot scales correctly on different screen sizes.
 */
export const pixelsToPercentage = (
	rect: Rect,
	container: Dimensions
): Omit<Hotspot, "targetPageId"> => {
	if (container.width === 0 || container.height === 0) {
		return { x: 0, y: 0, width: 0, height: 0 };
	}

	return {
		x: (rect.x / container.width) * 100,
		y: (rect.y / container.height) * 100,
		width: (rect.width / container.width) * 100,
		height: (rect.height / container.height) * 100,
	};
};

/**
 * Converts percentage coordinates back to absolute pixels for rendering/editing.
 */
export const percentageToPixels = (
	hotspot: Omit<Hotspot, "targetPageId">,
	container: Dimensions
): Rect => {
	return {
		x: (hotspot.x / 100) * container.width,
		y: (hotspot.y / 100) * container.height,
		width: (hotspot.width / 100) * container.width,
		height: (hotspot.height / 100) * container.height,
	};
};
