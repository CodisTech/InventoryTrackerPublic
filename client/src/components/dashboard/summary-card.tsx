import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
}) => {
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{value.toLocaleString()}</p>
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
