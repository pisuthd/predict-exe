import type { Metadata } from "next";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google"
import { Providers } from "./providers"
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer"

const Font = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Predict-EXE",
  description: "Retro prediction market on Massa Network",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${Font.className} antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden font-mono">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
                backgroundSize: '50px 50px'
              }}></div>
            </div>
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>


            <Header />

            <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
              {children}
            </main>

            <Footer/>
          </div>
        </Providers>
      </body>
    </html>
  );
}
