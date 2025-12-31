import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import AboutUs from './components/sections/AboutUs';
import Testimonials from './components/sections/Testimonials';
import Footer from './components/sections/Footer';
import ThemeToggle from './components/ui/theme-toggle';

function App() {
  return (
    <div className="bg-transparent min-h-screen text-white overflow-x-hidden selection:bg-white/30">
      <ThemeToggle />
      <Hero />
      <Features />
      <AboutUs />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
