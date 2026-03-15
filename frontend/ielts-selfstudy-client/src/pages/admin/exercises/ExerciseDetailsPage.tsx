import { useEffect, useState, memo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExerciseStore } from '../../../stores';
import { Button } from '../../../components/ui';
import { IconDocument, IconEye, IconChart, IconBook, IconEdit } from '../../../components/icons';
import { importQuestionsFromExcel } from '../../../services/exerciseService';

// Memoize the component to prevent unnecessary re-renders
const ExerciseDetailsPage = memo(function ExerciseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const exerciseStore = useExerciseStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    currentExercise,
    exercisePreview,
    exerciseAnalytics,
    exerciseVersions,
    isLoading,
    fetchExerciseById,
    fetchExercisePreview,
    fetchExerciseAnalytics,
    fetchExerciseVersions,
  } = exerciseStore;

  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'analytics' | 'versions'>('overview');
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (id) {
      const exerciseId = parseInt(id);
      fetchExerciseById(exerciseId);
      fetchExercisePreview(exerciseId);
      fetchExerciseAnalytics(exerciseId);
      fetchExerciseVersions(exerciseId);
    }
  }, [id, fetchExerciseById, fetchExercisePreview, fetchExerciseAnalytics, fetchExerciseVersions]);

  const handleBack = () => {
    navigate('/admin/exercises');
  };

  const handleEdit = () => {
    navigate(`/admin/exercises/${id}/edit`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    // Validate file type
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls')) {
      setImportMessage({ type: 'error', text: 'Chỉ hỗ trợ file Excel (.xlsx, .xls)' });
      return;
    }

    setIsImporting(true);
    setImportMessage(null);

    try {
      const result = await importQuestionsFromExcel(parseInt(id), file);
      setImportMessage({ type: 'success', text: `Đã import thành công ${result.count} câu hỏi!` });
      // Refresh exercise data
      fetchExerciseById(parseInt(id));
      fetchExercisePreview(parseInt(id));
    } catch (error) {
      setImportMessage({ type: 'error', text: (error as Error).message || 'Import thất bại' });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Listening': return 'bg-blue-100 text-blue-800';
      case 'Reading': return 'bg-green-100 text-green-800';
      case 'Writing': return 'bg-purple-100 text-purple-800';
      case 'Speaking': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung cấp';
      case 'advanced': return 'Nâng cao';
      default: return level;
    }
  };

  if (isLoading && !currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4"><IconDocument /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài tập</h2>
          <p className="text-gray-600 mb-4">Bài tập bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={handleBack}>Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
          >
            ← Quay lại danh sách
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{currentExercise.title || 'Bài tập chưa có tiêu đề'}</h1>
          <p className="text-gray-600 mt-1">{currentExercise.description}</p>
        </div>
        <div className="flex gap-2">
          {/* Hidden file input for import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="hidden"
          />
          <Button
            onClick={handleImportClick}
            disabled={isImporting}
            variant="secondary"
          >
            {isImporting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Đang import...
              </>
            ) : (
              <>
                <span className="mr-2">📥</span>
                Import câu hỏi
              </>
            )}
          </Button>
          <Button onClick={handleEdit} disabled={!currentExercise}>
            <span className="mr-2"><IconEdit /></span>
            Sửa bài tập
          </Button>
        </div>
      </div>

      {/* Import Message */}
      {importMessage && (
        <div className={`p-4 rounded-lg ${importMessage.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
          {importMessage.type === 'success' ? '✅ ' : '❌ '}
          {importMessage.text}
        </div>
      )}

      {/* Exercise Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3"><IconDocument /></div>
            <div>
              <p className="text-sm text-gray-600">Kỹ năng</p>
              <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getTypeBadgeColor(currentExercise.type)}`}>
                {currentExercise.type}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3"><IconChart /></div>
            <div>
              <p className="text-sm text-gray-600">Độ khó</p>
              <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getLevelBadgeColor(currentExercise.level || '')}`}>
                {getLevelLabel(currentExercise.level || '')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3"><IconDocument /></div>
            <div>
              <p className="text-sm text-gray-600">
                {currentExercise.type === 'Writing' && 'Loại Task'}
                {currentExercise.type === 'Speaking' && 'Phần (Part)'}
                {(currentExercise.type === 'Listening' || currentExercise.type === 'Reading') && 'Số câu hỏi'}
              </p>
              <p className="text-lg font-semibold">
                {currentExercise.type === 'Writing' && (currentExercise.taskType || 'N/A')}
                {currentExercise.type === 'Speaking' && (currentExercise.part || 'N/A')}
                {(currentExercise.type === 'Listening' || currentExercise.type === 'Reading') &&
                  (currentExercise.questionCount || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3"><IconChart /></div>
            <div>
              <p className="text-sm text-gray-600">Lượt làm bài</p>
              <p className="text-lg font-semibold">{currentExercise.totalAttempts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Tổng quan', icon: <IconDocument /> },
              { id: 'preview', label: 'Xem trước', icon: <IconEye /> },
              { id: 'analytics', label: 'Thống kê', icon: <IconChart /> },
              { id: 'versions', label: 'Lịch sử', icon: <IconBook /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full mt-1 ${currentExercise.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {currentExercise.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(currentExercise.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cập nhật lần cuối</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {currentExercise.lastModifiedAt ? new Date(currentExercise.lastModifiedAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Người cập nhật</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {currentExercise.lastModifiedBy || 'Hệ thống'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Type-specific information */}
              {currentExercise.type === 'Listening' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Chi tiết Listening</h3>
                  <div className="space-y-3">
                    {currentExercise.audioUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">URL Audio</label>
                        <a href={currentExercise.audioUrl} target="_blank" rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm">
                          {currentExercise.audioUrl}
                        </a>
                      </div>
                    )}
                    {currentExercise.durationSeconds && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Thời lượng</label>
                        <p className="text-sm text-gray-900">{currentExercise.durationSeconds} giây</p>
                      </div>
                    )}
                    {currentExercise.transcript && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Transcript (Bản gỡ băng)</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.transcript}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentExercise.type === 'Reading' && currentExercise.passageText && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Bài đọc (Passage)</h3>
                  <div className="p-4 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.passageText}</p>
                  </div>
                </div>
              )}

              {currentExercise.type === 'Writing' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Chi tiết Writing</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loại Task</label>
                      <p className="text-sm text-gray-900">{currentExercise.taskType || 'Task 2'}</p>
                    </div>
                    {currentExercise.minWordCount && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số từ tối thiểu</label>
                        <p className="text-sm text-gray-900">{currentExercise.minWordCount} từ</p>
                      </div>
                    )}
                    {currentExercise.topic && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Chủ đề (Topic)</label>
                        <p className="text-sm text-gray-900">{currentExercise.topic}</p>
                      </div>
                    )}
                    {currentExercise.question && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Câu hỏi (Đề bài)</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.question}</p>
                        </div>
                      </div>
                    )}
                    {currentExercise.sampleAnswer && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bài mẫu (Sample Answer)</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.sampleAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentExercise.type === 'Speaking' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Chi tiết Speaking</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phần (Part)</label>
                      <p className="text-sm text-gray-900">{currentExercise.part || 'Part 1'}</p>
                    </div>
                    {currentExercise.question && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Câu hỏi/Gợi mở</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.question}</p>
                        </div>
                      </div>
                    )}
                    {currentExercise.tips && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lời khuyên (Tips)</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentExercise.tips}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div>
              {exercisePreview ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Xem trước bài tập</h3>
                    <span className="text-sm text-gray-500">
                      Thời gian dự kiến: {exercisePreview.estimatedDuration} giây
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentExercise.type === 'Listening' && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          <span className="text-sm font-medium text-green-800">Có Audio</span>
                        </div>
                      </div>
                    )}
                    {currentExercise.type === 'Reading' && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">✓</span>
                          <span className="text-sm font-medium text-blue-800">Có văn bản</span>
                        </div>
                      </div>
                    )}
                    {(currentExercise.type === 'Listening' || currentExercise.type === 'Reading') && (
                      <div className="bg-purple-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">✓</span>
                          <span className="text-sm font-medium text-purple-800">Có câu hỏi</span>
                        </div>
                      </div>
                    )}
                    {currentExercise.type === 'Writing' && (
                      <div className="bg-orange-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <span className="text-orange-600 mr-2">✓</span>
                          <span className="text-sm font-medium text-orange-800">Writing Task</span>
                        </div>
                      </div>
                    )}
                    {currentExercise.type === 'Speaking' && (
                      <div className="bg-teal-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <span className="text-teal-600 mr-2">✓</span>
                          <span className="text-sm font-medium text-teal-800">Speaking Part</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">Dữ liệu xem trước</h4>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {JSON.stringify(exercisePreview.previewData, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4"><IconEye /></div>
                  <p className="text-gray-600">Không có bản xem trước cho loại bài tập này.</p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              {exerciseAnalytics ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Thống kê hiệu suất</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{exerciseAnalytics.totalAttempts}</div>
                      <div className="text-sm text-gray-600">Tổng lượt làm bài</div>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{exerciseAnalytics.averageScore?.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Điểm trung bình</div>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">{exerciseAnalytics.passRate?.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Tỷ lệ đạt</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Phân bổ điểm số</h4>
                    <div className="space-y-2">
                      {exerciseAnalytics.popularScoreRanges?.map((range, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 w-16">{range.range}</span>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(range.count / exerciseAnalytics.totalAttempts) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{range.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Hoạt động gần đây</h4>
                    <p className="text-sm text-gray-600">
                      Lượt làm bài cuối: {exerciseAnalytics.lastAttemptAt ? new Date(exerciseAnalytics.lastAttemptAt).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Thời gian làm bài trung bình: {Math.round((exerciseAnalytics.averageTimeSpent || 0) / 60)} phút
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4"><IconChart /></div>
                  <p className="text-gray-600">Chưa có dữ liệu thống kê.</p>
                  <p className="text-sm text-gray-500 mt-2">Dữ liệu sẽ hiển thị khi học viên bắt đầu làm bài tập này.</p>
                </div>
              )}
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === 'versions' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lịch sử phiên bản</h3>
              {exerciseVersions && exerciseVersions.length > 0 ? (
                <div className="space-y-4">
                  {exerciseVersions.map((version) => (
                    <div key={version.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            v{version.version}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${version.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {version.isActive ? 'Hiện tại' : 'Đã lưu trữ'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(version.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {version.changeNotes && (
                        <p className="text-sm text-gray-600 mt-2">{version.changeNotes}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Sửa bởi: {version.createdBy}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4"><IconBook /></div>
                  <p className="text-gray-600">Chưa có lịch sử phiên bản nào.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ExerciseDetailsPage.displayName = 'ExerciseDetailsPage';

export default ExerciseDetailsPage;
