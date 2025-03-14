import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Personnel } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface EditPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel;
}

// Create a form schema that extends the insert schema with validation
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  division: z.string().min(1, "Division is required"),
  department: z.string().min(1, "Department is required"),
  jDial: z.string().optional(),
  rank: z.string().optional(),
  lcpoName: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const EditPersonnelModal: React.FC<EditPersonnelModalProps> = ({ isOpen, onClose, personnel }) => {
  const { toast } = useToast();
  
  // Define form with default values from the personnel record
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: personnel.firstName,
      lastName: personnel.lastName,
      division: personnel.division,
      department: personnel.department,
      jDial: personnel.jDial || "",
      rank: personnel.rank || "",
      lcpoName: personnel.lcpoName || "",
      isActive: personnel.isActive,
    },
  });

  // Update values when personnel changes
  useEffect(() => {
    if (personnel) {
      form.reset({
        firstName: personnel.firstName,
        lastName: personnel.lastName,
        division: personnel.division,
        department: personnel.department,
        jDial: personnel.jDial || "",
        rank: personnel.rank || "",
        lcpoName: personnel.lcpoName || "",
        isActive: personnel.isActive,
      });
    }
  }, [personnel, form]);

  // Edit personnel mutation
  const editPersonnelMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("PATCH", `/api/personnel/${personnel.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Personnel updated successfully",
        description: "The personnel record has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update personnel record",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    editPersonnelMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Personnel</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Rank */}
            <FormField
              control={form.control}
              name="rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter rank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Division & Department */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter division" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* J-Dial */}
            <FormField
              control={form.control}
              name="jDial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>J-Dial</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter J-Dial number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* LCPO Name */}
            <FormField
              control={form.control}
              name="lcpoName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LCPO's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter LCPO's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Set whether this personnel is currently active
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={editPersonnelMutation.isPending}
              >
                {editPersonnelMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPersonnelModal;