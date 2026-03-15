import Header from '../components/home/Header';
import Hero from '../components/home/Hero';
import Featured from '../components/home/Featured';
import Skills from '../components/home/Skills';
import Courses from '../components/home/Courses';
import Footer from '../components/home/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-[72px]">
        <Hero />
        <Featured />
        <Skills />
        <Courses />
      </main>
      <Footer />
    </div>
  );
}