import { Button } from '../ui';

type Props = {
  open: boolean;
  onClose: () => void;
  course?: { id: number; title: string; description: string; price?: string };
};

export default function CoursePreviewModal({ open, onClose, course }: Props) {
  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl z-10 max-w-xl w-full p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold">{course.title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <p className="text-gray-600 mt-4">{course.description}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button className="bg-teal-600 text-white">Bắt đầu</Button>
        </div>
      </div>
    </div>
  );
}


