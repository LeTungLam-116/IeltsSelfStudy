import React from 'react';
import type { RecentTransactionDto } from '../../types/report';

interface RecentTransactionsTableProps {
    transactions: RecentTransactionDto[] | undefined;
    isLoading: boolean;
}

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-8 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-slate-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mt-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">Chưa có giao dịch nào</h3>
                <p className="text-sm text-slate-500 max-w-sm">Danh sách giao dịch của bạn hiện đang trống. Bất kỳ khoản thanh toán mới nào cũng sẽ xuất hiện tại đây.</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
                return 'bg-emerald-100 text-emerald-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            case 'failed':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
                return 'Thành công';
            case 'pending':
                return 'Đang xử lý';
            case 'failed':
                return 'Thất bại';
            default:
                return status;
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Giao dịch gần đây</h2>
                <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                    Xem tất cả
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b border-slate-100">
                            <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã GD</th>
                            <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Học viên</th>
                            <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Khóa học</th>
                            <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Số tiền</th>
                            <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 text-sm font-medium text-slate-700 font-mono">
                                    {tx.transactionRef.substring(0, 10)}...
                                </td>
                                <td className="py-4 text-sm text-slate-600">
                                    <div className="font-semibold text-slate-800">{tx.userName}</div>
                                </td>
                                <td className="py-4 text-sm text-slate-600">
                                    {tx.courseName}
                                </td>
                                <td className="py-4 text-sm font-bold text-slate-800">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}
                                </td>
                                <td className="py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                                        {getStatusLabel(tx.status)}
                                    </span>
                                </td>
                                <td className="py-4 text-sm text-slate-500">
                                    {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                                    <span className="text-xs ml-1 text-slate-400">
                                        {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentTransactionsTable;
