"use client";

import { create } from "zustand";

interface QuizCreationState {
    isCreating: boolean;
    loadingText: string;
    toastData: {
        isOpen: boolean;
        title?: string;
        message?: React.ReactNode;
        isFailed?: boolean;
        primaryButtonText?: string;
        primaryButtonAction?: () => void;
        secondaryButtonText?: string;
        secondaryButtonAction?: () => void;
    };
    setCreating: (isCreating: boolean, loadingText?: string) => void;
    setLoadingText: (text: string) => void;
    showToast: (toast: Omit<QuizCreationState["toastData"], "isOpen">) => void;
    hideToast: () => void;
}

export const useQuizCreationStore = create<QuizCreationState>((set) => ({
    isCreating: false,
    loadingText: "Membuat quiz...",
    toastData: { isOpen: false },

    setCreating: (isCreating, loadingText) =>
        set((state) => ({
            isCreating,
            loadingText: loadingText ?? state.loadingText,
        })),

    setLoadingText: (loadingText) => set({ loadingText }),

    showToast: (toast) =>
        set({ toastData: { ...toast, isOpen: true }, isCreating: false }),

    hideToast: () =>
        set((state) => ({
            toastData: { ...state.toastData, isOpen: false },
        })),
}));
