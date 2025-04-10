import React from 'react';
import { Button } from '@/components/ui/button';
import { MicrosoftIcon } from '@/components/icons/MicrosoftIcon';

interface MicrosoftLoginProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export const MicrosoftLogin: React.FC<MicrosoftLoginProps> = ({ onSuccess, onError }) => {
    const handleMicrosoftLogin = async () => {
        try {
            // Microsoft OAuth configuration
            const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
            const redirectUri = `${window.location.origin}/auth/microsoft/callback`;
            const scope = 'User.Read email profile';

            // Construct the Microsoft login URL
            const loginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
                `client_id=${clientId}` +
                `&response_type=code` +
                `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                `&scope=${encodeURIComponent(scope)}` +
                `&response_mode=query`;

            // Open Microsoft login in a popup
            const width = 600;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            const popup = window.open(
                loginUrl,
                'Microsoft Login',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // Handle the OAuth callback
            window.addEventListener('message', async (event) => {
                if (event.origin !== window.location.origin) return;

                if (event.data.type === 'MICROSOFT_LOGIN_SUCCESS') {
                    const { code } = event.data;

                    try {
                        // Send the code to your backend
                        const response = await fetch('/api/auth/microsoft/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ code }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to authenticate with Microsoft');
                        }

                        const data = await response.json();

                        // Store the token
                        document.cookie = `token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 8}`; // 8 days

                        // Close the popup
                        popup?.close();

                        // Call success callback
                        onSuccess?.();
                    } catch (error) {
                        onError?.(error as Error);
                    }
                }
            });
        } catch (error) {
            onError?.(error as Error);
        }
    };

    return (
        <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleMicrosoftLogin}
        >
            <MicrosoftIcon className="w-5 h-5" />
            Sign in with Microsoft
        </Button>
    );
}; 