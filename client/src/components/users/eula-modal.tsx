import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelId: number;
}

export function EulaModal({ isOpen, onClose, personnelId }: EulaModalProps) {
  const [agreed, setAgreed] = useState(false);
  const { toast } = useToast();

  // Mutation for submitting EULA agreement
  const { mutate: submitEulaAgreement, isPending } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/eula-agreements", {
        personnelId,
        version: "1.0", // Default version
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "EULA accepted",
        description: "The End User License Agreement has been accepted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to accept EULA: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    if (!agreed) {
      toast({
        title: "Agreement required",
        description: "You must check the box to indicate your agreement.",
        variant: "destructive",
      });
      return;
    }
    
    submitEulaAgreement();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>End User License Agreement (EULA)</AlertDialogTitle>
          <AlertDialogDescription>
            Please read the following End User License Agreement carefully before using this application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <ScrollArea className="h-[400px] p-4 rounded border">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">1. ACCEPTANCE OF TERMS</h3>
            <p>
              By accessing or using Codis Technology Inventory Management System ("the Application"), you acknowledge that you have read, understood, and agree to be bound by this End User License Agreement ("EULA"). If you do not agree to these terms, you may not access or use the Application.
            </p>
            
            <h3 className="text-lg font-bold">2. LICENSE GRANT</h3>
            <p>
              Codis Technology grants you a limited, non-exclusive, non-transferable, revocable license to use the Application for your internal business purposes in accordance with this EULA and any applicable laws and regulations.
            </p>
            
            <h3 className="text-lg font-bold">3. RESTRICTIONS</h3>
            <p>
              You agree not to:
              <ul className="list-disc pl-6 mt-2">
                <li>Copy, modify, or create derivative works of the Application</li>
                <li>Reverse engineer, decompile, or disassemble the Application</li>
                <li>Rent, lease, lend, sell, or sublicense the Application</li>
                <li>Remove or alter any proprietary notices or labels on the Application</li>
                <li>Use the Application for any unlawful purpose or in violation of any applicable laws or regulations</li>
                <li>Share login credentials with unauthorized personnel</li>
                <li>Attempt to gain unauthorized access to the Application or its related systems</li>
              </ul>
            </p>
            
            <h3 className="text-lg font-bold">4. DATA USAGE AND PRIVACY</h3>
            <p>
              The Application collects and processes user data as described in our Privacy Policy. By using the Application, you consent to such processing and warrant that all data provided by you is accurate.
            </p>
            
            <h3 className="text-lg font-bold">5. INTELLECTUAL PROPERTY</h3>
            <p>
              All title, ownership rights, and intellectual property rights in and to the Application belong to Codis Technology. This EULA does not grant you any rights to trademarks, service marks, or trade names of Codis Technology.
            </p>
            
            <h3 className="text-lg font-bold">6. WARRANTY DISCLAIMER</h3>
            <p>
              THE APPLICATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            
            <h3 className="text-lg font-bold">7. LIMITATION OF LIABILITY</h3>
            <p>
              IN NO EVENT SHALL CODIS TECHNOLOGY BE LIABLE FOR ANY SPECIAL, INCIDENTAL, INDIRECT, OR CONSEQUENTIAL DAMAGES WHATSOEVER ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE APPLICATION.
            </p>
            
            <h3 className="text-lg font-bold">8. TERM AND TERMINATION</h3>
            <p>
              This EULA is effective until terminated. Your rights under this license will terminate automatically without notice if you fail to comply with any of its terms. Upon termination, you must cease all use of the Application.
            </p>
            
            <h3 className="text-lg font-bold">9. GOVERNING LAW</h3>
            <p>
              This EULA shall be governed by and construed in accordance with the laws of the United States of America, without regard to its conflict of law principles.
            </p>
            
            <h3 className="text-lg font-bold">10. AMENDMENTS</h3>
            <p>
              Codis Technology reserves the right to modify this EULA at any time. Such modifications will be effective immediately upon posting in the Application. Your continued use of the Application after any such changes constitutes your acceptance of the new terms.
            </p>
            
            <h3 className="text-lg font-bold">11. CONTACT INFORMATION</h3>
            <p>
              If you have any questions regarding this EULA, please contact legal@codistechnology.com.
            </p>
          </div>
        </ScrollArea>
        
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox id="eula-agree" checked={agreed} onCheckedChange={(checked) => setAgreed(!!checked)} />
          <Label htmlFor="eula-agree" className="font-medium">
            I have read and agree to the End User License Agreement
          </Label>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Decline</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleAccept} 
            disabled={isPending || !agreed}
            className="bg-primary hover:bg-primary/90"
          >
            {isPending ? "Processing..." : "Accept"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}