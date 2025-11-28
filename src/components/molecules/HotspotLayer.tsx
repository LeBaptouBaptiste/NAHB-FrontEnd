import type { Hotspot } from '../../utils/mathUtils';
import { MousePointerClick } from 'lucide-react';

interface HotspotLayerProps {
	imageUrl: string;
	hotspots: Hotspot[];
	onHotspotClick: (hotspot: Hotspot) => void;
	showDebug?: boolean;
}

export function HotspotLayer({
	imageUrl,
	hotspots,
	onHotspotClick,
	showDebug = false,
}: HotspotLayerProps) {
	if (!imageUrl) return null;

	return (
		<div className="relative w-full h-full select-none">
			<img
				src={imageUrl}
				alt="Scene"
				className="w-full h-auto object-contain pointer-events-none"
			/>

			{hotspots.map((hotspot, index) => (
				<div
					key={index}
					onClick={() => onHotspotClick(hotspot)}
					className={`absolute cursor - pointer transition - all duration - 200 ${
						showDebug
							? "bg-emerald-500/30 border-2 border-emerald-500 hover:bg-emerald-500/50"
							: "hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
					} `}
					style={{
						left: `${hotspot.x}% `,
						top: `${hotspot.y}% `,
						width: `${hotspot.width}% `,
						height: `${hotspot.height}% `,
					}}
					title={hotspot.label || "Interact"}
				>
					{showDebug && (
						<div className="absolute top-0 left-0 bg-black/70 text-white text-[10px] px-1 rounded-br">
							{hotspot.label || `Zone ${index + 1} `} → {hotspot.targetPageId}
						</div>
					)}

					{/* Optional: Add a subtle pulse animation or icon on hover if desired */}
					<div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
						<MousePointerClick className="w-6 h-6 text-white drop-shadow-lg animate-pulse" />
					</div>
				</div>
			))}
		</div>
	);
}
