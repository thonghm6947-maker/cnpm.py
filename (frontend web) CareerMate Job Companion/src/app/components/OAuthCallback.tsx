import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { UserRole } from '../App';

// --- Props Definition ---
interface OAuthCallbackProps {
    onLoginSuccess: (role: UserRole) => void;
    onError: () => void;
}

export default function OAuthCallback({ onLoginSuccess, onError }: OAuthCallbackProps) {
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Đang xử lý đăng nhập...');

    useEffect(() => {
        const processOAuthCallback = () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            const role = params.get('role');
            const error = params.get('error');

            if (error) {
                setStatus('error');
                setMessage('Đăng nhập Google thất bại. Vui lòng thử lại.');
                setTimeout(() => onError(), 2000);
                return;
            }

            if (token) {
                // Store token in localStorage (compatible with existing api.js)
                localStorage.setItem('access_token', token);
                if (role) {
                    localStorage.setItem('user_role', role);
                }

                setStatus('success');
                setMessage('Đăng nhập thành công! Đang chuyển hướng...');

                // Map role to UserRole type
                let userRole: UserRole = 'user';
                if (role === 'recruiter') {
                    userRole = 'recruiter';
                } else if (role === 'admin') {
                    userRole = 'admin';
                } else if (role === 'candidate') {
                    userRole = 'user';
                }

                // Redirect after short delay for UX
                setTimeout(() => onLoginSuccess(userRole), 1000);
            } else {
                setStatus('error');
                setMessage('Không tìm thấy token xác thực. Vui lòng thử lại.');
                setTimeout(() => onError(), 2000);
            }
        };

        processOAuthCallback();
    }, [onLoginSuccess, onError]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl border border-gray-100 text-center">
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto" />
                        <h2 className="text-xl font-semibold text-gray-900">{message}</h2>
                        <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="text-xl font-semibold text-gray-900">{message}</h2>
                        <p className="text-sm text-gray-500">Bạn sẽ được chuyển hướng ngay...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h2 className="text-xl font-semibold text-gray-900">{message}</h2>
                        <p className="text-sm text-gray-500">Đang quay lại trang đăng nhập...</p>
                    </>
                )}
            </div>
        </div>
    );
}
