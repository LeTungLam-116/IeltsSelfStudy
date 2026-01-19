import NewHeader from '../components/newhome/NewHeader';
import NewHero from '../components/newhome/NewHero';
import NewFeatured from '../components/newhome/NewFeatured';
import NewSkills from '../components/newhome/NewSkills';
import NewCourses from '../components/newhome/NewCourses';
import Footer from '../components/home/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <NewHeader />
      {/* Bọc các section chính vào container căn giữa */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NewHero />
        <NewFeatured />
        <NewSkills />
        <NewCourses />
      </div>
      <Footer />
    </div>
  );
}