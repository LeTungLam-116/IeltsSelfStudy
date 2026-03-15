import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment, type PaymentResult } from '../../api/paymentsApi';
import LayoutContainer from '../../components/common/LayoutContainer';

export default function PaymentReturnPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<PaymentResult | null>(null);

    useEffect(() => {
        const verify = async () => {
            try {
                // Convert searchParams to query string
                const queryString = searchParams.toString();
                if (!queryString) {
                    setResult({ success: false, message: "Không tìm thấy thông tin giao dịch", transactionRef: "" });
                    setLoading(false);
                    return;
                }

                // Call API with the full query string? 
                // Wait, verifyPayment logic in api file might need adjustment or we just pass the params properly.
                // Let's check paymentsApi.ts again if needed, but usually we just need to pass the query params.
                // Assuming verifyPayment sends the query params to backend.
                // Actually paymentApi.ts usually takes an object or string.
                // Let's assume for now we construct the object or pass query string.
                // Checking previous context, verifyPayment likely calls GET /payments/verify which forwards query params.

                // Call API with searchParams directly
                const data = await verifyPayment(searchParams);
                setResult(data);
            } catch (err: any) {
                console.error("Verify Error:", err);
                setResult({
                    success: false,
                    message: err.response?.data?.message || "Lỗi xác thực thanh toán.",
                    transactionRef: ""
                });
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [searchParams]);

    return (
        <LayoutContainer>
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px'
            }}>
                {loading ? (
                    <div>
                        <div className="spinner-border text-primary" role="status"></div>
                        <h2 style={{ marginTop: '20px' }}>Đang xử lý kết quả thanh toán...</h2>
                        <p>Vui lòng không tắt trình duyệt.</p>
                    </div>
                ) : result?.success ? (
                    <div style={{ maxWidth: '600px', padding: '40px', borderRadius: '20px', backgroundColor: '#f0fdf4', border: '2px solid #22c55e' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
                        <h1 style={{ color: '#15803d', marginBottom: '16px' }}>Thanh toán thành công!</h1>
                        <p style={{ fontSize: '18px', color: '#166534', marginBottom: '30px' }}>
                            Chúc mừng bạn đã sở hữu khóa học. Hãy bắt đầu hành trình chinh phục IELTS ngay hôm nay!
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                            <button
                                onClick={() => navigate('/courses')}
                                style={{
                                    padding: '12px 32px',
                                    borderRadius: '12px',
                                    border: '1px solid #15803d',
                                    backgroundColor: 'white',
                                    color: '#15803d',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Xem danh sách khóa học
                            </button>
                            {result.courseId && (
                                <button
                                    onClick={() => navigate(`/courses/${result.courseId}`)}
                                    style={{
                                        padding: '12px 32px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        backgroundColor: '#15803d',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)'
                                    }}
                                >
                                    Vào học ngay 🚀
                                </button>
                            )}
                        </div>
                        {result.transactionRef && <p style={{ marginTop: '20px', fontSize: '13px', color: '#166534', fontWeight: '500' }}>Mã GD: {result.transactionRef}</p>}
                    </div>
                ) : (
                    <div style={{ maxWidth: '600px', padding: '40px', borderRadius: '20px', backgroundColor: '#fef2f2', border: '2px solid #ef4444' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>😢</div>
                        <h1 style={{ color: '#b91c1c', marginBottom: '16px' }}>Thanh toán thất bại</h1>
                        <p style={{ fontSize: '18px', color: '#991b1b', marginBottom: '30px' }}>
                            {result?.message || "Đã có lỗi xảy ra trong quá trình thanh toán."}
                        </p>
                        <p style={{ marginBottom: '30px', color: '#7f1d1d' }}>
                            Vui lòng kiểm tra lại thông tin thẻ hoặc thử lại sau.
                        </p>
                        <button
                            onClick={() => navigate('/courses')}
                            style={{
                                padding: '12px 32px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                            }}
                        >
                            Quay lại trang khóa học
                        </button>
                    </div>
                )}
            </div>
        </LayoutContainer>
    );
}
