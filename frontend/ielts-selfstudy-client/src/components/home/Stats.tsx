import React from 'react';

interface StatItem {
  label: string;
  value: string;
  description: string;
}

export const Stats: React.FC = () => {
  const stats: StatItem[] = [
    {
      label: 'Người Học Đang Hoạt Động',
      value: '10,000+',
      description: 'Học sinh trên toàn thế giới'
    },
    {
      label: 'Bài Tập Luyện Tập',
      value: '200+',
      description: 'Bao quát toàn diện'
    },
    {
      label: 'Giờ Học Tập',
      value: '50,000+',
      description: 'Tiết kiệm thời gian với việc học hiệu quả'
    },
    {
      label: 'Tỷ Lệ Thành Công',
      value: '85%',
      description: 'Học sinh đạt được điểm mục tiêu'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tham Gia Cùng Hàng Nghìn Người Học Thành Công
          </h2>
          <p className="text-lg text-gray-600">
            Xem cách nền tảng của chúng tôi giúp học sinh trên toàn thế giới đạt được mục tiêu IELTS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-600">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
