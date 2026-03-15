import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useExerciseStore } from "../../stores";
import { ExerciseCard } from "../../components/exercises";
import Footer from "../../components/home/Footer";

// LayoutContainer component
const LayoutContainer = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

export default function ReadingListPage() {
  const navigate = useNavigate();
  const { exercises, isLoading, error, fetchExercises } = useExerciseStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Filter exercises: Must be 'Reading' type + match search + match level
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const isReading = ex.type.toLowerCase() === 'reading';
      const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesLevel = selectedLevel === "All" || ex.level === selectedLevel;

      return isReading && matchesSearch && matchesLevel;
    });
  }, [exercises, searchQuery, selectedLevel]);

  const handleExerciseStart = (exerciseId: number) => {
    navigate(`/reading/${exerciseId}`);
  };

  if (isLoading) {
    return (
      <div style={{ padding: "100px 0", textAlign: "center", minHeight: "60vh" }}>
        <div className="animate-spin" style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #0071f9",
          borderRadius: "50%",
          margin: "0 auto 20px auto"
        }}></div>
        <p style={{ color: "#64748b", fontWeight: 500 }}>Đang tải bài tập Reading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-red-600 mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchExercises()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header & Filter Section */}
      <section className="bg-white border-b border-slate-200 py-12 md:py-16">
        <LayoutContainer>
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">
              Thư Viện Bài Tập <span className="text-emerald-600">Reading</span> 📚
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Nâng cao kỹ năng đọc hiểu với các bài luyện tập Reading phong phú.
              Học từ vựng mới và rèn luyện tư duy phản biện qua các chủ đề đa dạng.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-8">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-50">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm bài tập theo tên hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 pl-14 pr-5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-base focus:border-emerald-500 focus:bg-white focus:outline-none transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">TRÌNH ĐỘ</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {levels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${selectedLevel === level
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                        : "bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600"
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </LayoutContainer>
      </section>

      {/* Main Content Grid */}
      <section className="py-12 flex-grow">
        <LayoutContainer>
          <div className="flex justify-between items-center mb-8 px-2">
            <h2 className="text-xl font-bold text-slate-800">
              {filteredExercises.length} Bài tập được tìm thấy
            </h2>
            {(searchQuery !== "" || selectedLevel !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLevel("All");
                }}
                className="text-red-500 font-semibold text-sm hover:underline hover:text-red-600 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="text-6xl mb-6 opacity-80">📭</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Không tìm thấy bài tập nào</h3>
              <p className="text-slate-500 text-center max-w-sm">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trình độ để xem thêm kết quả.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExercises.map((exercise) => (
                <div key={exercise.id} className="h-full">
                  <ExerciseCard
                    exercise={exercise}
                    onStart={handleExerciseStart}
                    showStartButton={true}
                  />
                </div>
              ))}
            </div>
          )}
        </LayoutContainer>
      </section>

      <Footer />
    </div>
  );
}