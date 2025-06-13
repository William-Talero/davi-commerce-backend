export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public readonly status: OrderStatus,
    public readonly shippingAddress: ShippingAddress,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {
    this.validateItems();
    this.validateTotalAmount();
  }

  private validateItems(): void {
    if (!this.items || this.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
  }

  private validateTotalAmount(): void {
    if (this.totalAmount <= 0) {
      throw new Error('Order total amount must be greater than 0');
    }
  }

  public calculateTotal(): number {
    return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
  }

  public updateStatus(newStatus: OrderStatus): Order {
    return new Order(
      this.id,
      this.userId,
      this.items,
      this.totalAmount,
      newStatus,
      this.shippingAddress,
      this.createdAt,
      new Date(),
    );
  }

  public canBeCancelled(): boolean {
    return this.status === OrderStatus.PENDING || this.status === OrderStatus.CONFIRMED;
  }

  public cancel(): Order {
    if (!this.canBeCancelled()) {
      throw new Error(`Cannot cancel order with status: ${this.status}`);
    }
    return this.updateStatus(OrderStatus.CANCELLED);
  }

  public getTotalQuantity(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
}

export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly price: number,
    public readonly createdAt: Date = new Date(),
  ) {
    this.validateQuantity();
    this.validatePrice();
  }

  private validateQuantity(): void {
    if (this.quantity <= 0) {
      throw new Error('Order item quantity must be greater than 0');
    }
  }

  private validatePrice(): void {
    if (this.price <= 0) {
      throw new Error('Order item price must be greater than 0');
    }
  }

  public getSubtotal(): number {
    return this.quantity * this.price;
  }
}

export class ShippingAddress {
  constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly state: string,
    public readonly zipCode: string,
    public readonly country: string,
  ) {}

  public getFullAddress(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}