import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
