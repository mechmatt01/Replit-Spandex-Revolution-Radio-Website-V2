import React from 'react';
import { cn } from '@/lib/utils';

interface AdLogoProps {
  brandName: string;
  className?: string;
}

export default function AdLogo({ brandName, className }: AdLogoProps) {
  // Brand-specific logo URLs from Clearbit or fallback to brand colors
  const brandLogos: Record<string, { logo?: string; color: string; textColor: string }> = {
    'Capital One': {
      logo: 'https://logo.clearbit.com/capitalone.com',
      color: '#004879',
      textColor: '#ffffff'
    },
    'McDonald\'s': {
      logo: 'https://logo.clearbit.com/mcdonalds.com',
      color: '#FFC72C',
      textColor: '#DA020E'
    },
    'Coca-Cola': {
      logo: 'https://logo.clearbit.com/coca-cola.com',
      color: '#DA020E',
      textColor: '#ffffff'
    },
    'GEICO': {
      logo: 'https://logo.clearbit.com/geico.com',
      color: '#006847',
      textColor: '#ffffff'
    },
    'Progressive': {
      logo: 'https://logo.clearbit.com/progressive.com',
      color: '#0066CC',
      textColor: '#ffffff'
    },
    'Nike': {
      logo: 'https://logo.clearbit.com/nike.com',
      color: '#000000',
      textColor: '#ffffff'
    },
    'Verizon': {
      logo: 'https://logo.clearbit.com/verizon.com',
      color: '#CD040B',
      textColor: '#ffffff'
    },
    'AT&T': {
      logo: 'https://logo.clearbit.com/att.com',
      color: '#0099D6',
      textColor: '#ffffff'
    }
  };

  const brandInfo = brandLogos[brandName] || {
    color: '#ff4444',
    textColor: '#ffffff'
  };

  return (
    <div 
      className={cn(
        "w-full h-full flex items-center justify-center text-center p-1",
        className
      )}
      style={{ backgroundColor: brandInfo.color, color: brandInfo.textColor }}
    >
      {brandInfo.logo ? (
        <img 
          src={brandInfo.logo} 
          alt={`${brandName} Logo`}
          className="w-full h-full object-contain p-1"
          onError={(e) => {
            // Fallback to text if logo fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="text-xs font-bold">${brandName.replace(' Commercial', '').substring(0, 8)}</span>`;
            }
          }}
        />
      ) : (
        <span className="text-xs font-bold">
          {brandName.replace(' Commercial', '').substring(0, 8)}
        </span>
      )}
    </div>
  );
}