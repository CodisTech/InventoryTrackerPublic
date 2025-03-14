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

  const { data: personnel = [], isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading personnel data",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const columns = [
    {
      header: "Name",
      accessorKey: "fullName",
      cell: (person: User) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback className="bg-primary text-white">
              {person.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{person.fullName}</p>
            <p className="text-sm text-muted-foreground">{person.username}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Department",
      accessorKey: "role",
      cell: (person: User) => (
        <Badge variant="secondary">
          {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "isAuthorized",
      cell: (person: User) => (
        <Badge variant={person.isAuthorized ? "success" : "error"}>
          {person.isAuthorized ? "Active" : "Inactive"}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (person: User) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">View Items</Button>
          <Button variant="link" size="sm">Edit</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-medium text-neutral-900">Personnel</CardTitle>
          <Button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Person
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={personnel}
            columns={columns}
            searchPlaceholder="Search personnel..."
          />
        </CardContent>
      </Card>

      {/* Add Person Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />
    </div>
  );
};

export default UsersPage;
