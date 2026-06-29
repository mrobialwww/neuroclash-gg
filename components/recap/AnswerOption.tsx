"use client";

const LABEL_COLORS: Record<string, string> = {
    A: "border-blue-400 text-blue-400",
    B: "border-yellow-400 text-yellow-400",
    C: "border-green-400 text-green-400",
    D: "border-purple-400 text-purple-400",
};

const LABEL_BG: Record<string, string> = {
    A: "bg-blue-400/10",
    B: "bg-yellow-400/10",
    C: "bg-green-400/10",
    D: "bg-purple-400/10",
};

interface AnswerOptionProps {
    key_label: string;
    text: string;
    is_correct: boolean;
    is_selected: boolean;
    explanation: string | null;
}

export function AnswerOption({
    key_label,
    text,
    is_correct,
    is_selected,
    explanation,
}: AnswerOptionProps) {
    let borderColor = "border-gray-200/30";
    let bgColor = "bg-transparent";
    let labelOverride: string | null = null;

    if (is_selected && is_correct) {
        borderColor = "border-emerald-400";
        bgColor = "bg-emerald-400/10";
        labelOverride = "benar";
    } else if (is_selected && !is_correct) {
        borderColor = "border-red-400";
        bgColor = "bg-red-400/10";
        labelOverride = "salah";
    } else if (!is_selected && is_correct) {
        borderColor = "border-emerald-400/50";
        bgColor = "bg-emerald-400/5";
    }

    const showExplanation = is_correct || is_selected;

    return (
        <div
            className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${borderColor} ${bgColor}`}
        >
            <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs md:text-sm font-bold ${is_selected && !is_correct ? "border-red-400 bg-red-400/10 text-red-400" : is_correct ? "border-emerald-400 bg-emerald-400/10 text-emerald-400" : `${LABEL_COLORS[key_label]} ${LABEL_BG[key_label]}`}`}
            >
                {key_label}
            </div>
            <div className="flex-1 pt-0.5">
                <p className="text-sm leading-relaxed text-white/90">{text}</p>
                {labelOverride && (
                    <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-semibold ${is_correct ? "bg-emerald-400/20 text-emerald-400" : "bg-red-400/20 text-red-400"}`}
                    >
                        {labelOverride}
                    </span>
                )}
                {showExplanation && explanation && (
                    <p className="pt-2 text-xs md:text-sm leading-relaxed text-white/80">
                        {explanation}
                    </p>
                )}
            </div>
        </div>
    );
}
