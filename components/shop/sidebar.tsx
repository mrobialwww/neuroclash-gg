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

	return (
		<aside style={{ backgroundColor: "#172844" }} className="w-68 min-h-screen text-white p-4">
			<nav className="flex flex-col gap-2 mt-4">
				{navItems.map((item) => {
					const isActive = active === item.key;
					return (
						<button
							key={item.key}
							onClick={() => onChange?.(item.key)}
							className="flex items-center gap-3 px-3 py-3 rounded-md transition text-left w-full"
							style={
								isActive
									? {
											background:
												"linear-gradient(to right, rgba(101,139,255,1) 0%, rgba(101,139,255,1) 20%,   transparent 100%)",
										}
									: undefined
							}
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
	);
}

export default Sidebar;
