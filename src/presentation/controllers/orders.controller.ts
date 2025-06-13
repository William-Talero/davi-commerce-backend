import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { OrderRepositoryInterface } from '../../domain/repositories/order.repository.interface';
import { ProductRepositoryInterface } from '../../domain/repositories/product.repository.interface';
import { CreateOrderDto } from '../dtos/order/create-order.dto';
import { UpdateOrderDto } from '../dtos/order/update-order.dto';
import {
  Order,
  OrderItem,
  OrderStatus,
  ShippingAddress,
} from '../../domain/entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepositoryInterface,
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryInterface,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllOrders(@Request() req) {
    try {
      if (req.user.role === 'admin') {
        return await this.orderRepository.findAll();
      } else {
        return await this.orderRepository.findByUserId(req.user.id);
      }
    } catch (error) {
      throw new HttpException(
        'Failed to fetch orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getOrderById(@Param('id') id: string, @Request() req) {
    try {
      const order = await this.orderRepository.findById(id);

      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        throw new HttpException(
          'Unauthorized access to order',
          HttpStatus.FORBIDDEN,
        );
      }

      return order;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    try {
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productRepository.findById(item.productId);

        if (!product) {
          throw new HttpException(
            `Product with ID ${item.productId} not found`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (product.stock < item.quantity) {
          throw new HttpException(
            `Insufficient stock for product ${product.name}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const orderItem = new OrderItem(
          '',
          '',
          item.productId,
          product.name,
          item.quantity,
          item.price || product.price,
        );

        orderItems.push(orderItem);
        totalAmount += orderItem.getSubtotal();
      }

      const addressParts = createOrderDto.shippingAddress.split(', ');
      const shippingAddress = new ShippingAddress(
        addressParts[0] || '',
        addressParts[1] || '',
        addressParts[2] || '',
        addressParts[3] || '',
        addressParts[4] || '',
      );

      const order = new Order(
        '',
        req.user.id,
        orderItems,
        totalAmount,
        OrderStatus.PENDING,
        shippingAddress,
      );

      const createdOrder = await this.orderRepository.create(order);

      for (const item of createOrderDto.items) {
        const product = await this.productRepository.findById(item.productId);
        if (product) {
          await this.productRepository.update(item.productId, {
            stock: product.stock - item.quantity,
          });
        }
      }

      return createdOrder;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req,
  ) {
    try {
      const order = await this.orderRepository.findById(id);

      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        throw new HttpException(
          'Unauthorized access to order',
          HttpStatus.FORBIDDEN,
        );
      }

      if (
        req.user.role !== 'admin' &&
        updateOrderDto.status &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        updateOrderDto.status !== OrderStatus.CANCELLED
      ) {
        throw new HttpException(
          'Users can only cancel their orders',
          HttpStatus.FORBIDDEN,
        );
      }

      if (updateOrderDto.status) {
        await this.orderRepository.updateStatus(id, updateOrderDto.status);
      }

      const updatedOrder = await this.orderRepository.findById(id);
      return updatedOrder;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteOrder(@Param('id') id: string, @Request() req) {
    try {
      if (req.user.role !== 'admin') {
        throw new HttpException(
          'Only administrators can delete orders',
          HttpStatus.FORBIDDEN,
        );
      }

      const order = await this.orderRepository.findById(id);

      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      const deleted = await this.orderRepository.delete(id);

      if (!deleted) {
        throw new HttpException(
          'Failed to delete order',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { message: 'Order deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
