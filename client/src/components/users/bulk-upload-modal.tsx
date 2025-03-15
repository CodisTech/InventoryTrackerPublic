import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'personnel' | 'inventory';
}

export function BulkUploadModal({ isOpen, onClose, entityType }: BulkUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResults, setUploadResults] = useState<any | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = entityType === 'personnel' 
        ? '/api/personnel/bulk-upload' 
        : '/api/inventory/bulk-upload';
        
      return apiRequest(endpoint, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header when using FormData
        headers: {}
      });
    },
    onSuccess: (data) => {
      setUploadResults(data);
      
      if (data.successCount > 0) {
        toast({
          title: 'Upload successful',
          description: `Successfully imported ${data.successCount} ${entityType} records.`,
        });
        
        // Invalidate relevant queries
        if (entityType === 'personnel') {
          queryClient.invalidateQueries({ queryKey: ['/api/personnel'] });
        } else {
          queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
        }
      }
      
      if (data.errorCount > 0) {
        toast({
          title: 'Some records had errors',
          description: `${data.errorCount} records couldn't be imported. See details for more information.`,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadResults(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate(selectedFile);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResults(null);
    onClose();
  };

  const getColumnTemplateInfo = () => {
    if (entityType === 'personnel') {
      return (
        <div className="text-sm text-gray-500 mt-2">
          <p>Required columns: First Name, Last Name</p>
          <p>Optional columns: Division, Department, J-Dial, Rank, LCPO Name</p>
        </div>
      );
    } else {
      return (
        <div className="text-sm text-gray-500 mt-2">
          <p>Required columns: Item Code, Name, Category</p>
          <p>Optional columns: Description, Total Quantity, Available Quantity, Min Stock Level, Status, Checkout Alert Days</p>
        </div>
      );
    }
  };

  const downloadSampleTemplate = () => {
    let csvContent = '';
    
    if (entityType === 'personnel') {
      csvContent = 'First Name,Last Name,Division,Department,J-Dial,Rank,LCPO Name\n' +
                  'John,Doe,Operations,IT,555-1234,E5,Jane Smith\n' +
                  'Jane,Smith,Admin,HR,555-5678,O3,John Johnson';
    } else {
      csvContent = 'Item Code,Name,Category,Description,Total Quantity,Available Quantity,Min Stock Level,Status,Checkout Alert Days\n' +
                  'IT001,Laptop,Electronics,Dell XPS 15,10,8,2,available,14\n' +
                  'OF002,Stapler,Office Supplies,Heavy duty stapler,20,18,5,available,30';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entityType}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Bulk Upload {entityType === 'personnel' ? 'Personnel' : 'Inventory Items'}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple {entityType} records at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="csvFile" className="text-right">
                CSV File
              </Label>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={downloadSampleTemplate}
              >
                Download Sample Template
              </Button>
            </div>
            {getColumnTemplateInfo()}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={uploadMutation.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={!selectedFile || uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </div>
          </form>

          {uploadResults && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Upload Results</h3>
                <div className="flex space-x-3">
                  <span className="text-sm text-green-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {uploadResults.successCount} successful
                  </span>
                  {uploadResults.errorCount > 0 && (
                    <span className="text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {uploadResults.errorCount} failed
                    </span>
                  )}
                </div>
              </div>

              {uploadResults.errorCount > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Import Errors</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 max-h-[200px] overflow-y-auto">
                      <ul className="list-disc list-inside space-y-1">
                        {uploadResults.errors.map((error: any, idx: number) => (
                          <li key={idx} className="text-sm">
                            <span className="font-semibold">
                              {error.record.name || error.record.firstName || `Row ${idx + 1}`}:
                            </span>{' '}
                            {error.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}