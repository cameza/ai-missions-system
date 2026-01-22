"use client";

/**
 * Team Logo Component
 * 
 * Displays team logo with fallback to initials when logo unavailable.
 * Handles loading states and error cases gracefully.
 */

import React, { useState } from 'react';
import { getTeamLogoUrl, getTeamInitials } from '@/lib/utils/team-logos';

interface TeamLogoProps {
  /** Club name to display logo for */
  clubName: string;
  /** Size of the logo in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

export function TeamLogo({ clubName, size = 24, className = '' }: TeamLogoProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showFallback, setShowFallback] = useState(false);

  const logoUrl = getTeamLogoUrl(clubName);
  const initials = getTeamInitials(clubName);
  const hasLogo = logoUrl !== null;

  // If no logo available, show fallback immediately
  React.useEffect(() => {
    if (!hasLogo) {
      setShowFallback(true);
      setImageState('error');
    }
  }, [hasLogo]);

  const handleImageLoad = () => {
    setImageState('loaded');
  };

  const handleImageError = () => {
    setImageState('error');
    setShowFallback(true);
  };

  const handleImageLoadStart = () => {
    if (hasLogo) {
      setImageState('loading');
    }
  };

  // Show initials fallback
  if (showFallback || !hasLogo) {
    return (
      <div 
        className={`bg-gray-700 flex items-center justify-center text-white font-medium rounded ${className}`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          fontSize: `${size * 0.4}px`
        }}
      >
        {initials}
      </div>
    );
  }

  // Show logo image with loading overlay
  return (
    <div className={`relative ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <img
        src={logoUrl!}
        alt={`${clubName} logo`}
        width={size}
        height={size}
        className="rounded object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        onLoadStart={handleImageLoadStart}
        style={{ display: imageState === 'loaded' ? 'block' : 'none' }}
      />
      
      {/* Show initials as overlay while loading */}
      {imageState === 'loading' && (
        <div 
          className="absolute inset-0 bg-gray-700 flex items-center justify-center text-white font-medium rounded"
          style={{ fontSize: `${size * 0.4}px` }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
