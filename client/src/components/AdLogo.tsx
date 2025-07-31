import React from 'react';
import { Music, AlertCircle } from 'lucide-react';

interface AdLogoProps {
  isAd?: boolean;
  brandLogo?: string;
  brandName?: string;
  className?: string;
  size?: number;
}

/**
 * Component for displaying appropriate logos based on content type
 * - Music content: Music icon
 * - Generic ads: Alert/Ad symbol
 * - Brand ads: Brand logo
 * - Blocked content: Default music icon (hidden from user)
 */
export function AdLogo({ 
  isAd = false, 
  brandLogo, 
  brandName, 
  className = "w-12 h-12", 
  size = 48 
}: AdLogoProps) {
  
  // Brand commercial with logo
  if (isAd && brandLogo && brandName) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <img 
          src={brandLogo}
          alt={`${brandName} Logo`}
          className="w-full h-full object-contain rounded"
          onError={(e) => {
            // Fallback to ad symbol if logo fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <AlertCircle 
          size={size * 0.75} 
          className="hidden text-yellow-500" 
        />
      </div>
    );
  }
  
  // Generic commercial
  if (isAd) {
    return (
      <div className={`${className} flex items-center justify-center bg-yellow-500/20 rounded-full`}>
        <AlertCircle 
          size={size * 0.6} 
          className="text-yellow-500" 
        />
      </div>
    );
  }
  
  // Regular music content
  return (
    <div className={`${className} flex items-center justify-center bg-primary/20 rounded-full`}>
      <Music 
        size={size * 0.6} 
        className="text-primary" 
      />
    </div>
  );
}

export default AdLogo;