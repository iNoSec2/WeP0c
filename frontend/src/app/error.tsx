'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <h1 className="text-center text-3xl font-extrabold text-gray-900">
                            Something went wrong
                        </h1>
                        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                            <div className="mb-6">
                                <p className="text-red-600 mb-4 font-medium">An unexpected error occurred</p>
                                <div className="bg-red-50 border border-red-200 rounded-md p-4 overflow-auto max-h-32">
                                    <code className="text-sm text-red-800 whitespace-pre-wrap">
                                        {typeof error.message === 'string' ? error.message : 'Complex error object - check console for details'}
                                    </code>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                                <button
                                    onClick={() => reset()}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Try again
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Go to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}