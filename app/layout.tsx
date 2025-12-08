import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import "./globals.css";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import { MangaProvider } from "@/context/MangaContext";

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZMREADER",
  description: "Manga reader for the Z library",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body
        className={`${sourceCodePro.className} antialiased font-mono bg-black text-white flex flex-row`}
      >
        <MangaProvider>
          <CollapsibleSidebar />
          {children}
        </MangaProvider>
      </body>
    </html>
  );
};

export default RootLayout;
