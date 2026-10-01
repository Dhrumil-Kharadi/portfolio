import { Syne, Instrument_Serif, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  title: "Dhrumil Kharadi — DevOps Engineer & Full-Stack Developer",
  description:
    "Dhrumil Kharadi ships and keeps production systems alive — DevOps, full-stack and agentic AI. 1st place at IIT Gandhinagar, SIH finalist.",
  openGraph: {
    title: "Dhrumil Kharadi — DevOps & Full-Stack",
    description: "Production systems, cinematic interfaces, agentic AI.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#f4f3ef",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${instrument.variable} ${manrope.variable} ${jetbrains.variable} antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "history.scrollRestoration=\"manual\";window.scrollTo(0,0);",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
