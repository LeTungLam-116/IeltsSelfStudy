import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { getAttemptsByUser, type AttemptDto } from '../../api/attemptApi';
import { getUserLevel, type UserLevelDto } from '../../api/placementTestApi';
import { getCourses, getMyEnrolledCourseIds, type CourseDto } from '../../api/courseApi';
import {
  IconDocument, IconBook, IconBell, IconEdit,
  IconChart, IconClock, IconCheckCircle, IconUser
} from '../../components/icons';
export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState<AttemptDto[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevelDto | null>(null);
  const [myCourses, setMyCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user?.id) {
      Promise.all([
        getAttemptsByUser(),
        getUserLevel(),
        getCourses(),
        getMyEnrolledCourseIds().catch(() => [] as number[]) // Catch error if any so it doesn't break Promise.all
      ])
        .then(([attemptsData, levelData, coursesData, enrolledIds]) => {
          setAttempts(attemptsData || []);
          setUserLevel(levelData);

          const myEnrolledCourses = (coursesData || [])
            .filter(c => enrolledIds.includes(c.id))
            .map(c => ({ ...c, isEnrolled: true }));

          setMyCourses(myEnrolledCourses);
        })
        .catch(err => console.error("Failed to load dashboard data", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const completedCount = attempts.length;

  const calculateStreak = () => {
    if (!attempts || attempts.length === 0) return 0;
    const uniqueDates = [...new Set(attempts.map(a => new Date(a.createdAt).toDateString()))];
    return uniqueDates.length;
  };
  const stats = [
    { label: 'Mục tiêu Band', value: user?.targetBand || 'N/A', icon: <IconChart />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Trình độ hiện tại', value: userLevel ? userLevel.overallBand : 'Chưa test', icon: <IconUser />, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Tổng ngày học', value: `${calculateStreak()} ngày`, icon: <IconClock />, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Bài tập đã làm', value: completedCount.toString(), icon: <IconCheckCircle />, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  const skillCards = [
    {
      to: '/writing',
      title: 'Writing Practice',
      desc: 'Luyện tập viết các dạng bài Task 1 & Task 2 với chấm điểm AI chi tiết.',
      icon: <IconDocument className="w-8 h-8" />,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      to: '/reading',
      title: 'Reading Practice',
      desc: 'Cải thiện kỹ năng đọc hiểu qua các bài test Cambridge và thực tế.',
      icon: <IconBook className="w-8 h-8" />,
      color: 'green',
      gradient: 'from-emerald-500 to-teal-500',
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      to: '/listening',
      title: 'Listening Practice',
      desc: 'Nâng cao khả năng nghe qua các bài tập audio chất lượng cao.',
      icon: <IconBell className="w-8 h-8" />,
      color: 'purple',
      gradient: 'from-violet-500 to-purple-500',
      text: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100'
    },
    {
      to: '/speaking',
      title: 'Speaking Practice',
      desc: 'Luyện nói lưu loát, phát âm chuẩn và phản xạ nhanh nhạy.',
      icon: <IconEdit className="w-8 h-8" />,
      color: 'orange',
      gradient: 'from-orange-500 to-amber-500',
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner / Placement Test CTA */}
      {!userLevel ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl mb-10 animate-fade-in">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="relative p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-3 border border-white/20">
                ✨ Dành cho người mới
              </div>
              <h1 className="text-3xl font-extrabold mb-3">Bạn chưa biết trình độ của mình?</h1>
              <p className="text-indigo-100 text-lg opacity-90 max-w-xl">
                Hãy dành 15 phút làm bài kiểm tra đầu vào để hệ thống AI thiết kế lộ trình học cá nhân hóa cho bạn.
              </p>
            </div>
            <button
              onClick={() => navigate('/placement-test')}
              className="bg-white text-indigo-700 font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-gray-50 transition-transform hover:scale-105 shrink-0"
            >
              Kiểm tra trình độ ngay ➝
            </button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0071f9] to-[#00b4d8] text-white shadow-xl mb-10">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>

          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
                  Xin chào, {user?.fullName || 'User'}! 👋
                </h1>
                <p className="text-blue-100 text-lg font-medium opacity-90 max-w-2xl">
                  "Hành trình vạn dặm bắt đầu từ một bước chân. Hãy tiếp tục chinh phục mục tiêu <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-lg">Band {user?.targetBand}</span> của bạn ngay hôm nay!"
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="text-sm text-blue-100 mb-1">Current Level</div>
                  <div className="font-bold text-xl">{userLevel.overallBand} Overall 🚀</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-sm`}>
              {/* Force icon size */}
              <div className="w-7 h-7 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* My Courses Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>📚</span> Khóa học của tôi
        </h2>

        {loading ? (
          <div className="text-slate-500 text-center py-10 bg-slate-50 rounded-3xl animate-pulse">
            Đang tải khóa học...
          </div>
        ) : myCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 cursor-pointer group flex flex-col"
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                      🎓
                    </div>
                  )}
                  {/* Skill Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {course.skill}
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      Band {course.targetBand || '4.0+'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      📝 {course.level}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.name}
                  </h3>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-grow">
                    {course.shortDescription || "Tiếp tục lộ trình học tập để sớm đạt điểm mục tiêu của bạn."}
                  </p>

                  {/* Action Button */}
                  <div className="mt-auto">
                    <button className="w-full py-3 px-4 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm border border-emerald-100 group-hover:border-emerald-500 flex items-center justify-center gap-2">
                      🚀 Tiếp tục học
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-3xl p-10 sm:p-14 border border-dashed border-slate-200 text-center flex flex-col items-center">
            <div className="w-24 h-24 mb-6 bg-white rounded-full shadow-sm flex items-center justify-center text-4xl animate-bounce-slow">
              🎒
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Chưa có khóa học nào</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
              Bạn chưa đăng ký khóa học nào. Khám phá thư viện khóa học dồi dào trên hệ thống để bắt đầu hành trình chinh phục mục tiêu IELTS.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-all text-sm sm:text-base flex items-center gap-2"
            >
              🔍 Khám phá thư viện khóa học
            </button>
          </div>
        )}
      </div>

      {/* Main Skills Navigation */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span>📚</span> Chọn kỹ năng luyện tập
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {skillCards.map((card, index) => (
          <Link
            key={index}
            to={card.to}
            className={`group relative overflow-hidden bg-white rounded-3xl shadow-sm border ${card.border} p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
          >
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500`}></div>

            <div className="relative z-10 flex items-start gap-6">
              <div className={`w-16 h-16 shrink-0 rounded-2xl ${card.bg} ${card.text} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <div className="w-8 h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                  {card.icon}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-slate-500 leading-relaxed mb-6">
                  {card.desc}
                </p>
                <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${card.text}`}>
                  <span className={`bg-white px-4 py-2 rounded-xl shadow-sm border ${card.border} ${card.text} transition-colors group-hover:bg-slate-50`}>
                    Bắt đầu ngay ➝
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>⚡</span> Hoạt động gần đây
          </h2>
          <button onClick={() => navigate('/attempts')} className="text-blue-600 font-bold text-sm hover:underline hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors">Xem tất cả ➝</button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl animate-pulse">
              <span className="text-slate-400 font-medium">Đang tải dữ liệu...</span>
            </div>
          ) : attempts.length > 0 ? (
            attempts.slice(0, 5).map(attempt => {
              const skillStr = attempt.skill || 'Other';
              const skillInitial = skillStr[0] ? skillStr[0].toUpperCase() : '?';

              // Determine styles based on skill
              let skillBg = 'bg-slate-500';
              let skillText = 'text-white';
              if (skillStr === 'Reading') skillBg = 'bg-emerald-500';
              if (skillStr === 'Listening') skillBg = 'bg-purple-500';
              if (skillStr === 'Writing') skillBg = 'bg-blue-500';
              if (skillStr === 'Speaking') skillBg = 'bg-orange-500';

              // Determine outcome styles
              const hasScore = attempt.score !== undefined && attempt.score !== null;
              const isPassed = attempt.isPassed === true;

              return (
                <Link to={`/attempts/${attempt.id}`} key={attempt.id} className="block group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white rounded-2xl hover:bg-slate-50 transition-all border border-slate-100 hover:border-blue-200 hover:shadow-md">

                    {/* Left: Icon & Meta */}
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${skillBg} ${skillText} group-hover:scale-105 transition-transform`}>
                        {skillInitial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white ${skillBg} opacity-90`}>
                            {skillStr}
                          </span>
                          {hasScore && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {isPassed ? 'Passed' : 'Review'}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {attempt.exerciseTitle || `${skillStr} Practice`}
                        </h4>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">
                          {new Date(attempt.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })} lúc {new Date(attempt.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Right: Score */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4 sm:border-l border-slate-100">
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-medium mb-0.5 uppercase tracking-wide">Kết quả</div>
                        <div className="font-black text-2xl text-slate-800 leading-none">
                          {hasScore ? attempt.score?.toFixed(1) : '-'}
                          <span className="text-sm text-slate-400 font-bold ml-0.5 opacity-60">/ {attempt.maxScore || 9}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                        ➝
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-12 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm mb-4">
                📝
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa có bài tập nào</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                Bạn chưa hoàn thành bài tập nào. Hãy chọn một kỹ năng và bắt đầu làm bài để hệ thống phân tích năng lực của bạn!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
