import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses, getMyEnrolledCourseIds, type CourseDto } from "../../api/courseApi";
import { useAuthStore } from "../../stores/authStore";
import LayoutContainer from "../../components/common/LayoutContainer";
import Footer from "../../components/home/Footer";

export default function CoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const skills = ["All", "Listening", "Reading", "Writing", "Speaking"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    const fetchCoursesAsync = async () => {
      try {
        const data = await getCourses();
        if (user?.id) {
          try {
            const enrolledIds = await getMyEnrolledCourseIds();
            const mappedCourses = data.map(c => ({
              ...c,
              isEnrolled: enrolledIds.includes(c.id)
            }));
            setCourses(mappedCourses);
          } catch (e) {
            setCourses(data); // Default to generic data if token check fails
          }
        } else {
          setCourses(data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách khóa học:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAsync();
  }, [user]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesSkill = selectedSkill === "All" || course.skill === selectedSkill;
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    return matchesSearch && matchesSkill && matchesLevel;
  });

  const fallbackIcons = ["📚", "🎓", "🏆", "🌟", "📖"];

  if (loading) {
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
        <p style={{ color: "#64748b", fontWeight: 500 }}>Đang tải thư viện khóa học...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Header & Filter Section */}
      <section style={{
        padding: "60px 0 40px 0",
        backgroundColor: "white",
        borderBottom: "1px solid #e2e8f0"
      }}>
        <LayoutContainer>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{
              fontSize: "36px",
              fontWeight: 900,
              color: "#1e293b",
              marginBottom: "16px",
              letterSpacing: "-0.02em"
            }}>
              Thư Viện <span style={{ color: "#0071f9" }}>Khóa Học</span>
            </h1>
            <p style={{ color: "#64748b", fontSize: "18px", maxWidth: "600px", margin: "0 auto" }}>
              Hệ thống lộ trình học IELTS bài bản, từ mất gốc đến chinh phục Band 7.0+
            </p>
          </div>

          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* Search Bar */}
            <div style={{ position: "relative", marginBottom: "32px" }}>
              <span style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", fontSize: "20px" }}>🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm khóa học theo tên hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px 20px 16px 56px",
                  borderRadius: "20px",
                  border: "2px solid #f1f5f9",
                  backgroundColor: "#f8fafc",
                  fontSize: "16px",
                  transition: "all 0.2s",
                  outline: "none"
                }}
              />
            </div>

            {/* Filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", marginLeft: "4px" }}>KỸ NĂNG</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {skills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => setSelectedSkill(skill)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        border: "1px solid",
                        borderColor: selectedSkill === skill ? "#0071f9" : "#e2e8f0",
                        backgroundColor: selectedSkill === skill ? "#0071f9" : "white",
                        color: selectedSkill === skill ? "white" : "#64748b",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", marginLeft: "4px" }}>TRÌNH ĐỘ</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {levels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        border: "1px solid",
                        borderColor: selectedLevel === level ? "#0071f9" : "#e2e8f0",
                        backgroundColor: selectedLevel === level ? "#0071f9" : "white",
                        color: selectedLevel === level ? "white" : "#64748b",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
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

      {/* Course Grid Section */}
      <section style={{ padding: "60px 0" }}>
        <LayoutContainer>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            padding: "0 10px"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b" }}>
              {filteredCourses.length} Khóa học được tìm thấy
            </h2>
            {(searchQuery !== "" || selectedSkill !== "All" || selectedLevel !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSkill("All");
                  setSelectedLevel("All");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>

          {filteredCourses.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "100px 0",
              backgroundColor: "white",
              borderRadius: "32px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🌵</div>
              <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b", marginBottom: "12px" }}>
                Không tìm thấy khóa học nào
              </h3>
              <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto" }}>
                Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để tìm thấy lộ trình phù hợp.
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "30px",
              padding: "10px"
            }}>
              {filteredCourses.map((c, index) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/courses/${c.id}`)}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    border: "1px solid #f1f5f9",
                    cursor: "pointer"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px)";
                    e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.1)";
                    e.currentTarget.style.borderColor = "#0071f933";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px -2px rgba(0,0,0,0.05)";
                    e.currentTarget.style.borderColor = "#f1f5f9";
                  }}
                >
                  {/* Thumbnail Container */}
                  <div style={{
                    position: "relative",
                    height: "200px",
                    backgroundColor: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                  }}>
                    {c.thumbnailUrl ? (
                      <img
                        src={c.thumbnailUrl}
                        alt={c.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ fontSize: "72px" }}>
                        {fallbackIcons[index % fallbackIcons.length]}
                      </div>
                    )}

                    <div style={{
                      position: "absolute",
                      top: "16px",
                      left: "16px",
                      backgroundColor: "rgba(0, 113, 249, 0.9)",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "99px",
                      fontSize: "12px",
                      fontWeight: 700,
                      backdropFilter: "blur(4px)"
                    }}>
                      {c.skill}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "24px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#0071f9" }}>BAND: {c.targetBand || "4.0+"}</span>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>📝 {c.level}</span>
                    </div>

                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: "12px",
                      lineHeight: 1.3
                    }}>
                      {c.name}
                    </h3>

                    <p style={{
                      fontSize: "14px",
                      color: "#64748b",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                      flexGrow: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {c.shortDescription || "Khóa học lộ trình chuẩn Cambridge giúp bạn chinh phục mục tiêu IELTS một cách khoa học và hiệu quả."}
                    </p>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      paddingTop: "20px",
                      borderTop: "1px solid #f1f5f9"
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>
                          {c.isEnrolled ? "Trạng thái" : "Học phí"}
                        </div>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: c.isEnrolled ? "#10b981" : "#1e293b" }}>
                          {c.isEnrolled ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              ✅ Đã sở hữu
                            </span>
                          ) : (
                            c.price ? `${c.price.toLocaleString("vi-VN")}đ` : "Miễn phí"
                          )}
                        </div>
                      </div>
                      <button
                        style={{
                          backgroundColor: c.isEnrolled ? "#10b981" : "#0071f9",
                          color: "white",
                          padding: "10px 20px",
                          borderRadius: "14px",
                          fontWeight: 700,
                          fontSize: "14px",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: c.isEnrolled ? "0 4px 12px rgba(16, 185, 129, 0.25)" : "0 4px 12px rgba(0, 113, 249, 0.25)",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = c.isEnrolled ? "#059669" : "#0062d9";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = c.isEnrolled ? "#10b981" : "#0071f9";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {c.isEnrolled ? "Vào học" : "Tìm hiểu thêm"}
                      </button>
                    </div>
                  </div>
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
