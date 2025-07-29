// API Client utility for making requests to our backend

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Products API
  async getProducts(params: {
    categoryId?: string;
    subCategoryId?: string;
    status?: string;
    sellerId?: string;
    search?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/products?${searchParams.toString()}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  async getCategories(params: {
    includeSubCategories?: boolean;
    includeAttributes?: boolean;
    includeAttributeValues?: boolean;
  } = {}) {
    const searchParams = new URLSearchParams();
    if (params.includeSubCategories) searchParams.append('includeSubCategories', 'true');
    if (params.includeAttributes) searchParams.append('includeAttributes', 'true');
    if (params.includeAttributeValues) searchParams.append('includeAttributeValues', 'true');
    
    return this.request(`/categories?${searchParams.toString()}`);
  }

  async createCategory(category: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: string, category: any) {
    return this.request(`/categories`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...category }),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Users API
  async getUsers(params: {
    includeAddresses?: boolean;
    includeWithdrawalMethods?: boolean;
    isAdmin?: boolean;
    search?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/users?${searchParams.toString()}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(user: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, updates: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders API
  async getOrders(params: {
    userId?: string;
    sellerId?: string;
    status?: string;
    paymentStatus?: string;
    search?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/orders?${searchParams.toString()}`);
  }

  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  async updateOrder(orderId: string, updates: {
    status?: string;
    payment_status?: string;
    delivery_charge_amount?: number;
    shipping_method_name?: string;
    platform_commission?: number;
  }) {
    return this.request(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteOrder(orderId: string) {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  async createOrder(order: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  // Settings API
  async getSettings(key: string = 'main') {
    return this.request(`/settings?key=${key}`);
  }

  async updateSettings(settings: any, key: string = 'main') {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, settings }),
    });
  }

  // Delivery Charges API
  async getDeliveryCharges() {
    return this.request('/delivery-charges');
  }

  async updateDeliveryCharges(charges: {
    intraThanaCharge: number;
    intraDistrictCharge: number;
    interDistrictCharge: number;
    intraThanaExtraKgCharge?: number;
    intraDistrictExtraKgCharge?: number;
    interDistrictExtraKgCharge?: number;
  }) {
    return this.request('/delivery-charges', {
      method: 'PUT',
      body: JSON.stringify(charges),
    });
  }

  // Shipping Methods API
  async getShippingMethods() {
    return this.request('/shipping-methods');
  }

  async createShippingMethod(method: { id: string; name: string }) {
    return this.request('/shipping-methods', {
      method: 'POST',
      body: JSON.stringify(method),
    });
  }

  async deleteShippingMethod(id: string) {
    return this.request(`/shipping-methods?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Create order from checkout
  async createCheckoutOrder(orderData: {
    userId: string;
    shippingAddress: any;
    paymentMethod?: string;
    totalAmount: number;
    deliveryChargeAmount?: number;
    platformCommission?: number;
    notes?: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }): Promise<{ orderId: string; message: string; status: string }> {
    return this.request('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Sub Categories API
  async getSubCategories(params: {
    parentCategoryId?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/sub-categories?${searchParams.toString()}`);
  }

  // User Earnings API
  async getUserEarnings(userId?: string) {
    const searchParams = userId ? `?userId=${userId}` : '';
    return this.request(`/users/earnings${searchParams}`);
  }

  // User Withdrawable Amount API
  async getUserWithdrawableAmount(userId: string) {
    return this.request(`/users/withdrawable?userId=${userId}`);
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient }; 