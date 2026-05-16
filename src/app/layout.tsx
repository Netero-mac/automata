import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Automata | ERD Editor",
  description: "Visualizador de banco de dados com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} h-screen w-screen overflow-hidden bg-[#0d0f12]`}>
        {children}
      </body>
    </html>
  );
}