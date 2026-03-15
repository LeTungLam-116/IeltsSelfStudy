

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onRangeChange: (startDate: string, endDate: string) => void;
    className?: string;
}

export default function DateRangePicker({ startDate, endDate, onRangeChange, className = '' }: DateRangePickerProps) {
    const handleApply = (newStart: string, newEnd: string) => {
        onRangeChange(newStart, newEnd);
    };

    const setPreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        handleApply(startStr, endStr);
    };

    const setThisQuarter = () => {
        const today = new Date();
        const quarter = Math.floor(today.getMonth() / 3);

        // Ngày đầu quý
        const start = new Date(today.getFullYear(), quarter * 3, 1);

        // Ngày hiện tại
        const end = today;

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        handleApply(startStr, endStr);
    };

    return (
        <div className={`flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${className}`}>
            <div className="flex items-center gap-2">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-500">Từ:</label>
                <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => handleApply(e.target.value, endDate)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-500">Đến:</label>
                <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => handleApply(startDate, e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            {/* Đã bỏ nút "Áp dụng" vì khi dùng Controlled component + onChange, ta cập nhật ngay lập tức */}

            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />

            <div className="flex items-center gap-2">
                <button onClick={() => setPreset(7)} className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 uppercase tracking-wider font-semibold transition-colors">7 ngày</button>
                <button onClick={() => setPreset(30)} className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 uppercase tracking-wider font-semibold transition-colors">30 ngày</button>
                <button onClick={() => setThisQuarter()} className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 uppercase tracking-wider font-semibold transition-colors">Quý này</button>
            </div>
        </div>
    );
}
