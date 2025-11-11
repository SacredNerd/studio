"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

export function SetupLayout({ children, setupComplete }: { children: React.ReactNode, setupComplete: boolean }) {
  const pathname = usePathname();
  const isSetupPage = pathname === "/setup";

  if (isSetupPage || !setupComplete) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        {children}
      </main>
    </>
  );
}
