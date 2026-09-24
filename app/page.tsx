import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import ExplodedView from "@/components/ExplodedView";
import Gallery from "@/components/Gallery";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Stats />
        <Features />
        <ExplodedView />
        <Gallery />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}