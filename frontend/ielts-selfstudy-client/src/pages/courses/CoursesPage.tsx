import { useEffect, useState } from "react";
import { getCourses, type CourseDto } from "../../api/courseApi";

function CoursesPage() {
  const [courses, setCourses] = useState<CourseDto[]>([]);

  useEffect(() => {
    getCourses().then(setCourses).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Courses</h2>
      {courses.length === 0 ? (
        <p>Chưa có khoá học nào.</p>
      ) : (
        <ul>
          {courses.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong> – {c.level} – {c.skill}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CoursesPage;
