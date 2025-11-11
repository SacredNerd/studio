"use client";

import { usePathname } from "next/navigation";

export function SetupLayout({ children, setupComplete }: { children: React.ReactNode, setupComplete: boolean }) {
  const pathname = usePathname();
  const isSetupPage = pathname === "/setup";

  if (isSetupPage || !setupComplete) {
    // For setup page, or if setup is not complete, we might only want to show a specific part of children.
    // Assuming the setup page is the first child.
    const setupContent = Array.isArray(children) ? (children as React.ReactNode[]).find(c => (c as any)?.type?.name === 'main') : children;
    return <>{setupContent}</>;
  }

  return (
    <>
      {children}
    </>
  );
}
