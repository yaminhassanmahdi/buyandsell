
"use client";
import { useEffect, useState } from 'react';
import { MOCK_WITHDRAWAL_REQUESTS } from '@/lib/mock-data';
import type { WithdrawalRequest, WithdrawalRequestStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Edit, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label'; 
import { DialogFooter } from '@/components/ui/dialog'; 
import { CURRENCY_SYMBOL } from '@/lib/constants';

export default function AdminWithdrawalRequestsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<WithdrawalRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Sort by requestedAt descending, then by status (pending first)
      const sortedRequests = [...MOCK_WITHDRAWAL_REQUESTS].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
      });
      setRequests(sortedRequests);
      setIsLoading(false);
    }, 500);
  }, []);

  const openProcessingModal = (request: WithdrawalRequest, type: 'approve' | 'reject') => {
    setCurrentRequest(request);
    setActionType(type);
    setAdminNote(request.adminNote || '');
    setIsProcessingModalOpen(true);
  };

  const handleProcessRequest = async () => {
    if (!currentRequest || !actionType) return;

    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 700));

    const requestIndex = MOCK_WITHDRAWAL_REQUESTS.findIndex(r => r.id === currentRequest.id);
    if (requestIndex !== -1) {
      MOCK_WITHDRAWAL_REQUESTS[requestIndex].status = actionType === 'approve' ? 'approved' : 'rejected';
      MOCK_WITHDRAWAL_REQUESTS[requestIndex].adminNote = adminNote.trim() || undefined;
      MOCK_WITHDRAWAL_REQUESTS[requestIndex].processedAt = new Date();
      
      setRequests(prev => prev.map(r => r.id === currentRequest.id ? MOCK_WITHDRAWAL_REQUESTS[requestIndex] : r)
                              .sort((a, b) => { // Re-sort after update
                                if (a.status === 'pending' && b.status !== 'pending') return -1;
                                if (a.status !== 'pending' && b.status === 'pending') return 1;
                                return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
                              }));

      toast({ 
        title: `Request ${actionType === 'approve' ? 'Approved' : 'Rejected'}`, 
        description: `Withdrawal request ID ${currentRequest.id} has been processed.` 
      });
    } else {
      toast({ title: "Error", description: "Request not found.", variant: "destructive" });
    }

    setFormSubmitting(false);
    setIsProcessingModalOpen(false);
    setCurrentRequest(null);
    setAdminNote('');
    setActionType(null);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          Manage Withdrawal Requests
        </h1>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">There are currently no withdrawal requests to process.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Req. ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>{req.userName} <span className="text-xs text-muted-foreground">({req.userId})</span></TableCell>
                  <TableCell>{CURRENCY_SYMBOL}{req.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">{req.withdrawalMethodDetails}</TableCell>
                  <TableCell>{format(new Date(req.requestedAt), 'dd MMM yyyy, hh:mm a')}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={
                            req.status === 'approved' ? 'default' :
                            req.status === 'pending' ? 'secondary' :
                            'destructive'
                        } 
                        className="capitalize"
                    >
                        {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === 'pending' ? (
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => openProcessingModal(req, 'approve')} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openProcessingModal(req, 'reject')} className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                          <XCircle className="mr-2 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => openProcessingModal(req, req.status === 'approved' ? 'approve' : 'reject')}>
                        <FileText className="mr-2 h-4 w-4" /> View Note
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {currentRequest && (
        <Dialog open={isProcessingModalOpen} onOpenChange={setIsProcessingModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'View'} Withdrawal Request: {currentRequest.id}
              </DialogTitle>
              <DialogDescription>
                User: {currentRequest.userName} ({currentRequest.userId})<br/>
                Amount: {CURRENCY_SYMBOL}{currentRequest.amount.toFixed(2)} to {currentRequest.withdrawalMethodDetails}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="admin-note">Admin Note (Optional)</Label>
                <Textarea 
                    id="admin-note"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={currentRequest.status === 'pending' ? "Add a note for the user..." : "Note for this transaction..."}
                    rows={3}
                    disabled={currentRequest.status !== 'pending' || formSubmitting}
                />
            </div>
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={formSubmitting}>Close</Button>
              </DialogClose>
              {currentRequest.status === 'pending' && actionType && (
                <Button 
                    onClick={handleProcessRequest} 
                    disabled={formSubmitting}
                    variant={actionType === 'approve' ? 'default' : 'destructive'}
                >
                  {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {actionType === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

    