import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface StatisticData {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: string;
  trend: "up" | "down" | "stable";
  percentage: number;
  format: "number" | "time" | "percentage";
}

export default function LiveStatistics() {
  const { getColors, currentTheme } = useTheme();
  const colors = getColors();
  const [statistics, setStatistics] = useState<StatisticData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching live statistics data
    const fetchLiveStatistics = () => {
      // Mock data for demonstration - in production this would come from your API
      const mockStats: StatisticData[] = [
        {
          id: "1",
          label: "Live Listeners",
          value: 4086,
          unit: "",
          icon: "🎧",
          trend: "up",
          percentage: 12.5,
          format: "number"
        },
        {
          id: "2",
          label: "Stream Uptime (days)", 
          value: 847,
          unit: "",
          icon: "📡",
          trend: "up",
          percentage: 100,
          format: "number"
        },
        {
          id: "3",
          label: "Songs Played Today",
          value: 342,
          unit: "",
          icon: "🎸",
          trend: "up",
          percentage: 8.3,
          format: "number"
        },
        {
          id: "4",
          label: "Peak Listeners Today",
          value: 5247,
          unit: "",
          icon: "📈",
          trend: "up",
          percentage: 15.7,
          format: "number"
        },
        {
          id: "5",
          label: "Active Countries",
          value: 67,
          unit: "",
          icon: "🌍",
          trend: "stable",
          percentage: 2.1,
          format: "number"
        },
        {
          id: "6",
          label: "Avg Session (Mins)",
          value: 47,
          unit: "",
          icon: "⏱️",
          trend: "up",
          percentage: 6.8,
          format: "time"
        }
      ];

      setTimeout(() => {
        setStatistics(mockStats);
        setIsLoading(false);
      }, 800);
    };

    fetchLiveStatistics();

    // Update statistics every 30 seconds
    const statsInterval = setInterval(() => {
      setStatistics(prev => prev.map(stat => ({
        ...stat,
        value: stat.id === "1" ? Math.floor(Math.random() * 500) + 3800 : stat.value, // Vary live listeners
        percentage: Math.random() * 20 - 5 // Random percentage change between -5% and 15%
      })));
    }, 30000);

    return () => clearInterval(statsInterval);
  }, []);

  const formatValue = (stat: StatisticData) => {
    switch (stat.format) {
      case "number":
        return stat.value.toLocaleString();
      case "time":
        return `${stat.value}`;
      case "percentage":
        return `${stat.value}%`;
      default:
        return stat.value.toString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "➡️";
      default:
        return "➡️";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "#10B981"; // Green for up
      case "down":
        return "#EF4444"; // Red for down
      case "stable":
        return "#6B7280"; // Gray for stable
      default:
        return "#6B7280"; // Gray default
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl" style={{ backgroundColor: colors.cardBackground }}>
        <div className="animate-pulse">
          <div className="h-6 w-48 mb-6 rounded" style={{ backgroundColor: colors.border }}></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: colors.border }}>
                <div className="h-4 w-3/4 mb-2 rounded" style={{ backgroundColor: colors.background }}></div>
                <div className="h-8 w-1/2 mb-2 rounded" style={{ backgroundColor: colors.background }}></div>
                <div className="h-3 w-full rounded" style={{ backgroundColor: colors.background }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
      style={{ 
        backgroundColor: colors.cardBackground,
        border: 'none', // Remove white borders completely
        minHeight: '600px' // Increase minimum height
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 
          className="font-orbitron font-bold text-xl"
          style={{ color: colors.text }}
        >
          📊 LIVE STATISTICS
        </h3>
        <div 
          className="flex items-center space-x-2 px-3 py-1 rounded-full"
          style={{ 
            backgroundColor: '#10B981',
            border: 'none' // Remove borders
          }}
        >
          <div 
            className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
            style={{ backgroundColor: '#ffffff' }}
          ></div>
          <span 
            className="text-sm font-semibold flex-shrink-0"
            style={{ color: '#ffffff' }}
          >
            LIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statistics.map((stat) => (
          <div 
            key={stat.id}
            className="p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md"
            style={{ 
              backgroundColor: currentTheme === 'light-mode' 
                ? 'rgba(0, 0, 0, 0.02)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: 'none' // Remove borders completely
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{stat.icon}</span>
              <span 
                className="text-base font-semibold"
                style={{ color: getTrendColor(stat.trend) }}
              >
                {Math.abs(stat.percentage).toFixed(1)}%
              </span>
            </div>

            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              {formatValue(stat)}
            </div>

            <div 
              className="text-sm font-medium"
              style={{ color: colors.textMuted }}
            >
              {stat.label}
            </div>

            {stat.unit && (
              <div 
                className="text-xs mt-1"
                style={{ color: colors.accent }}
              >
                {stat.unit}
              </div>
            )}
          </div>
        ))}
      </div>

      <div 
        className="mt-6 text-center"
        style={{ border: 'none' }} // Remove border
      >
        <div 
          className="flex items-center justify-center space-x-2 text-xs"
          style={{ color: colors.textMuted }}
        >
          <div 
            className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
            style={{ 
              backgroundColor: '#10B981'
            }}
          ></div>
          <span className="leading-none">Real-time data • Updates every 30 seconds</span>
        </div>
        <div 
          className="mt-2 text-xs font-semibold"
          style={{ color: colors.accent }}
        >
          🎸 Keep the metal alive! 🎸
        </div>
      </div>
    </div>
  );
}