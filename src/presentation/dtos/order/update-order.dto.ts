import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../../infrastructure/database/entities/order.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}