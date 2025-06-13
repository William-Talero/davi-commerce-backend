import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderRepositoryInterface } from '../../domain/repositories/order.repository.interface';
import { Order, OrderItem, OrderStatus, ShippingAddress } from '../../domain/entities/order.entity';
import { OrderEntity } from '../database/entities/order.entity';
import { OrderItemEntity } from '../database/entities/order-item.entity';

@Injectable()
export class OrderRepository implements OrderRepositoryInterface {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async findAll(): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      relations: ['items', 'user'],
    });
    return orders.map(this.toDomain);
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'user'],
    });
    return order ? this.toDomain(order) : null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: { userId },
      relations: ['items'],
    });
    return orders.map(this.toDomain);
  }

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const orderEntity = this.orderRepository.create({
      userId: order.userId,
      total: order.totalAmount,
      status: order.status as any,
      shippingAddress: order.shippingAddress.getFullAddress(),
    });

    const savedOrder = await this.orderRepository.save(orderEntity);

    // Create order items
    const itemEntities = order.items.map(item => 
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })
    );

    const savedItems = await this.orderItemRepository.save(itemEntities);
    savedOrder.items = savedItems;

    return this.toDomain(savedOrder);
  }

  async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    const updateData: any = {};
    
    if (updates.status) {
      updateData.status = updates.status;
    }
    if (updates.shippingAddress) {
      updateData.shippingAddress = updates.shippingAddress.getFullAddress();
    }

    await this.orderRepository.update(id, updateData);
    const updatedOrder = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    
    return updatedOrder ? this.toDomain(updatedOrder) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.orderRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async updateStatus(id: string, status: string): Promise<boolean> {
    const result = await this.orderRepository.update(id, { status: status as any });
    return (result.affected ?? 0) > 0;
  }

  async createOrderItems(orderItems: OrderItem[]): Promise<OrderItem[]> {
    const entities = orderItems.map(item => 
      this.orderItemRepository.create({
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })
    );
    
    await this.orderItemRepository.save(entities);
    return orderItems;
  }

  async findOrderItems(orderId: string): Promise<OrderItem[]> {
    const items = await this.orderItemRepository.find({
      where: { orderId },
    });
    
    return items.map(item => new OrderItem(
      item.id,
      item.orderId,
      item.productId,
      item.productName,
      item.quantity,
      Number(item.price),
      item.createdAt,
    ));
  }

  private toDomain(entity: OrderEntity): Order {
    const items = entity.items?.map(item => new OrderItem(
      item.id,
      item.orderId,
      item.productId,
      item.productName,
      item.quantity,
      Number(item.price),
      item.createdAt,
    )) || [];

    // Parse shipping address from string
    const addressParts = entity.shippingAddress?.split(', ') || [];
    const shippingAddress = new ShippingAddress(
      addressParts[0] || '',
      addressParts[1] || '',
      addressParts[2]?.split(' ')[0] || '',
      addressParts[2]?.split(' ')[1] || '',
      addressParts[3] || '',
    );

    return new Order(
      entity.id,
      entity.userId,
      items,
      Number(entity.total),
      entity.status as OrderStatus,
      shippingAddress,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}