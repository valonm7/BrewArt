import { CartItem, TableInfo } from '@/context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define order types
export interface Order {
  id: string;
  customer: string;
  items: string;
  itemsDetailed: OrderItem[];
  total: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  discountSource?: string;
  paymentMethod?: string;
  status: 'pending' | 'processing' | 'completed';
  date: string;
  tableNumber?: string;
  notes?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: 'small' | 'medium' | 'large';
  specialInstructions?: string;
}

// Storage keys
const ORDERS_STORAGE_KEY = 'brewart_orders';
const ORDERS_COUNTER_KEY = 'brewart_orders_counter';

/**
 * Service for handling orders
 */
class OrderService {
  /**
   * Create a new order from cart items
   */
  async createOrder(
    cartItems: CartItem[], 
    total: number, 
    tableInfo: TableInfo | null,
    customerName: string = 'Guest',
    notes?: string,
    paymentDetails?: {
      subtotal: number;
      tax: number;
      discount: number;
      discountSource?: string;
      paymentMethod?: string;
    }
  ): Promise<Order> {
    // Generate new order ID
    const orderId = await this.getNextOrderId();
    
    // Try to get logged in user information
    let userName = customerName;
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const userInfo = JSON.parse(userData);
        userName = userInfo.name || customerName;
      }
    } catch (error) {
      console.log('Error fetching user data for order, using provided name', error);
    }
    
    // Create formatted items string (for display)
    const itemsString = cartItems
      .map(item => `${item.quantity}x ${item.name}${item.size ? ` (${item.size})` : ''}`)
      .join(', ');
    
    // Create detailed items array (for detailed view)
    const itemsDetailed = cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      specialInstructions: item.specialInstructions
    }));
    
    // Create new order object
    const newOrder: Order = {
      id: orderId,
      customer: userName,
      items: itemsString,
      itemsDetailed,
      total,
      status: 'pending',
      date: new Date().toISOString(),
      tableNumber: tableInfo?.tableNumber,
      notes
    };
    
    // Add payment details if provided
    if (paymentDetails) {
      newOrder.subtotal = paymentDetails.subtotal;
      newOrder.tax = paymentDetails.tax;
      newOrder.discount = paymentDetails.discount;
      newOrder.discountSource = paymentDetails.discountSource;
      newOrder.paymentMethod = paymentDetails.paymentMethod;
    }
    
    // Save the order
    await this.saveOrder(newOrder);
    
    return newOrder;
  }
  
  /**
   * Get all orders
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const ordersJson = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      
      if (!ordersJson) {
        return [];
      }
      
      return JSON.parse(ordersJson) as Order[];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }
  
  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getAllOrders();
    return orders.find(order => order.id === id) || null;
  }
  
  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: 'pending' | 'processing' | 'completed'): Promise<boolean> {
    const orders = await this.getAllOrders();
    const orderIndex = orders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      return false;
    }
    
    orders[orderIndex].status = status;
    
    try {
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }
  
  /**
   * Delete order
   */
  async deleteOrder(id: string): Promise<boolean> {
    const orders = await this.getAllOrders();
    const filteredOrders = orders.filter(order => order.id !== id);
    
    if (filteredOrders.length === orders.length) {
      return false; // Order not found
    }
    
    try {
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(filteredOrders));
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }
  
  /**
   * Save a new order to storage
   */
  private async saveOrder(order: Order): Promise<void> {
    try {
      const orders = await this.getAllOrders();
      orders.unshift(order); // Add to beginning of array
      
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  }
  
  /**
   * Get the next order ID
   */
  private async getNextOrderId(): Promise<string> {
    try {
      const counterStr = await AsyncStorage.getItem(ORDERS_COUNTER_KEY);
      let counter = counterStr ? parseInt(counterStr, 10) : 1000;
      
      counter += 1;
      await AsyncStorage.setItem(ORDERS_COUNTER_KEY, counter.toString());
      
      return counter.toString();
    } catch (error) {
      console.error('Error generating order ID:', error);
      const fallbackId = Math.floor(1000 + Math.random() * 9000).toString();
      return fallbackId;
    }
  }
}

// Export a singleton instance
export const orderService = new OrderService(); 

// Function to add sample orders for demo purposes
export const addSampleOrders = async () => {
  const sampleItems = [
    {
      id: 1,
      name: 'Espresso',
      price: 2.99,
      description: 'Rich and bold single shot',
      image: {} as any, // Use empty object as ImageSourcePropType
      quantity: 1,
      size: 'medium' as 'small' | 'medium' | 'large',
    },
    {
      id: 2, 
      name: 'Cappuccino', 
      price: 4.50, 
      description: 'Espresso with steamed milk and foam',
      image: {} as any, // Use empty object as ImageSourcePropType
      quantity: 1,
      size: 'large' as 'small' | 'medium' | 'large',
    },
    {
      id: 3, 
      name: 'Latte', 
      price: 4.75, 
      description: 'Espresso with steamed milk',
      image: {} as any, // Use empty object as ImageSourcePropType
      quantity: 2,
      size: 'medium' as 'small' | 'medium' | 'large',
    }
  ];

  // Create sample orders with different items
  await orderService.createOrder(
    [sampleItems[0]], // Espresso
    sampleItems[0].price,
    { tableNumber: '3', scannedAt: new Date() },
    'Valon',
    'Extra hot please',
    {
      subtotal: sampleItems[0].price,
      tax: sampleItems[0].price * 0.08,
      discount: 0,
      paymentMethod: 'Credit Card'
    }
  );

  await orderService.createOrder(
    [sampleItems[2]], // Latte (quantity 2)
    sampleItems[2].price * 2,
    { tableNumber: '5', scannedAt: new Date() },
    'Valon',
    'One with almond milk please',
    {
      subtotal: sampleItems[2].price * 2,
      tax: sampleItems[2].price * 2 * 0.08,
      discount: 0,
      paymentMethod: 'Credit Card'
    }
  );

  await orderService.createOrder(
    [sampleItems[1], sampleItems[0]], // Cappuccino and Espresso
    sampleItems[1].price + sampleItems[0].price,
    { tableNumber: '1', scannedAt: new Date() },
    'Valon',
    'Extra foam on cappuccino',
    {
      subtotal: sampleItems[1].price + sampleItems[0].price,
      tax: (sampleItems[1].price + sampleItems[0].price) * 0.08,
      discount: 0,
      paymentMethod: 'Credit Card'
    }
  );
}; 