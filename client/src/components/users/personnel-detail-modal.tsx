import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Building2, 
  Briefcase, 
  Phone,
  Calendar,
  Star,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { Personnel } from "@shared/schema";

interface PersonnelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel;
  onEdit?: () => void;
}

const PersonnelDetailModal: React.FC<PersonnelDetailModalProps> = ({
  isOpen,
  onClose,
  personnel,
  onEdit
}) => {
  // Format the date added
  const formattedDate = personnel.dateAdded 
    ? format(new Date(personnel.dateAdded), 'PPP')
    : 'Unknown';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <User className="h-5 w-5 mr-2 text-primary" />
            Personnel Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Personnel Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{personnel.firstName} {personnel.lastName}</h2>
              <p className="text-sm text-muted-foreground">ID: {personnel.id}</p>
            </div>
            <div>
              {personnel.isActive ? (
                <Badge variant="success" className="bg-emerald-500">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
          </div>

          {/* Personnel Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Division:</span>
                  <span className="ml-2">{personnel.division || "Not specified"}</span>
                </div>
                
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Department:</span>
                  <span className="ml-2">{personnel.department || "Not specified"}</span>
                </div>
                
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Rank:</span>
                  <span className="ml-2">{personnel.rank || "Not specified"}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">J-Dial:</span>
                  <span className="ml-2">{personnel.jDial || "Not specified"}</span>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">LCPO:</span>
                  <span className="ml-2">{personnel.lcpoName || "Not specified"}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Added On:</span>
                  <span className="ml-2">{formattedDate}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          {onEdit && (
            <Button 
              onClick={onEdit}
              className="mr-2"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Personnel
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PersonnelDetailModal;