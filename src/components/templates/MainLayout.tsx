import type { ReactNode } from "react";
import { Navigation } from "../organisms/Navigation";

interface MainLayoutProps {
	children: ReactNode;
	showNavigation?: boolean;
}

export function MainLayout({
	children,
	showNavigation = true,
}: MainLayoutProps) {
	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col">
			{showNavigation && <Navigation />}
			<main className="flex-1 container mx-auto px-4 py-8">{children}</main>
		</div>
	);
}
