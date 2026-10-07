import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScrollProgress from "@/components/ScrollProgress";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
// import ExplodedView from "@/components/ExplodedView";
import ExplodedView3D from "@/components/ExplodedView3D";
import BodyScan from "@/components/BodyScan";
import Gallery from "@/components/Gallery";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Preloader />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        {/* <Marquee /> */}
        <Stats />
        <Features />
        {/* <ExplodedView /> */}
        {/* <ExplodedView3D /> */}
        <BodyScan />
        <Gallery />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}