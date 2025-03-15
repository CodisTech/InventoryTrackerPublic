import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  onClick?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  onClick,
}) => {
  const isClickable = !!onClick;
  
  return (
    <Card 
      className={cn(
        "overflow-hidden border-none shadow-md",
        isClickable && "cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{value.toLocaleString()}</p>
            {isClickable && (
              <p className="text-xs text-blue-500 mt-1">Click to view details</p>
            )}
          </div>
          <div className={`w-14 h-14 rounded-full ${iconBgColor} flex items-center justify-center`}>
            <div className={`${iconColor}`}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
