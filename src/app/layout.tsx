import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CUI Check — Verificare Fiscală România",
  description: "Dashboard complet de compliance pentru orice companie din România. Verifică status TVA, e-Factura, insolvență, contribuabil inactiv — date live din ANAF/ONRC. 100% gratuit.",
  keywords: "verificare CUI, ANAF, TVA, e-Factura, contribuabil inactiv, insolvență, BPI, România, compliance fiscal",
  openGraph: {
    title: "CUI Check — Verificare Fiscală România",
    description: "Verifică conformitatea fiscală a oricărei companii din România în 2 secunde. 100% gratuit.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
