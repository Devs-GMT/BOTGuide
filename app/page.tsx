import Developers from "@/components/landing/Developers";
import Ecosystem from "@/components/landing/Ecosystem";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import GetStarted from "@/components/landing/GetStarted";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import Showcase from "@/components/landing/Showcase";
import Stats from "@/components/landing/Stats";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Showcase />
        <Developers />
        <Stats />
        <Ecosystem />
        <GetStarted />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
