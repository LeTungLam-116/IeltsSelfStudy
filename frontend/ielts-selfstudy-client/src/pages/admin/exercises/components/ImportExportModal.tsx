import React, { useState, useRef } from 'react';
import { Modal, Button } from '../../../../components/ui';
import type { ExerciseImportResult, ExerciseExportResult } from '../../../../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ExerciseImportResult>;
  onExport: (format: 'csv' | 'json', includeAnalytics: boolean) => Promise<ExerciseExportResult>;
  isImporting: boolean;
  isExporting: boolean;
  importResult?: ExerciseImportResult | null;
  exportResult?: ExerciseExportResult | null;
}

export function ImportExportModal({
  isOpen,
  onClose,
  onImport,
  onExport,
  isImporting,
  isExporting,
  importResult,
  exportResult,
}: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [includeAnalytics, setIncludeAnalytics] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      await onImport(selectedFile);
      // Clear the file input
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const handleExport = async () => {
    try {
      await onExport(exportFormat, includeAnalytics);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setActiveTab('import');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const renderImportTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nhập bài tập từ file</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tải lên tệp CSV để nhập bài tập hàng loạt. Tệp phải chứa các cột cho tiêu đề, loại, cấp độ, mô tả và các thuộc tính khác của bài tập.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Chọn tệp CSV
            </label>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Yêu cầu định dạng CSV:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>title</strong> (bắt buộc): Tiêu đề bài tập</li>
              <li>• <strong>type</strong> (bắt buộc): Listening, Reading, Writing, hoặc Speaking</li>
              <li>• <strong>level</strong> (tùy chọn): Beginner, Intermediate, hoặc Advanced</li>
              <li>• <strong>description</strong> (tùy chọn): Mô tả bài tập</li>
              <li>• <strong>questionCount</strong> (bắt buộc): Số lượng câu hỏi</li>
              <li>• <strong>isActive</strong> (tùy chọn): true/false (mặc định là true)</li>
              <li>• Các trường đặc thù theo loại (audioUrl, transcript, passageText, v.v.)</li>
            </ul>
          </div>

          <Button
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
            loading={isImporting}
            className="w-full"
          >
            {isImporting ? 'Đang nhập...' : 'Nhập bài tập'}
          </Button>
        </div>
      </div>

      {importResult && (
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Kết quả nhập dữ liệu</h4>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
              <div className="text-sm text-gray-600">Đã nhập</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
              <div className="text-sm text-gray-600">Bỏ qua</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
              <div className="text-sm text-gray-600">Lỗi</div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-red-900 mb-2">Lỗi chi tiết:</h5>
              <ul className="text-sm text-red-800 space-y-1 max-h-32 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {importResult.warnings.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-yellow-900 mb-2">Cảnh báo:</h5>
              <ul className="text-sm text-yellow-800 space-y-1 max-h-32 overflow-y-auto">
                {importResult.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderExportTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Xuất dữ liệu bài tập</h3>
        <p className="text-sm text-gray-600 mb-4">
          Xuất danh sách bài tập ra định dạng CSV hoặc JSON. Bạn có thể chọn bao gồm cả dữ liệu thống kê trong tệp xuất.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Định dạng xuất
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900">CSV (Tương thích bảng tính Excel)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as 'json')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900">JSON (Phù hợp cho lập trình viên)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeAnalytics}
                onChange={(e) => setIncludeAnalytics(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900">
                Bao gồm dữ liệu thống kê (lượt làm bài, điểm số, tỷ lệ đạt)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Dữ liệu thống kê sẽ làm tăng kích thước tệp và thời gian xử lý.
            </p>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            loading={isExporting}
            className="w-full"
          >
            {isExporting ? 'Đang xuất...' : `Xuất file ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
      </div>

      {exportResult && (
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Xuất dữ liệu hoàn tất</h4>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0113.303 5.196l-1.42 1.42A6 6 0 1111.96 3.804l1.42-1.42A8 8 0 0110 18z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h5 className="text-sm font-medium text-green-800">
                  Đã xuất thành công {exportResult.totalExercises} bài tập
                </h5>
                <p className="text-sm text-green-700 mt-1">
                  Tên tệp: {exportResult.fileName}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Thời gian tạo: {exportResult.generatedAt ? new Date(exportResult.generatedAt).toLocaleString('vi-VN') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nhập/Xuất dữ liệu bài tập"
      size="lg"
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" role="tablist" aria-label="Import/Export options">
          <button
            onClick={() => setActiveTab('import')}
            role="tab"
            aria-selected={activeTab === 'import'}
            aria-controls="import-panel"
            id="import-tab"
            tabIndex={activeTab === 'import' ? 0 : -1}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            📥 Nhập từ CSV
          </button>
          <button
            onClick={() => setActiveTab('export')}
            role="tab"
            aria-selected={activeTab === 'export'}
            aria-controls="export-panel"
            id="export-tab"
            tabIndex={activeTab === 'export' ? 0 : -1}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            📤 Xuất dữ liệu
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id="import-panel"
        aria-labelledby="import-tab"
        hidden={activeTab !== 'import'}
        className={activeTab === 'import' ? '' : 'hidden'}
      >
        {renderImportTab()}
      </div>

      <div
        role="tabpanel"
        id="export-panel"
        aria-labelledby="export-tab"
        hidden={activeTab !== 'export'}
        className={activeTab === 'export' ? '' : 'hidden'}
      >
        {renderExportTab()}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t" role="group" aria-label="Modal actions">
        <Button variant="outline" onClick={handleClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
}
