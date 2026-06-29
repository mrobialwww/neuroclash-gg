"use client";

import { GameRecap } from "@/modules/histories/history.schema";
import { AnswerOption } from "./AnswerOption";
import { StateBadge } from "./StateBadge";

interface RecapExplanationProps {
    questions: GameRecap["questions"];
}

export function RecapExplanation({ questions }: RecapExplanationProps) {
    if (questions.length === 0) {
        return (
            <p className="text-center text-sm md:text-base font-medium text-white/70">
                Tidak ada soal yang tersedia.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {questions.map((q, i) => (
                <div
                    key={q.question_id}
                    className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-lg backdrop-blur-md md:p-6"
                >
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white/90 md:text-base">
                            Soal {i + 1}
                        </h3>
                        <StateBadge state={q.state} />
                    </div>
                    <p className="mb-4 text-sm md:text-base leading-relaxed text-white">
                        {q.question_text}
                    </p>
                    <div className="space-y-2.5">
                        {q.answers.map((a) => (
                            <AnswerOption
                                key={a.answer_id}
                                key_label={a.key}
                                text={a.answer_text}
                                is_correct={a.is_correct}
                                is_selected={a.is_selected}
                                explanation={a.explanation}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
