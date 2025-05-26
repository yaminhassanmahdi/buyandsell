
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_USERS } from "@/lib/mock-data";
import { DollarSign, ShoppingCart, Users, CheckSquare } from "lucide-react";

export default function AdminDashboardPage() {
  const totalSales = MOCK_ORDERS.filter(o => o.status === 'delivered').reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingProducts = MOCK_PRODUCTS.filter(p => p.status === 'pending').length;
  const totalUsers = MOCK_USERS.length;
  const totalOrders = MOCK_ORDERS.length;

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From delivered orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All processed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total users on the platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Pending Approval</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingProducts}</div>
            <p className="text-xs text-muted-foreground">Items awaiting review</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Welcome, Admin!</CardTitle>
            <CardDescription>Use the navigation on the left to manage products and orders.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>This is your central hub for overseeing 2ndhandbajar.com. From here you can approve new product listings, track all orders, and monitor the overall activity on the platform.</p>
        </CardContent>
      </Card>
    </div>
  );
}
