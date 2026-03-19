"use client";

import React from "react";

type SidebarProps = {
	active?: "karakter" | "skin" | "dimiliki";
	onChange?: (filter: "karakter" | "skin" | "dimiliki") => void;
};

export function Sidebar({ active = "karakter", onChange }: SidebarProps) {
	const navItems: Array<{ name: string; key: "karakter" | "skin" | "dimiliki" }> = [
		{ name: "Karakter", key: "karakter" },
		{ name: "Skin", key: "skin" },
		{ name: "Dimiliki", key: "dimiliki" },
	];

	const activeStyle = {
		background:
			"linear-gradient(to right, rgba(101,139,255,1) 0%, rgba(101,139,255,1) 20%, transparent 100%)",
	};

	const activeStyleMobile = {
		background:
			"linear-gradient(to bottom, rgba(101,139,255,1) 0%, rgba(101,139,255,1) 20%, transparent 100%)",
	};

	return (
		<>
			{/* Sidebar — tampil di md ke atas */}
			<aside
				style={{ backgroundColor: "#172844" }}
				className="hidden md:flex fixed w-68 h-screen text-white p-4 flex-col"
			>
				<nav className="flex flex-col gap-2 mt-4">
					{navItems.map((item) => {
						const isActive = active === item.key;
						return (
							<button
								key={item.key}
								onClick={() => onChange?.(item.key)}
								className="flex items-center gap-3 px-3 py-3 rounded-md transition text-left w-full"
								style={isActive ? activeStyle : undefined}
							>
								<div className="w-7 h-7 rounded-sm bg-white/20 flex items-center justify-center shrink-0">
									<div className="w-3 h-3 bg-white rounded-sm" />
								</div>
								<span className="font-medium">{item.name}</span>
							</button>
						);
					})}
				</nav>
			</aside>

			{/* Bottom navigation — tampil di bawah md */}
			<nav
				style={{ backgroundColor: "#172844" }}
				className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex text-white"
			>
				{navItems.map((item) => {
					const isActive = active === item.key;
					return (
						<button
							key={item.key}
							onClick={() => onChange?.(item.key)}
							className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition"
							style={isActive ? activeStyleMobile : undefined}
						>
							<div className="w-7 h-7 rounded-sm bg-white/20 flex items-center justify-center shrink-0">
								<div className="w-3 h-3 bg-white rounded-sm" />
							</div>
							<span className="text-xs font-medium">{item.name}</span>
						</button>
					);
				})}
			</nav>

			{/* Spacer agar konten tidak tertutup bottom nav di mobile */}
			<div className="md:hidden h-16" />
		</>
	);
}

export default Sidebar;