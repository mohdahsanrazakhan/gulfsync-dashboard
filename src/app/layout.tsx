import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthSessionProvider } from "@/components/providers/SessionProvider";
import { LocaleProvider } from "@/components/providers/LocaleContext";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "GulfSync Dashboard",
  description: "Unified e-commerce intelligence for Gulf sellers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${tajawal.variable} h-full antialiased`}
    >
      <head>
        {/* Apply the persisted locale before hydration to avoid an LTR->RTL flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var l=localStorage.getItem("gulfsync:locale");if(l==="ar"){document.documentElement.dir="rtl";document.documentElement.lang="ar";document.documentElement.classList.add("font-arabic");}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ErrorBoundary>
          <LocaleProvider>
            <AuthSessionProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </AuthSessionProvider>
          </LocaleProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
