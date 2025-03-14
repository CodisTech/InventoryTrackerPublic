import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AddUserModal from "@/components/users/add-user-modal";
import { User } from "@shared/schema";

const UsersPage: React.FC = () => {
  const { toast } = useToast();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

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

  const columns = [
    {
      header: "User",
      accessorKey: "fullName",
      cell: (user: User) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback className="bg-primary text-white">
              {user.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.username}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (user: User) => (
        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "isAuthorized",
      cell: (user: User) => (
        <Badge variant={user.isAuthorized ? "success" : "error"}>
          {user.isAuthorized ? "Authorized" : "Unauthorized"}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (user: User) => (
        <Button variant="link">Manage</Button>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-medium text-neutral-900">Users</CardTitle>
          <Button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            searchPlaceholder="Search users..."
          />
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />
    </div>
  );
};

export default UsersPage;
