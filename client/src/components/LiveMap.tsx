import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';

interface ActiveListener {
  userId: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  isActiveListening: boolean;
}

export default function LiveMap() {
  const { colors } = useTheme();
  const [mapDimensions, setMapDimensions] = useState({ width: 800, height: 400 });

  const { data: activeListeners = [], isLoading } = useQuery({
    queryKey: ['/api/active-listeners'],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Convert lat/lng to SVG coordinates
  const coordToSVG = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * mapDimensions.width;
    const y = ((90 - lat) / 180) * mapDimensions.height;
    return { x, y };
  };

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('live-map-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setMapDimensions({
          width: Math.max(400, rect.width - 40),
          height: Math.max(200, rect.height - 40),
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: colors.text }}>
        <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" 
             style={{ borderColor: colors.primary, borderTopColor: 'transparent' }} />
        <span className="ml-3">Loading live listeners...</span>
      </div>
    );
  }

  return (
    <div id="live-map-container" className="w-full h-full min-h-[300px] relative">
      <div className="absolute top-4 left-4 z-10 px-3 py-2 rounded-lg backdrop-blur-sm"
           style={{ backgroundColor: colors.background + '90', color: colors.text }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full animate-pulse" 
               style={{ backgroundColor: colors.primary }} />
          <span className="text-sm font-medium">
            {activeListeners.length} Active Listeners
          </span>
        </div>
      </div>

      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${mapDimensions.width} ${mapDimensions.height}`}
        className="border border-gray-700 rounded-lg"
        style={{ backgroundColor: colors.cardBackground }}
      >
        {/* World map outline (simplified) */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke={colors.text + '20'} strokeWidth="1"/>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Continents outline (very simplified) */}
        <g stroke={colors.text + '40'} strokeWidth="1" fill="none">
          {/* North America */}
          <path d="M100,120 Q150,100 200,110 L250,130 Q280,150 260,180 L200,200 Q150,190 120,170 Z" />
          
          {/* South America */}
          <path d="M180,220 Q200,240 190,280 Q185,320 175,340 Q170,360 160,340 Q150,320 155,280 Q160,240 180,220 Z" />
          
          {/* Europe */}
          <path d="M350,100 Q380,90 400,110 Q420,130 400,140 Q380,135 360,125 Q350,115 350,100 Z" />
          
          {/* Africa */}
          <path d="M350,150 Q380,160 390,200 Q385,250 375,280 Q365,300 355,280 Q345,250 340,200 Q345,160 350,150 Z" />
          
          {/* Asia */}
          <path d="M420,80 Q500,70 580,90 Q650,110 680,140 Q700,160 680,180 Q650,170 580,160 Q500,150 450,140 Q420,120 420,80 Z" />
          
          {/* Australia */}
          <path d="M580,280 Q620,270 650,280 Q670,290 650,300 Q620,295 590,290 Q580,285 580,280 Z" />
        </g>

        {/* Active listeners */}
        {activeListeners.map((listener: ActiveListener, index: number) => {
          if (!listener.location) return null;
          
          const { x, y } = coordToSVG(listener.location.lat, listener.location.lng);
          
          return (
            <g key={listener.userId}>
              {/* Pulsing ring */}
              <circle 
                cx={x} 
                cy={y} 
                r="8" 
                fill="none" 
                stroke={colors.primary}
                strokeWidth="2"
                opacity="0.6"
              >
                <animate 
                  attributeName="r" 
                  values="8;16;8" 
                  dur="2s" 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="opacity" 
                  values="0.6;0.2;0.6" 
                  dur="2s" 
                  repeatCount="indefinite" 
                />
              </circle>
              
              {/* Main dot */}
              <circle 
                cx={x} 
                cy={y} 
                r="4" 
                fill={colors.primary}
                className="animate-pulse"
              />
              
              {/* Location label (show on hover) */}
              {listener.location.address && (
                <g className="opacity-0 hover:opacity-100 transition-opacity">
                  <rect 
                    x={x + 8} 
                    y={y - 12} 
                    width={listener.location.address.length * 6 + 8}
                    height="20" 
                    fill={colors.background}
                    stroke={colors.primary}
                    strokeWidth="1"
                    rx="4"
                  />
                  <text 
                    x={x + 12} 
                    y={y + 2} 
                    fontSize="10" 
                    fill={colors.text}
                  >
                    {listener.location.address}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 px-3 py-2 rounded-lg backdrop-blur-sm"
           style={{ backgroundColor: colors.background + '90', color: colors.text }}>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full animate-pulse" 
               style={{ backgroundColor: colors.primary }} />
          <span>Live Listeners</span>
        </div>
      </div>
    </div>
  );
}