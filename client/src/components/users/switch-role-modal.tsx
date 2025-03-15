import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLES, UserRole } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SwitchRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SwitchRoleModal({ isOpen, onClose }: SwitchRoleModalProps) {
  const { user, activeRole, getHighestRole, switchRoleMutation } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(activeRole);

  // Reset selected role when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedRole(activeRole);
    }
  }, [isOpen, activeRole]);

  // Get available roles based on the highest role the user has
  const getAvailableRoles = (): UserRole[] => {
    if (!user) return [];

    // Determine the highest role the user has
    const highestRole = getHighestRole();
    if (!highestRole) return [];

    switch (highestRole) {
      case USER_ROLES.SUPER_ADMIN:
        return [USER_ROLES.STANDARD_USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN];
      case USER_ROLES.ADMIN:
        return [USER_ROLES.STANDARD_USER, USER_ROLES.ADMIN];
      default:
        return [USER_ROLES.STANDARD_USER];
    }
  };

  const handleSwitchRole = () => {
    if (!selectedRole || selectedRole === activeRole) {
      onClose();
      return;
    }

    switchRoleMutation.mutate(selectedRole, {
      onSuccess: () => {
        toast({
          title: "Role switched",
          description: `You are now operating as a ${getRoleDisplayName(selectedRole)}`,
        });
        onClose();
      },
    });
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return "Super Admin";
      case USER_ROLES.ADMIN:
        return "Admin";
      case USER_ROLES.STANDARD_USER:
        return "Standard User";
      default:
        return "Unknown Role";
    }
  };

  const getRoleDescription = (role: UserRole): string => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return "Full system access. Can manage users, admins, and all system settings.";
      case USER_ROLES.ADMIN:
        return "Can manage inventory, personnel, and view reports.";
      case USER_ROLES.STANDARD_USER:
        return "Basic access. Can check in/out items and view inventory.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch User Role</DialogTitle>
          <DialogDescription>
            Select a role to use in the system. This will change your permissions and access level.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup 
            value={selectedRole || ""} 
            onValueChange={(value) => setSelectedRole(value as UserRole)}
          >
            {getAvailableRoles().map((role) => (
              <div key={role} className="flex items-start space-x-2 space-y-2">
                <RadioGroupItem value={role} id={role} />
                <div className="space-y-1">
                  <Label
                    htmlFor={role}
                    className="font-semibold"
                  >
                    {getRoleDisplayName(role)}
                    {role === activeRole ? " (Current)" : ""}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {getRoleDescription(role)}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSwitchRole}
            disabled={switchRoleMutation.isPending || selectedRole === activeRole}
          >
            {switchRoleMutation.isPending ? "Switching..." : "Switch Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}