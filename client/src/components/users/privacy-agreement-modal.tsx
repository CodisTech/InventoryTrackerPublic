import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PrivacyAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelId: number;
}

export function PrivacyAgreementModal({ isOpen, onClose, personnelId }: PrivacyAgreementModalProps) {
  const [agreed, setAgreed] = useState(false);
  const { toast } = useToast();

  // Mutation for submitting Privacy Agreement
  const { mutate: submitPrivacyAgreement, isPending } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/privacy-agreements", {
        personnelId,
        version: "1.0", // Default version
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Privacy Agreement accepted",
        description: "The Privacy Agreement has been accepted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to accept Privacy Agreement: ${error.message}`,
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
    
    submitPrivacyAgreement();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Privacy Agreement</AlertDialogTitle>
          <AlertDialogDescription>
            Please read the following Privacy Agreement carefully before using this application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <ScrollArea className="h-[400px] p-4 rounded border">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">1. INTRODUCTION</h3>
            <p>
              Codis Technology ("we", "our", or "us") is committed to protecting the privacy and security of your personal information. This Privacy Agreement describes how we collect, use, and disclose your personal information in connection with your use of the Inventory Management System ("the Application").
            </p>
            
            <h3 className="text-lg font-bold">2. INFORMATION WE COLLECT</h3>
            <p>
              We collect the following types of information:
              <ul className="list-disc pl-6 mt-2">
                <li>Personal identification information (name, rank, division, department)</li>
                <li>Contact information (J-Dial numbers, LCPO information)</li>
                <li>System usage data (login times, actions performed, items checked out/in)</li>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Other information you provide when using the Application</li>
              </ul>
            </p>
            
            <h3 className="text-lg font-bold">3. HOW WE USE YOUR INFORMATION</h3>
            <p>
              We use the information we collect for the following purposes:
              <ul className="list-disc pl-6 mt-2">
                <li>Provide and maintain the Application</li>
                <li>Track inventory items and their custody</li>
                <li>Generate reports and analytics on system usage</li>
                <li>Communicate with you regarding checked-out items</li>
                <li>Enforce our terms and policies</li>
                <li>Protect against unauthorized access and ensure system security</li>
                <li>Comply with applicable laws and regulations</li>
              </ul>
            </p>
            
            <h3 className="text-lg font-bold">4. DATA RETENTION</h3>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Agreement, unless a longer retention period is required or permitted by law. When determining how long to retain information, we consider the amount, nature, and sensitivity of the information, the potential risk of harm from unauthorized use or disclosure, and whether we can achieve the purposes of processing through other means.
            </p>
            
            <h3 className="text-lg font-bold">5. DATA SECURITY</h3>
            <p>
              We have implemented appropriate technical and organizational measures to protect your personal information from unauthorized access, use, disclosure, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h3 className="text-lg font-bold">6. YOUR RIGHTS</h3>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
              <ul className="list-disc pl-6 mt-2">
                <li>The right to access the personal information we hold about you</li>
                <li>The right to request correction of inaccurate information</li>
                <li>The right to request deletion of your information (subject to certain exceptions)</li>
                <li>The right to restrict processing of your information</li>
                <li>The right to data portability</li>
              </ul>
              To exercise these rights, please contact your system administrator or privacy@codistechnology.com.
            </p>
            
            <h3 className="text-lg font-bold">7. CHANGES TO THIS PRIVACY AGREEMENT</h3>
            <p>
              We may update this Privacy Agreement from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated Privacy Agreement within the Application with a new effective date. Your continued use of the Application after such changes constitutes your acceptance of the revised Privacy Agreement.
            </p>
            
            <h3 className="text-lg font-bold">8. CONTACT US</h3>
            <p>
              If you have any questions or concerns about this Privacy Agreement or our data practices, please contact us at privacy@codistechnology.com.
            </p>
          </div>
        </ScrollArea>
        
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox id="privacy-agree" checked={agreed} onCheckedChange={(checked) => setAgreed(!!checked)} />
          <Label htmlFor="privacy-agree" className="font-medium">
            I have read and agree to the Privacy Agreement
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