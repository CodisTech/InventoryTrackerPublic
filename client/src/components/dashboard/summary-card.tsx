import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: string;
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">{title}</p>
            <p className="text-2xl font-medium text-neutral-900">{value.toLocaleString()}</p>
          </div>
          <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center`}>
            <span className={`material-icons ${iconColor}`}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
