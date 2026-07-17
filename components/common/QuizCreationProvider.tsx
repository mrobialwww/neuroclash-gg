"use client";

import React from "react";
import { FloatingSpinner } from "@/components/common/FloatingSpinner";
import { ToastOverlay } from "@/components/common/ToastOverlay";
import { useQuizCreationStore } from "@/store/useQuizCreationStore";

export function QuizCreationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isCreating, loadingText, toastData, hideToast } =
        useQuizCreationStore();

    return (
        <>
            {children}
            <FloatingSpinner isOpen={isCreating} message={loadingText} />
            <ToastOverlay
                isOpen={toastData.isOpen}
                onClose={hideToast}
                title={toastData.title}
                message={toastData.message}
                isFailed={toastData.isFailed}
                primaryButtonText={toastData.primaryButtonText}
                onPrimaryClick={() => {
                    hideToast();
                    toastData.primaryButtonAction?.();
                }}
                secondaryButtonText={toastData.secondaryButtonText}
                onSecondaryClick={() => {
                    hideToast();
                    toastData.secondaryButtonAction?.();
                }}
            />
        </>
    );
}
