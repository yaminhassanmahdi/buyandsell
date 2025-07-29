"use client";
import type { WithdrawalMethod, BKashDetails, BankDetails } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Banknote, Smartphone, Trash2, CheckCircle } from "lucide-react";

interface WithdrawalMethodItemProps {
  method: WithdrawalMethod;
  onRemove: (methodId: string) => void;
  onSetDefault?: (methodId: string) => void; // Optional: if you want to set default
}

export function WithdrawalMethodItem({ method, onRemove, onSetDefault }: WithdrawalMethodItemProps) {
  const getDisplayDetails = () => {
    if (!method.details) {
      return "Invalid method details";
    }

    if (method.type === 'bkash') {
      const bkashDetails = method.details as BKashDetails;
      const accountNumber = bkashDetails?.accountNumber || 'N/A';
      const lastFour = accountNumber.length >= 4 ? accountNumber.slice(-4) : accountNumber;
      return `bKash Account: ******${lastFour}`;
    }
    
    if (method.type === 'bank') {
      const bankDetails = method.details as BankDetails;
      const accountNumber = bankDetails?.accountNumber || 'N/A';
      const bankName = bankDetails?.bankName || 'Unknown Bank';
      const lastFour = accountNumber.length >= 4 ? accountNumber.slice(-4) : accountNumber;
      return `${bankName}, Acc: ******${lastFour}`;
    }
    
    return "Unknown Method";
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg mb-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        {method.type === 'bkash' ? (
          <Smartphone className="h-6 w-6 text-pink-500" />
        ) : (
          <Banknote className="h-6 w-6 text-blue-500" />
        )}
        <div>
          <p className="font-medium">{getDisplayDetails()}</p>
          <p className="text-xs text-muted-foreground">
            Added: {method.createdAt ? new Date(method.createdAt).toLocaleDateString() : 'Unknown date'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {method.isDefault && (
          <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Default</span>
        )}
        {onSetDefault && !method.isDefault && (
          <Button variant="outline" size="sm" onClick={() => onSetDefault(method.id)}>
            Set Default
          </Button>
        )}
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90" onClick={() => onRemove(method.id)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove Method</span>
        </Button>
      </div>
    </div>
  );
}
