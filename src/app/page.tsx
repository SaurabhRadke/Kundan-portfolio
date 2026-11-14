import { IntroProvider } from "@/components/fx/IntroContext";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { About } from "@/components/sections/About";
import { Algorithms } from "@/components/sections/Algorithms";
import { CNNShowcase } from "@/components/sections/CNNShowcase";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Nav } from "@/components/sections/Nav";
import { Preloader } from "@/components/sections/Preloader";
import { Projects } from "@/components/sections/Projects";

export default function Home() {
  return (
    <IntroProvider>
      <Preloader />
      <SmoothScroll />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <CNNShowcase />
        <Algorithms />
        <Projects />
        <Experience />
        <Contact />
      </main>
    </IntroProvider>
  );
}
