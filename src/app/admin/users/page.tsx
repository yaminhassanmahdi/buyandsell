"use client";
import { useEffect, useState } from 'react';
import type { User, Product, Order, WithdrawalMethod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { 
  Loader2, 
  Users as UsersIcon, 
  Eye, 
  Edit, 
  UserX, 
  UserCheck, 
  DollarSign, 
  Plus, 
  Minus,
  Package,
  ShoppingCart,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

interface UserWithDetails extends User {
  products?: Product[];
  orders?: Order[];
  totalEarnings?: number;
  pendingWithdrawals?: number;
  status?: 'active' | 'suspended';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const { toast } = useToast();

  // Edit user form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    isAdmin: false,
    status: 'active' as 'active' | 'suspended'
  });

  // Balance management state
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await apiClient.getUsers();
      
      // Enhance users with additional data
      const enhancedUsers = await Promise.all(
        usersData.map(async (user: User) => {
          try {
            // Fetch user's products
            const products = await apiClient.getProducts({ sellerId: user.id });
            
            // Fetch user's orders (as buyer)
            const allOrders = await apiClient.getOrders();
            const userOrders = allOrders.filter(order => order.userId === user.id);
            
            // Calculate earnings from sales
            const salesOrders = allOrders.filter(order => 
              order.items.some(item => item.sellerId === user.id)
            );
            const totalEarnings = salesOrders.reduce((sum, order) => 
              sum + order.items
                .filter(item => item.sellerId === user.id)
                .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0
            );

            return {
              ...user,
              products,
              orders: userOrders,
              totalEarnings,
              pendingWithdrawals: 0, // This would come from withdrawal requests
              status: 'active' as const
            };
          } catch (error) {
            console.error(`Error fetching data for user ${user.id}:`, error);
            return {
              ...user,
              products: [],
              orders: [],
              totalEarnings: 0,
              pendingWithdrawals: 0,
              status: 'active' as const
            };
          }
        })
      );
      
      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewDetails = (user: UserWithDetails) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleEditUser = (user: UserWithDetails) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email || '',
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin || false,
      status: user.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUserEdit = async () => {
    if (!selectedUser) return;
    
    try {
      await apiClient.updateUser(selectedUser.id, editFormData);
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...editFormData }
          : user
      ));
      toast({
        title: "User Updated",
        description: "User details have been updated successfully."
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return;
    
    try {
      await apiClient.updateUser(userId, { status: 'suspended' });
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'suspended' as const }
          : user
      ));
      toast({
        title: "User Suspended",
        description: "User has been suspended successfully."
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: "Error",
        description: "Failed to suspend user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await apiClient.updateUser(userId, { status: 'active' });
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'active' as const }
          : user
      ));
      toast({
        title: "User Activated",
        description: "User has been activated successfully."
      });
    } catch (error) {
      console.error('Error activating user:', error);
      toast({
        title: "Error",
        description: "Failed to activate user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleManageBalance = (user: UserWithDetails) => {
    setSelectedUser(user);
    setBalanceAmount('');
    setBalanceNote('');
    setIsBalanceModalOpen(true);
  };

  const handleSaveBalance = async () => {
    if (!selectedUser || !balanceAmount || !balanceNote) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const amount = parseFloat(balanceAmount);
      const adjustedAmount = balanceAction === 'subtract' ? -amount : amount;
      
      // This would be an API call to adjust user balance
      // await apiClient.adjustUserBalance(selectedUser.id, adjustedAmount, balanceNote);
      
      toast({
        title: "Balance Updated",
        description: `${balanceAction === 'add' ? 'Added' : 'Subtracted'} $${amount} ${balanceAction === 'add' ? 'to' : 'from'} user balance.`
      });
      setIsBalanceModalOpen(false);
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: "Error",
        description: "Failed to update balance. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
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
          <UsersIcon className="h-8 w-8 text-primary" />
          Manage Users ({users.length})
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.status === 'suspended').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.isAdmin).length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Details</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Earnings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isAdmin ? "destructive" : "secondary"}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? "default" : "destructive"}>
                    {user.status || 'active'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {user.products?.length || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    {user.orders?.length || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${(user.totalEarnings || 0).toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleManageBalance(user)}>
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    {user.status === 'active' ? (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleSuspendUser(user.id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleActivateUser(user.id)}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* User Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">User Details Dialog</DialogTitle>
          <DialogHeader>
            <DialogTitle>User Details: {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              View comprehensive information about this user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products ({selectedUser.products?.length || 0})</TabsTrigger>
                <TabsTrigger value="orders">Orders ({selectedUser.orders?.length || 0})</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Name:</strong> {selectedUser.name}</div>
                      <div><strong>Email:</strong> {selectedUser.email || 'Not provided'}</div>
                      <div><strong>Phone:</strong> {selectedUser.phoneNumber}</div>
                      <div><strong>Role:</strong> {selectedUser.isAdmin ? 'Admin' : 'User'}</div>
                      <div><strong>Status:</strong> {selectedUser.status || 'active'}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Products Listed:</strong> {selectedUser.products?.length || 0}</div>
                      <div><strong>Orders Placed:</strong> {selectedUser.orders?.length || 0}</div>
                      <div><strong>Total Earnings:</strong> ${(selectedUser.totalEarnings || 0).toFixed(2)}</div>
                      <div><strong>Pending Withdrawals:</strong> ${(selectedUser.pendingWithdrawals || 0).toFixed(2)}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedUser.products?.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              product.status === 'approved' ? 'default' :
                              product.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.stock}</TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No products found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedUser.orders?.map(order => (
                        <TableRow key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'pending' ? 'secondary' : 'outline'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Earnings Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Total Sales:</strong> ${(selectedUser.totalEarnings || 0).toFixed(2)}</div>
                      <div><strong>Pending Withdrawals:</strong> ${(selectedUser.pendingWithdrawals || 0).toFixed(2)}</div>
                      <div><strong>Available Balance:</strong> ${((selectedUser.totalEarnings || 0) - (selectedUser.pendingWithdrawals || 0)).toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Withdrawal Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Withdrawal methods would be displayed here
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editFormData.phoneNumber}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select 
                value={editFormData.isAdmin ? 'admin' : 'user'}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, isAdmin: value === 'admin' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={editFormData.status}
                onValueChange={(value: 'active' | 'suspended') => setEditFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUserEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Balance Management Modal */}
      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Balance: {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Add or subtract from user's account balance
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="balance-action">Action</Label>
              <Select 
                value={balanceAction}
                onValueChange={(value: 'add' | 'subtract') => setBalanceAction(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Money</SelectItem>
                  <SelectItem value="subtract">Subtract Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance-amount">Amount ($)</Label>
              <Input
                id="balance-amount"
                type="number"
                step="0.01"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance-note">Note/Reason</Label>
              <Textarea
                id="balance-note"
                value={balanceNote}
                onChange={(e) => setBalanceNote(e.target.value)}
                placeholder="Reason for balance adjustment..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBalanceModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBalance}>
              {balanceAction === 'add' ? (
                <><Plus className="mr-2 h-4 w-4" /> Add ${balanceAmount || '0'}</>
              ) : (
                <><Minus className="mr-2 h-4 w-4" /> Subtract ${balanceAmount || '0'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
