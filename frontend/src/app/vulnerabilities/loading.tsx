import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function VulnerabilitiesLoading() {
    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-center items-center min-h-[70vh]">
                <LoadingSpinner
                    size="lg"
                    text="Loading vulnerabilities..."
                />
            </div>
        </div>
    );
} 