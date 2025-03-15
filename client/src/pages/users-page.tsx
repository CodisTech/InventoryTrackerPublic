import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search, Upload, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddPersonnelModal from "@/components/users/add-personnel-modal";
import EditPersonnelModal from "@/components/users/edit-personnel-modal";
import { BulkUploadModal } from "@/components/users/bulk-upload-modal";
import AddAdminForm from "@/components/users/add-admin-form";
import { Personnel } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

const UsersPage: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch personnel data
  const { data: personnel = [], isLoading, error } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel", debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch 
        ? `/api/personnel?q=${encodeURIComponent(debouncedSearch)}` 
        : "/api/personnel";
      const res = await apiRequest("GET", url);
      return res.json();
    }
  });

  // Delete personnel mutation
  const deletePersonnelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/personnel/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Personnel deleted",
        description: "The personnel record has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete personnel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle edit click
  const handleEditClick = (person: Personnel) => {
    setSelectedPersonnel(person);
    setIsEditModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (person: Personnel) => {
    setSelectedPersonnel(person);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedPersonnel) {
      deletePersonnelMutation.mutate(selectedPersonnel.id);
    }
  };

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading personnel data",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const columns: Column<Personnel>[] = [
    {
      header: "Name",
      accessorKey: "firstName",
      cell: (person: Personnel) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback className="bg-primary text-white">
              {person.firstName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{`${person.firstName} ${person.lastName}`}</p>
            <p className="text-sm text-muted-foreground">{person.rank || 'N/A'}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Division",
      accessorKey: "division",
      cell: (person: Personnel) => (
        <Badge variant="secondary">
          {person.division}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Department",
      accessorKey: "department",
      sortable: true,
    },
    {
      header: "J-Dial",
      accessorKey: "jDial",
      cell: (person: Personnel) => person.jDial || "N/A",
    },
    {
      header: "LCPO",
      accessorKey: "lcpoName",
      cell: (person: Personnel) => person.lcpoName || "N/A",
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (person: Personnel) => (
        <Badge variant={person.isActive ? "success" : "error"}>
          {person.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (person: Personnel) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleEditClick(person)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDeleteClick(person)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ] as Column<Personnel>[];

  return (
    <div>
      <Tabs defaultValue="personnel" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="personnel">Personnel Management</TabsTrigger>
          <TabsTrigger value="administrators">Administrators</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personnel">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-medium text-neutral-900">Personnel Management</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsBulkUploadOpen(true)} 
                  className="flex items-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
                <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Personnel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, division, department..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DataTable
                data={personnel}
                columns={columns}
                searchable={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="administrators">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">User Structure</h3>
                    <p className="text-sm text-muted-foreground">
                      This system uses a two-tier user model:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li><span className="font-semibold">Super Admin (you)</span>: Has full access to create and manage users and all system functions</li>
                      <li><span className="font-semibold">Regular Users</span>: Can perform check-in/out transactions and are linked to each transaction they manage</li>
                    </ul>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    For complete user management including creation of standard users or additional administrator accounts, please visit:
                  </p>
                  
                  <div className="flex justify-center pt-2">
                    <Button 
                      variant="default" 
                      className="w-full"
                      asChild
                    >
                      <a href="/admin/management">
                        Go to User Management
                      </a>
                    </Button>
                  </div>
                  
                  <div className="text-sm mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
                    <p className="font-medium">User-Transaction Relationship</p>
                    <p>In this system, any standard user or admin can process transactions, and their information will be tied to each transaction for accountability.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Administrator Role
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">About Regular Users</h3>
                    <p className="text-sm text-muted-foreground">
                      Regular users can check-in and check-out inventory items on behalf of personnel. 
                      Each transaction will record who processed it for accountability.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">User Responsibilities</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>Process check-in and check-out transactions</li>
                      <li>Verify personnel information during transactions</li>
                      <li>Handle equipment and inventory transfers</li>
                      <li>Maintain accountability for all transactions</li>
                    </ul>
                  </div>
                  
                  <div className="text-sm mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    <p className="font-medium">Important Note</p>
                    <p>Only super admins (you) can create, edit, and manage users. Regular users cannot create other accounts.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Personnel Modal */}
      <AddPersonnelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Personnel Modal */}
      {selectedPersonnel && (
        <EditPersonnelModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPersonnel(null);
          }}
          personnel={selectedPersonnel}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this personnel record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected personnel record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePersonnelMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        entityType="personnel"
      />
    </div>
  );
};

export default UsersPage;
