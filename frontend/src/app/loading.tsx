'use client';

import { LoadingScreen } from '@/components/ui/loading';

export default function RootLoading() {
  return (
    <div className="min-h-screen">
      <LoadingScreen text="Loading your secure environment..." />
    </div>
  );
}
