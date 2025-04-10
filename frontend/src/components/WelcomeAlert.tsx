'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export function WelcomeAlert() {
    const [isVisible, setIsVisible] = useState(false); // Start hidden

    if (!isVisible) return null;

    return (
        <div className="hidden">
            {/* This component intentionally returns nothing visible */}
        </div>
    );
} 