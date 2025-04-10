'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function VulnerabilityCreateError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Vulnerability creation error:', error);
    }, [error]);

    return (
        <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="p-6 border rounded-lg shadow-md bg-white w-full max-w-lg">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error Creating Vulnerability</h2>
                <p className="text-gray-700 mb-6">
                    We encountered an error while creating the vulnerability.
                </p>
                <div className="bg-gray-100 p-4 rounded mb-6 overflow-auto">
                    <code className="text-sm text-red-500">
                        {typeof error.message === 'string' ? error.message : 'Complex error object - check console for details'}
                    </code>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
                    >
                        Try Again
                    </button>
                    <Link href="/vulnerabilities" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition">
                        Back to Vulnerabilities
                    </Link>
                </div>
            </div>
        </div>
    );
}
