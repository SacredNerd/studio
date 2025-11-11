"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

export function SetupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSetupPage = pathname === "/setup";

  if (isSetupPage) {
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
