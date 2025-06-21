import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdDetectionButton() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [detectedBrand, setDetectedBrand] = useState<string | null>(null);

  const forceAdDetection = useMutation({
    mutationFn: async (brand: string) => {
      const response = await fetch('/api/force-ad-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand })
      });
      
      if (!response.ok) {
        throw new Error('Failed to detect ad');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setDetectedBrand(data.title);
      queryClient.invalidateQueries({ queryKey: ["/api/now-playing"] });
      toast({
        title: "Ad Detected",
        description: `Successfully detected ${data.title}`,
      });
      
      // Reset after 30 seconds
      setTimeout(() => {
        setDetectedBrand(null);
      }, 30000);
    },
    onError: (error) => {
      toast({
        title: "Detection Failed",
        description: "Failed to detect advertisement",
        variant: "destructive",
      });
    }
  });

  const commonAds = [
    "Capital One",
    "Progressive",
    "GEICO",
    "McDonald's",
    "Coca-Cola"
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-card/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-medium">Manual Ad Detection</span>
      </div>
      
      {detectedBrand && (
        <Badge variant="secondary" className="mb-3 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {detectedBrand}
        </Badge>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        {commonAds.map((brand) => (
          <Button
            key={brand}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => forceAdDetection.mutate(brand)}
            disabled={forceAdDetection.isPending}
          >
            {brand}
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground mt-2">
        Click when you hear an ad playing
      </div>
    </div>
  );
}