import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { EulaModal } from "./eula-modal";
import { PrivacyAgreementModal } from "./privacy-agreement-modal";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AgreementCheckerProps {
  personnelId: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function AgreementChecker({ personnelId, onComplete, onCancel }: AgreementCheckerProps) {
  const [showPrivacyAgreement, setShowPrivacyAgreement] = useState(false);
  const [showEula, setShowEula] = useState(false);
  const { toast } = useToast();

  // Query to check if personnel has agreed to privacy policy
  const privacyAgreementQuery = useQuery({
    queryKey: [`/api/privacy-agreements/check/${personnelId}`],
    queryFn: getQueryFn(),
    enabled: !!personnelId,
  });

  // Query to check if personnel has accepted EULA
  const eulaQuery = useQuery({
    queryKey: [`/api/eula-agreements/check/${personnelId}`],
    queryFn: getQueryFn(),
    enabled: !!personnelId,
  });

  useEffect(() => {
    // Only proceed if both queries have completed
    if (privacyAgreementQuery.isLoading || eulaQuery.isLoading) {
      return;
    }

    if (privacyAgreementQuery.isError || eulaQuery.isError) {
      toast({
        title: "Error",
        description: "Failed to check agreement status. Please try again.",
        variant: "destructive",
      });
      onCancel();
      return;
    }

    const privacyAgreed = privacyAgreementQuery.data?.hasAgreed;
    const eulaAccepted = eulaQuery.data?.hasAccepted;

    // If both agreements have been accepted, proceed
    if (privacyAgreed && eulaAccepted) {
      onComplete();
      return;
    }

    // Show privacy agreement first if not agreed
    if (!privacyAgreed) {
      setShowPrivacyAgreement(true);
    } 
    // If privacy is agreed but not EULA, show EULA
    else if (!eulaAccepted) {
      setShowEula(true);
    }
  }, [
    privacyAgreementQuery.isLoading, 
    privacyAgreementQuery.isError, 
    privacyAgreementQuery.data, 
    eulaQuery.isLoading, 
    eulaQuery.isError, 
    eulaQuery.data,
    onComplete,
    onCancel,
    toast
  ]);

  const handlePrivacyAgreementClose = () => {
    setShowPrivacyAgreement(false);
    
    // Check if EULA also needs to be shown
    if (eulaQuery.data && !eulaQuery.data.hasAccepted) {
      setShowEula(true);
    } else {
      // Refresh the privacy agreement status
      privacyAgreementQuery.refetch().then(() => {
        // If they've now agreed, continue
        if (privacyAgreementQuery.data?.hasAgreed) {
          onComplete();
        } else {
          // Otherwise cancel
          onCancel();
        }
      });
    }
  };

  const handleEulaClose = () => {
    setShowEula(false);
    
    // Refresh the EULA status
    eulaQuery.refetch().then(() => {
      // If they've now accepted, continue
      if (eulaQuery.data?.hasAccepted) {
        onComplete();
      } else {
        // Otherwise cancel
        onCancel();
      }
    });
  };

  if (privacyAgreementQuery.isLoading || eulaQuery.isLoading) {
    return null; // Loading state
  }

  return (
    <>
      {showPrivacyAgreement && (
        <PrivacyAgreementModal
          isOpen={showPrivacyAgreement}
          onClose={handlePrivacyAgreementClose}
          personnelId={personnelId}
        />
      )}
      
      {showEula && (
        <EulaModal
          isOpen={showEula}
          onClose={handleEulaClose}
          personnelId={personnelId}
        />
      )}
    </>
  );
}