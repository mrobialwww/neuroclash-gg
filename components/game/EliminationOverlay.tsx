"use client";

import Image from "next/image";
import { MainButton } from "@/components/common/MainButton";

interface EliminationOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    placement: number;
    survivalTime: string;
    isWinner: boolean;
    isLoading?: boolean;
}

export function EliminationOverlay({
    isOpen,
    onClose,
    placement,
    survivalTime,
    isWinner,
    isLoading = false,
}: EliminationOverlayProps) {
    if (!isOpen) return null;

    // Show loading state
    if (isLoading) {
        return (
            <div className="z-100 fixed inset-0 flex items-center justify-center bg-black/40 px-6 backdrop-blur-md">
                <div className="animate-in fade-in zoom-in-95 relative flex w-full max-w-[400px] flex-col items-center gap-6 rounded-2xl border-2 border-[#383347] bg-slate-900/60 p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl duration-200">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3D79F3] border-t-transparent shadow-[0_0_15px_rgba(61,121,243,0.3)]" />
                    <p className="text-lg font-bold uppercase tracking-wider text-white">
                        Menyimpan hasil...
                    </p>
                </div>
            </div>
        );
    }

    const finalImage = isWinner
        ? "/mascot/mascot-match.webp"
        : "/mascot/mascot-failed.webp";
    const titleColor = isWinner
        ? "text-white"
        : "text-[#FF0000] drop-shadow-[0_2px_4px_rgba(255,0,0,0.3)]";

    return (
        <div className="z-100 fixed inset-0 flex items-center justify-center bg-black/40 px-6 backdrop-blur-md">
            {/* Modal Container */}
            <div className="animate-in fade-in zoom-in-95 relative flex w-full max-w-[400px] flex-col items-center gap-4 rounded-2xl border-2 border-[#383347] bg-slate-900/60 p-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl duration-200 md:max-w-[460px] md:gap-6 md:p-8">
                {/* Title */}
                <h2 className="text-xl font-bold text-white md:text-3xl">
                    {isWinner ? "Selamat!" : "Kamu Tereliminasi"}
                </h2>

                <div className="relative h-[100px] w-[100px] drop-shadow-2xl md:h-[140px] md:w-[140px]">
                    <Image
                        src="/mascot/mascot-match.webp"
                        alt="Elimination Result"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Subtitle / Placement */}
                <div className="text-sm font-semibold leading-relaxed text-white md:text-lg">
                    <p>
                        {isWinner
                            ? "Kamu memenangkan pertandingan!"
                            : `Kamu berada di peringkat `}
                        {!isWinner && (
                            <span className="font-bold text-[#FFC300]">
                                #{placement}
                            </span>
                        )}
                    </p>
                    <div className="mt-2 flex flex-col items-center gap-1">
                        <span className="text-sm font-semibold text-[#658BFF]">
                            Waktu Bertahan
                        </span>
                        <span className="text-xl font-bold text-white">
                            {survivalTime === "00:00"
                                ? "Bertahan"
                                : `${Math.floor(parseInt(survivalTime.split(":")[0]))} Menit ${parseInt(survivalTime.split(":")[1])} Detik`}
                        </span>
                    </div>
                </div>

                {/* Placement Badge Style aligned with ToastOverlay buttons */}
                <MainButton
                    onClick={onClose}
                    variant="blue"
                    size="lg"
                    hasShadow
                    className="md:h-13 h-11 w-full text-sm font-bold md:text-lg"
                >
                    Lanjut Menyaksikan
                </MainButton>
            </div>
        </div>
    );
}
