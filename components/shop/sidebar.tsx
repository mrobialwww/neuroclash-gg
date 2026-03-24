import React from "react";
import Image from "next/image";

type SidebarProps = {
	active?: "karakter" | "skin" | "dimiliki";
	onChange?: (filter: "karakter" | "skin" | "dimiliki") => void;
};

const navItems: Array<{
	name: string;
	key: "karakter" | "skin" | "dimiliki";
	icon: string;
}> = [
		{ name: "Karakter", key: "karakter", icon: "/icons/character.svg" },
		{ name: "Skin", key: "skin", icon: "/icons/skin.svg" },
		{ name: "Dimiliki", key: "dimiliki", icon: "/icons/owned.svg" },
	];

export function Sidebar({ active = "karakter", onChange }: SidebarProps) {
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
				className="hidden md:flex fixed w-68 h-screen text-white p-4 flex-col bg-[#172844] z-20"
			>
				<nav className="flex flex-col gap-2 mt-4">
					{navItems.map((item) => {
						const isActive = active === item.key;
						return (
							<button
								key={item.key}
								onClick={() => onChange?.(item.key)}
								className="flex items-center gap-3 px-3 py-3 rounded-md transition text-left w-full group overflow-hidden"
								style={isActive ? activeStyle : undefined}
							>
								<div className="shrink-0">
									<Image
										src={item.icon}
										alt={item.name}
										width={24}
										height={24}
										className={isActive ? "opacity-100" : "opacity-60"}
									/>
								</div>
								<span className={`font-medium ${isActive ? "text-white" : "text-white/60"}`}>
									{item.name}
								</span>
							</button>
						);
					})}
				</nav>
			</aside>

			{/* Bottom navigation — tampil di bawah md */}
			<nav
				className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex text-white bg-[#172844]"
			>
				{navItems.map((item) => {
					const isActive = active === item.key;
					return (
						<button
							key={item.key}
							onClick={() => onChange?.(item.key)}
							className="flex flex-1 flex-col items-center justify-center gap-1 py-2 transition relative overflow-hidden"
							style={isActive ? activeStyleMobile : undefined}
						>
							<Image
								src={item.icon}
								alt={item.name}
								width={20}
								height={20}
								className={isActive ? "opacity-100" : "opacity-60"}
							/>
							<span className={`text-[10px] font-medium leading-none ${isActive ? "text-white" : "text-white/60"}`}>
								{item.name}
							</span>
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
