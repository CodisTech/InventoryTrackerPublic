import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Edit, 
  Trash, 
  UserPlus, 
  ArrowDownUp 
} from "lucide-react";
import AddUserModal from "@/components/users/add-user-modal";
import EditUserModal from "@/components/users/edit-user-modal";

const AdminManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDeleteModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      return await apiRequest(`/api/users/${userId}/role`, {
        method: "PATCH",
        data: { role },
      });
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "The user's role has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsRoleModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleRoleClick = (user: User) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const handleRoleChange = (role: string) => {
    if (selectedUser) {
      updateRoleMutation.mutate({ userId: selectedUser.id, role });
    }
  };

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
        const role = user.role || "user";
        const isAdmin = role === "admin";
        const isSuperAdmin = role === "superadmin";
        
        return (
          <div className="flex items-center">
            {isSuperAdmin ? (
              <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
            ) : isAdmin ? (
              <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Shield className="h-4 w-4 mr-2 text-gray-500" />
            )}
            <Badge 
              variant={isSuperAdmin ? "destructive" : isAdmin ? "success" : "secondary"}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "isAuthorized",
      cell: (user: User) => (
        <Badge variant={user.isAuthorized ? "success" : "destructive"}>
          {user.isAuthorized ? "Active" : "Inactive"}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (user: User) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRoleClick(user)}
            title="Change Role"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(user)}
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(user)}
            title="Delete User"
            className="text-red-500"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-5">
          <CardTitle className="text-2xl font-medium text-neutral-900">Administrator Management</CardTitle>
          <Button onClick={() => setIsAddUserModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Admin
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            searchable
            searchPlaceholder="Search administrators..."
          />
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => setIsEditUserModalOpen(false)}
          user={selectedUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this user?</p>
            <p className="text-sm text-muted-foreground mt-2">
              {selectedUser?.fullName} ({selectedUser?.username})
            </p>
            <p className="text-sm text-destructive mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Select a new role for: {selectedUser?.fullName}</p>
            <div className="flex flex-col gap-3 mt-4">
              <Button 
                variant={selectedUser?.role === "user" ? "default" : "outline"} 
                onClick={() => handleRoleChange("user")}
                className="justify-start"
              >
                <Shield className="h-4 w-4 mr-2" />
                User
                <span className="text-xs text-muted-foreground ml-2">
                  (Basic access, no administrative privileges)
                </span>
              </Button>
              <Button 
                variant={selectedUser?.role === "admin" ? "default" : "outline"} 
                onClick={() => handleRoleChange("admin")}
                className="justify-start"
              >
                <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                Administrator
                <span className="text-xs text-muted-foreground ml-2">
                  (Can manage inventory, transactions, and personnel)
                </span>
              </Button>
              <Button 
                variant={selectedUser?.role === "superadmin" ? "default" : "outline"} 
                onClick={() => handleRoleChange("superadmin")}
                className="justify-start"
              >
                <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
                Super Administrator
                <span className="text-xs text-muted-foreground ml-2">
                  (Full access to all system features)
                </span>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagementPage;