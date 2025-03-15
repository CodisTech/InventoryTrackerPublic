import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLES } from "@shared/schema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { 
  PlusCircle, 
  Shield, 
  Edit2, 
  Trash, 
  UserCog, 
  ShieldAlert,
  ShieldCheck,
  UserX 
} from "lucide-react";

import AddAdminModal from "@/components/users/add-admin-modal";
import EditAdminModal from "@/components/users/edit-admin-modal";

type User = {
  id: number;
  username: string;
  password: string; // Note: This should be hashed and never displayed
  fullName: string;
  role: string;
  isAuthorized: boolean;
};

export default function AdminManagementPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isRoleAlertOpen, setIsRoleAlertOpen] = useState(false);

  // Fetch all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      return await res.json();
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/users/${userId}`);
      return res.ok;
    },
    onSuccess: () => {
      toast({
        title: "Administrator deleted",
        description: "The administrator account has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDeleteAlertOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting administrator",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: number; newRole: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}`, { role: newRole });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "The administrator role has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsRoleAlertOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle authorization mutation
  const toggleAuthorizationMutation = useMutation({
    mutationFn: async ({ userId, isAuthorized }: { userId: number; isAuthorized: boolean }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}`, { isAuthorized });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.isAuthorized ? "Administrator activated" : "Administrator deactivated",
        description: `The administrator account has been ${variables.isAuthorized ? "activated" : "deactivated"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error toggling authorization",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle edit click
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  // Handle role click
  const handleRoleClick = (user: User) => {
    setSelectedUser(user);
    setIsRoleAlertOpen(true);
  };

  // Handle toggle authorization
  const handleToggleAuthorization = (user: User) => {
    toggleAuthorizationMutation.mutate({
      userId: user.id,
      isAuthorized: !user.isAuthorized
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // Handle role change confirmation
  const handleRoleChangeConfirm = () => {
    if (selectedUser) {
      let newRole;
      if (selectedUser.role === USER_ROLES.ADMIN) {
        newRole = USER_ROLES.SUPER_ADMIN;
      } else if (selectedUser.role === USER_ROLES.SUPER_ADMIN) {
        newRole = USER_ROLES.ADMIN;
      } else {
        newRole = USER_ROLES.ADMIN; // If standard user, promote to admin
      }
      
      changeRoleMutation.mutate({
        userId: selectedUser.id,
        newRole
      });
    }
  };

  // Table columns definition
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      header: "Username",
      accessorKey: "username",
      sortable: true,
    },
    {
      header: "Full Name",
      accessorKey: "fullName",
      sortable: true,
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (user: User) => {
        if (user.role === USER_ROLES.SUPER_ADMIN) {
          return (
            <Badge variant="destructive">
              <div className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                <span>Super Admin</span>
              </div>
            </Badge>
          );
        } else if (user.role === USER_ROLES.ADMIN) {
          return (
            <Badge variant="default">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Admin</span>
              </div>
            </Badge>
          );
        } else {
          return (
            <Badge variant="outline">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Standard User</span>
              </div>
            </Badge>
          );
        }
      },
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "isAuthorized",
      cell: (user: User) => {
        return (
          <Badge variant={user.isAuthorized ? "outline" : "secondary"}>
            {user.isAuthorized ? (
              <div className="flex items-center gap-1 text-green-600">
                <ShieldCheck className="h-3 w-3" />
                <span>Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <UserX className="h-3 w-3" />
                <span>Inactive</span>
              </div>
            )}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (user: User) => {
        // Don't allow users to modify themselves or super_admin role if the current user is just admin
        const isSelf = currentUser?.id === user.id;
        const isRestrictedSuperAdmin = 
          user.role === USER_ROLES.SUPER_ADMIN && 
          currentUser?.role !== USER_ROLES.SUPER_ADMIN;
        
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(user)}
              disabled={isSelf}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRoleClick(user)}
              disabled={isSelf || isRestrictedSuperAdmin}
            >
              <UserCog className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleAuthorization(user)}
              disabled={isSelf || isRestrictedSuperAdmin}
            >
              {user.isAuthorized ? (
                <UserX className="h-4 w-4 text-red-500" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-green-500" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(user)}
              disabled={isSelf || isRestrictedSuperAdmin}
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
      sortable: false,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            View and manage all user accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              searchable
              searchPlaceholder="Search users..."
            />
          )}
        </CardContent>
      </Card>

      {/* Add Admin Modal */}
      <AddAdminModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {/* Edit Admin Modal */}
      {selectedUser && (
        <EditAdminModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for{" "}
              <strong>{selectedUser?.fullName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={isRoleAlertOpen} onOpenChange={setIsRoleAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.role === USER_ROLES.STANDARD_USER ? (
                <>
                  Are you sure you want to promote <strong>{selectedUser?.fullName}</strong> from Standard User to Administrator?
                  Administrators have additional permissions to manage the system.
                </>
              ) : selectedUser?.role === USER_ROLES.ADMIN ? (
                <>
                  Are you sure you want to promote <strong>{selectedUser?.fullName}</strong> from Administrator to Super Administrator?
                  Super Administrators have complete control over the system.
                </>
              ) : (
                <>
                  Are you sure you want to demote <strong>{selectedUser?.fullName}</strong> from Super Administrator to Administrator?
                  This will reduce their permissions in the system.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChangeConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}