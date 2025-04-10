import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function VulnerabilityDetailLoading() {
    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-center items-center min-h-[60vh]">
                <LoadingSpinner
                    size="lg"
                    text="Loading vulnerability details..."
                />
            </div>
        </div>
    );
} 