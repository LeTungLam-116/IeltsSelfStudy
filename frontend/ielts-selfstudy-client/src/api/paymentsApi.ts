import httpClient from './httpClient';

export interface PaymentRequest {
    courseId: number;
    amount: number;
    orderInfo?: string;
}

export interface PaymentResponse {
    paymentUrl: string;
}

export interface PaymentResult {
    success: boolean;
    message: string;
    transactionRef: string;
    courseId?: number;
    amount?: number;
}

export async function createPaymentUrl(data: PaymentRequest): Promise<string> {
    const res = await httpClient.post<{ paymentUrl: string }>('/payments/create-url', data);
    return res.data.paymentUrl;
}

export async function verifyPayment(params: URLSearchParams): Promise<PaymentResult> {
    // Convert URLSearchParams to query string
    const queryString = params.toString();
    const res = await httpClient.get<PaymentResult>(`/payments/verify?${queryString}`);
    return res.data;
}
