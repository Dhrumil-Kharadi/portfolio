import IntroProvider from "@/components/IntroProvider";
import Preloader from "@/components/Preloader";
import SmokeBackground from "@/components/SmokeBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Marquee from "@/components/Marquee";
import Work from "@/components/Work";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <IntroProvider>
      <Preloader />
      <SmokeBackground />
      <div aria-hidden className="grain-frame">
        <div className="grain" />
      </div>
      <Navbar />
      <main className="relative">
        <Hero />
        <Marquee />
        <About />
        <Work />
      </main>
      <Footer />
    </IntroProvider>
  );
}
