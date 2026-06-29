"use client";

const LABEL_COLORS: Record<string, string> = {
    A: "border-blue-500 text-blue-500",
    B: "border-yellow-500 text-yellow-500",
    C: "border-green-500 text-green-500",
    D: "border-purple-500 text-purple-500",
};

const LABEL_BG: Record<string, string> = {
    A: "bg-blue-500/20",
    B: "bg-yellow-500/20",
    C: "bg-green-500/20",
    D: "bg-purple-500/20",
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
    let borderColor = "border-white/10";
    let bgColor = "bg-transparent";
    let borderWidth = "border";
    let labelOverride: string | null = null;

    if (is_selected && is_correct) {
        borderColor = "border-emerald-500";
        bgColor = "bg-emerald-500/20";
        borderWidth = "border-2";
        labelOverride = "benar";
    } else if (is_selected && !is_correct) {
        borderColor = "border-red-500";
        bgColor = "bg-red-500/20";
        borderWidth = "border-2";
        labelOverride = "salah";
    } else if (!is_selected && is_correct) {
        borderColor = "border-emerald-500/60";
        bgColor = "bg-emerald-500/10";
        borderWidth = "border-2";
    }

    const showExplanation = is_correct || is_selected;

    return (
        <div
            className={`flex items-start gap-3 rounded-xl p-4 transition-colors ${borderWidth} ${borderColor} ${bgColor}`}
        >
            <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs md:text-sm font-bold ${is_selected && !is_correct ? "border-red-500 bg-red-500/20 text-red-500" : is_correct ? "border-emerald-500 bg-emerald-500/20 text-emerald-500" : `${LABEL_COLORS[key_label]} ${LABEL_BG[key_label]}`}`}
            >
                {key_label}
            </div>
            <div className="flex-1 pt-0.5">
                <p className="text-sm leading-relaxed text-white/90">{text}</p>
                {labelOverride && (
                    <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-semibold ${is_correct ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                    >
                        {labelOverride}
                    </span>
                )}
                {showExplanation && explanation && (
                    <p className="pt-2 text-xs md:text-sm leading-relaxed text-white/90">
                        {explanation}
                    </p>
                )}
            </div>
        </div>
    );
}
