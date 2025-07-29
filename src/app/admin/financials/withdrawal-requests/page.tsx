"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign, Clock, CheckCircle, XCircle, MessageSquare, User, Calendar, CreditCard } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { BusinessSettings } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  withdrawalMethodType: string;
  withdrawalMethodDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
}

export default function AdminWithdrawalRequestsPage() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'approved' | 'rejected' | 'pending'>('pending');
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { toast } = useToast();

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings?.availableCurrencies?.find(c => c.code === settings?.defaultCurrencyCode) || 
    settings?.availableCurrencies?.[0] || 
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' };
  const currencySymbol = activeCurrency.symbol;

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/withdrawal-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch withdrawal requests');
      }
      const data = await response.json();
      setWithdrawalRequests(data);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch withdrawal requests",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessRequest = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setProcessingStatus(request.status);
    setAdminNote(request.adminNote || '');
    setIsProcessModalOpen(true);
  };

  const handleSaveProcessing = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/withdrawal-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status: processingStatus,
          adminNote: adminNote.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update withdrawal request');
      }

      // Update the local state
      setWithdrawalRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              status: processingStatus, 
              adminNote: adminNote.trim() || undefined,
              processedAt: new Date().toISOString()
            }
          : req
      ));

      toast({
        title: "Request Updated",
        description: `Withdrawal request has been ${processingStatus}`,
      });

      setIsProcessModalOpen(false);
      setSelectedRequest(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error processing withdrawal request:', error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal request",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = withdrawalRequests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  const totalPending = withdrawalRequests.filter(req => req.status === 'pending').length;
  const totalApproved = withdrawalRequests.filter(req => req.status === 'approved').length;
  const totalAmount = withdrawalRequests
    .filter(req => req.status === 'approved')
    .reduce((sum, req) => sum + req.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-primary"/>
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalPending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalApproved}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currencySymbol}{totalAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              To sellers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <Label htmlFor="status-filter">Filter by Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Withdrawal Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>Manage seller withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No withdrawal requests found</p>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <span className="font-bold text-lg">{currencySymbol}{request.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">ID: {request.id}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProcessRequest(request)}
                      >
                        {request.status === 'pending' ? 'Process' : 'Update'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.userName}</span>
                        <span className="text-muted-foreground">({request.userEmail})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>{request.withdrawalMethodType}: {request.withdrawalMethodDetails}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Requested: {format(new Date(request.requestedAt), 'PPp')}</span>
                      </div>
                      {request.processedAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Processed: {format(new Date(request.processedAt), 'PPp')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.adminNote && (
                    <Alert>
                      <MessageSquare className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Admin Note:</strong> {request.adminNote}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Request Modal */}
      <Dialog open={isProcessModalOpen} onOpenChange={setIsProcessModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Withdrawal Request</DialogTitle>
            <DialogDescription>
              Update the status and add notes for request ID: {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <p><strong>Amount:</strong> {currencySymbol}{selectedRequest.amount.toFixed(2)}</p>
                  <p><strong>Seller:</strong> {selectedRequest.userName}</p>
                  <p><strong>Method:</strong> {selectedRequest.withdrawalMethodType}</p>
                  <p><strong>Details:</strong> {selectedRequest.withdrawalMethodDetails}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={processingStatus} onValueChange={(value) => setProcessingStatus(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-note">Admin Note (Optional)</Label>
                <Textarea
                  id="admin-note"
                  placeholder="Add a note about this decision..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProcessing} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
