import { Order, OrderItem } from '../entities/order.entity';

export interface OrderRepositoryInterface {
  create(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  update(id: string, order: Partial<Order>): Promise<Order | null>;
  updateStatus(id: string, status: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  createOrderItems(orderItems: OrderItem[]): Promise<OrderItem[]>;
  findOrderItems(orderId: string): Promise<OrderItem[]>;
}