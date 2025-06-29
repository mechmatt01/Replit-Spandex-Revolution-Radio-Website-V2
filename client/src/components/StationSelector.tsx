import { useState } from "react";
import { Radio, ChevronDown, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";

interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  location: string;
  genre: string;
  streamUrl: string;
  description: string;
  icon: string;
}

const radioStations: RadioStation[] = [
  {
    id: "beat-955",
    name: "95.5 The Beat",
    frequency: "95.5 FM",
    location: "Dallas, TX",
    genre: "Hip Hop & R&B",
    streamUrl: "https://24883.live.streamtheworld.com/KBFBFMAAC",
    description: "Dallas Hip Hop & R&B",
    icon: "🎵"
  },
  {
    id: "hot-97",
    name: "Hot 97",
    frequency: "97.1 FM", 
    location: "New York, NY",
    genre: "Hip Hop & R&B",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
    description: "New York's Hip Hop & R&B",
    icon: "🔥"
  },
  {
    id: "power-106",
    name: "Power 106",
    frequency: "105.9 FM",
    location: "Los Angeles, CA", 
    genre: "Hip Hop & R&B",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRFMAAC.aac",
    description: "LA's #1 for Hip Hop",
    icon: "⚡"
  },
  {
    id: "soma-metal",
    name: "SomaFM Metal",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Metal",
    streamUrl: "https://ice1.somafm.com/metal-128-mp3",
    description: "Heavy Metal & Hard Rock",
    icon: "🤘"
  },
  {
    id: "spandex-salvation",
    name: "Spandex Salvation Radio",
    frequency: "Online",
    location: "Global",
    genre: "Classic Metal",
    streamUrl: "/api/radio-stream",
    description: "Old School Metal 24/7",
    icon: "🎸"
  }
];

interface StationSelectorProps {
  currentStation: string;
  onStationChange: (station: RadioStation) => void;
}

export default function StationSelector({ currentStation, onStationChange }: StationSelectorProps) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedStation = radioStations.find(station => station.id === currentStation) || radioStations[0];

  // Sort stations with selected station first
  const sortedStations = [
    ...radioStations.filter(station => station.id === currentStation),
    ...radioStations.filter(station => station.id !== currentStation)
  ];

  const handleStationSelect = (station: RadioStation) => {
    onStationChange(station);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4 bg-card/90 backdrop-blur-sm hover:bg-card/95 transition-all duration-200"
            style={{
              borderColor: colors.primary + '20',
              '--hover-bg': colors.primary + '10'
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500">
                <span className="text-sm">{selectedStation.icon}</span>
              </div>
              <div className="flex flex-col items-start text-left">
                <div className="font-semibold text-sm text-foreground">
                  {selectedStation.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedStation.frequency} • {selectedStation.location}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-80 p-2 bg-black/80 backdrop-blur-md border max-h-96 overflow-y-auto"
          align="start"
          style={{
            borderColor: colors.primary + '40'
          }}
        >
          {sortedStations.map((station) => (
            <DropdownMenuItem
              key={station.id}
              onClick={() => handleStationSelect(station)}
              className="p-3 cursor-pointer rounded-md transition-all duration-200 hover:bg-muted/20 focus:outline-none"
              style={{
                backgroundColor: station.id === currentStation ? colors.primary + '20' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (station.id !== currentStation) {
                  e.currentTarget.style.backgroundColor = colors.primary + '10';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = station.id === currentStation ? colors.primary + '20' : 'transparent';
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex-shrink-0">
                  <span className="text-lg">{station.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm text-white truncate">
                      {station.name}
                    </div>
                    <div className="flex items-center justify-center h-full">
                      {station.id === currentStation && (
                        <Volume2 className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-300 truncate">
                    {station.frequency} • {station.location}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {station.description}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { radioStations };
export type { RadioStation };