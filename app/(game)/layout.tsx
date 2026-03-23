import React, { Suspense } from "react";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-(family-name:--font-baloo-2)">
      <main>
        <Suspense fallback={<div className="p-10 text-center text-white">Memuat Game...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}