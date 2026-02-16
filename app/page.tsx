import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ServicesCards from "../components/ServicesCards";
import WhyChoose from "../components/WhyChoose";
import Footer from "../components/Footer"


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ServicesCards />
      <WhyChoose />
      <Footer />
    </>
  );
}
