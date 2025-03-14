import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionWithDetails } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  activities: TransactionWithDetails[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-900">Recent Activity</h3>
          <a href="/transactions" className="text-primary text-sm">View All</a>
        </div>

        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  activity.type === 'check-in' 
                    ? 'bg-secondary-light bg-opacity-10' 
                    : 'bg-warning bg-opacity-10'
                }`}>
                  <span className={`material-icons ${
                    activity.type === 'check-in' 
                      ? 'text-secondary-light' 
                      : 'text-warning'
                  }`}>
                    {activity.type === 'check-in' ? 'login' : 'logout'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">
                      Item {activity.type === 'check-in' ? 'Checked In' : 'Checked Out'}: <span>{activity.item.name}</span>
                    </p>
                    <span className="text-sm text-neutral-500">
                      {activity.timestamp 
                        ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
                        : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">By <span>{activity.user.fullName}</span></p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No recent activity to display
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
