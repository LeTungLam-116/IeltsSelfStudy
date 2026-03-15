// React import not required
import { Button } from '../../../components/ui';

interface BulkToolbarProps {
  selectedCount: number;
  onBulkDelete?: () => void;
  onBulkActivate?: () => void;
  onBulkDeactivate?: () => void;
  onClearSelection: () => void;
  isDeleting?: boolean;
  isActivating?: boolean;
  isDeactivating?: boolean;
  showActivateDeactivate?: boolean;
}

export function BulkToolbar({
  selectedCount,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  onClearSelection,
  isDeleting = false,
  isActivating = false,
  isDeactivating = false,
  showActivateDeactivate = false
}: BulkToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  const handleBulkDelete = () => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedCount} mục đã chọn không? Hành động này không thể hoàn tác.`
    );

    if (confirmed && onBulkDelete) {
      onBulkDelete();
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-900">
              Đã chọn {selectedCount}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            disabled={isDeleting || isActivating || isDeactivating}
            className="text-blue-700 border-blue-300 hover:bg-blue-50"
          >
            Bỏ chọn
          </Button>

          {showActivateDeactivate && onBulkActivate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkActivate}
              disabled={isDeleting || isActivating || isDeactivating}
              loading={isActivating}
              className="text-green-700 border-green-300 hover:bg-green-50"
            >
              {isActivating ? 'Đang kích hoạt...' : `Kích hoạt ${selectedCount}`}
            </Button>
          )}

          {showActivateDeactivate && onBulkDeactivate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDeactivate}
              disabled={isDeleting || isActivating || isDeactivating}
              loading={isDeactivating}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
            >
              {isDeactivating ? 'Đang ngưng kích hoạt...' : `Ngưng kích hoạt ${selectedCount}`}
            </Button>
          )}

          {onBulkDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeleting || isActivating || isDeactivating}
              loading={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : `Xóa ${selectedCount}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
