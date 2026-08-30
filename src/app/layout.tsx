import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ClientLayout } from "@/components/ClientLayout";
import { MainWrapper } from "@/components/MainWrapper";
import { SidebarProvider } from "@/components/SidebarContext";
import { Inter, Poppins } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noni Tura Admin Panel",
  description: "Super admin panel for Noni Tura",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased bg-gray-50 text-gray-900 font-sans">
        <ClientLayout>
          <SidebarProvider>
            <div className="relative min-h-screen">
              <Sidebar />
              <MainWrapper>{children}</MainWrapper>
            </div>
          </SidebarProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
