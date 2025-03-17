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
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Form validation schema
const formSchema = z.object({
  role: z.nativeEnum(USER_ROLES),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SwitchRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SwitchRoleModal({ isOpen, onClose }: SwitchRoleModalProps) {
  const { user, activeRole, getHighestRole, switchRoleMutation } = useAuth();
  const { toast } = useToast();
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: activeRole || USER_ROLES.STANDARD_USER,
      password: "",
    },
  });
  
  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen && activeRole) {
      form.reset({
        role: activeRole,
        password: "",
      });
    }
  }, [isOpen, activeRole, form]);
  
  // Check if role elevation would require a password
  const isElevatingPrivileges = (targetRole: UserRole): boolean => {
    if (!activeRole) return false;
    
    return (activeRole === USER_ROLES.STANDARD_USER && 
        (targetRole === USER_ROLES.ADMIN || targetRole === USER_ROLES.SUPER_ADMIN)) ||
      (activeRole === USER_ROLES.ADMIN && targetRole === USER_ROLES.SUPER_ADMIN);
  };
  
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

  const onSubmit = (data: FormValues) => {
    if (data.role === activeRole) {
      onClose();
      return;
    }
    
    // Check if password is required but not provided
    if (isElevatingPrivileges(data.role) && !data.password) {
      form.setError('password', { 
        type: 'manual', 
        message: 'Admin password is required for role elevation' 
      });
      return;
    }

    switchRoleMutation.mutate({
      role: data.role,
      password: data.password
    }, {
      onSuccess: () => {
        toast({
          title: "Role switched",
          description: `You are now operating as a ${getRoleDisplayName(data.role)}`,
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

  // Watch the role value to show/hide password field
  const watchedRole = form.watch('role');
  const needsPassword = isElevatingPrivileges(watchedRole);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch User Role</DialogTitle>
          <DialogDescription>
            Select a role to use in the system. This will change your permissions and access level.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                    >
                      {getAvailableRoles().map((role) => (
                        <div key={role} className="flex items-start space-x-2">
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
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Show password field only if needed */}
            {needsPassword && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Admin Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter admin password"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Admin password is required for elevating role privileges.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  switchRoleMutation.isPending || 
                  form.watch('role') === activeRole ||
                  (needsPassword && !form.watch('password'))
                }
              >
                {switchRoleMutation.isPending ? "Switching..." : "Switch Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}