
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AddressForm } from '@/components/address-form';
import { WithdrawalMethodForm, type WithdrawalFormData } from '@/components/withdrawal-method-form';
import { WithdrawalMethodItem } from '@/components/withdrawal-method-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import type { ShippingAddress, WithdrawalMethod, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Home, CreditCard, PlusCircle } from 'lucide-react';

export default function AccountSettingsPage() {
  const { currentUser, isAuthenticated, loading: authLoading, updateCurrentUserData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account/settings');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleAddressSubmit = async (data: ShippingAddress) => {
    if (!currentUser) return;
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    updateCurrentUserData({ defaultShippingAddress: data });

    toast({ title: "Address Updated", description: "Your shipping address has been saved." });
    setFormSubmitting(false);
    setIsAddressDialogOpen(false);
  };
  
  const handleWithdrawalSubmit = async (data: WithdrawalFormData) => {
    if (!currentUser) return;
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    const newMethod: WithdrawalMethod = {
      id: `wm-${Date.now()}`, // Simple unique ID for mock
      type: data.type,
      // @ts-ignore TODO: Fix type assertion for details based on data.type
      details: data.type === 'bkash' ? { accountNumber: data.accountNumber } : { bankName: data.bankName, accountHolderName: data.accountHolderName, accountNumber: data.accountNumber, routingNumber: data.routingNumber, branchName: data.branchName },
      isDefault: !(currentUser.withdrawalMethods && currentUser.withdrawalMethods.length > 0), // First method is default
      createdAt: new Date(),
    };
    
    const updatedMethods = [...(currentUser.withdrawalMethods || []), newMethod];
    updateCurrentUserData({ withdrawalMethods: updatedMethods });

    toast({ title: "Withdrawal Method Added", description: `New ${data.type} method has been added.` });
    setFormSubmitting(false);
    setIsWithdrawalDialogOpen(false);
  };

  const handleRemoveWithdrawalMethod = (methodId: string) => {
    if (!currentUser) return;
     const updatedMethods = (currentUser.withdrawalMethods || []).filter(m => m.id !== methodId);
     // If the removed method was default, and there are other methods, make the first one default.
     if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
        updatedMethods[0].isDefault = true;
     }
     updateCurrentUserData({ withdrawalMethods: updatedMethods });
     toast({ title: "Method Removed", description: "Withdrawal method has been removed." });
  };

   const handleSetDefaultWithdrawalMethod = (methodId: string) => {
    if (!currentUser || !currentUser.withdrawalMethods) return;
    const updatedMethods = currentUser.withdrawalMethods.map(m => ({
      ...m,
      isDefault: m.id === methodId,
    }));
    updateCurrentUserData({ withdrawalMethods: updatedMethods });
    toast({ title: "Default Method Set", description: "Withdrawal method has been set as default." });
  };


  if (authLoading || (!authLoading && !isAuthenticated) || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const currentAddress = currentUser.defaultShippingAddress;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      {/* Shipping Address Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Home className="h-6 w-6 text-primary" /> Shipping Address</CardTitle>
          <CardDescription>Manage your default shipping address for orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentAddress ? (
            <div>
              <p><strong>{currentAddress.fullName}</strong></p>
              <p>{currentAddress.houseAddress}{currentAddress.roadNumber ? `, ${currentAddress.roadNumber}` : ''}</p>
              <p>{currentAddress.thana}, {currentAddress.district}</p>
              <p>{currentAddress.division}, {currentAddress.country}</p>
              {currentAddress.phoneNumber && <p>Phone: {currentAddress.phoneNumber}</p>}
            </div>
          ) : (
            <p className="text-muted-foreground">No default shipping address set.</p>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">{currentAddress ? "Edit Address" : "Add Address"}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{currentAddress ? "Edit Shipping Address" : "Add Shipping Address"}</DialogTitle>
                <DialogDescription>
                  Enter your details. This address will be used for future orders.
                </DialogDescription>
              </DialogHeader>
              <AddressForm 
                onSubmit={handleAddressSubmit} 
                initialData={currentAddress || {}} 
                isLoading={formSubmitting}
              />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* Withdrawal Methods Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-6 w-6 text-primary" /> Withdrawal Methods</CardTitle>
          <CardDescription>Manage your payment withdrawal methods for selling items.</CardDescription>
        </CardHeader>
        <CardContent>
          {(currentUser.withdrawalMethods && currentUser.withdrawalMethods.length > 0) ? (
             <div className="space-y-3">
                {currentUser.withdrawalMethods.map(method => (
                <WithdrawalMethodItem 
                    key={method.id} 
                    method={method} 
                    onRemove={handleRemoveWithdrawalMethod}
                    onSetDefault={handleSetDefaultWithdrawalMethod}
                />
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No withdrawal methods added yet.</p>
          )}
        </CardContent>
        <CardFooter>
           <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Withdrawal Method</DialogTitle>
                <DialogDescription>
                  Choose your preferred method and enter the required details.
                </DialogDescription>
              </DialogHeader>
              <WithdrawalMethodForm 
                onSubmit={handleWithdrawalSubmit}
                isLoading={formSubmitting}
              />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
