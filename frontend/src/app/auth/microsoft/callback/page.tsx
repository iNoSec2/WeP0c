'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MicrosoftCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams?.get('code');
        const error = searchParams?.get('error');

        if (error) {
            // Send error message to parent window
            window.opener?.postMessage(
                { type: 'MICROSOFT_LOGIN_ERROR', error },
                window.location.origin
            );

            // Close this window
            window.close();
            return;
        }

        if (code) {
            // Send success message with code to the parent window
            window.opener?.postMessage(
                { type: 'MICROSOFT_LOGIN_SUCCESS', code },
                window.location.origin
            );

            // Redirect to home after a short delay (to allow time for the message to be processed)
            setTimeout(() => {
                if (!window.closed) {
                    window.close();
                }
            }, 1000);
        } else {
            // No code or error - this is unexpected
            window.opener?.postMessage(
                { type: 'MICROSOFT_LOGIN_ERROR', error: 'No code received' },
                window.location.origin
            );

            // Close the window
            window.close();
        }
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Processing login...</h1>
                <p>Please wait while we authenticate you.</p>
            </div>
        </div>
    );
} 