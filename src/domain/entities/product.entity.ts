export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly imageUrl: string,
    public readonly category: string,
    public readonly stock: number,
    public readonly lowStockThreshold: number = 5,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {
    this.validatePrice();
    this.validateStock();
  }

  private validatePrice(): void {
    if (this.price <= 0) {
      throw new Error('Product price must be greater than 0');
    }
  }

  private validateStock(): void {
    if (this.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }
  }

  public isLowStock(): boolean {
    return this.stock <= this.lowStockThreshold;
  }

  public isInStock(): boolean {
    return this.stock > 0;
  }

  public canFulfillQuantity(quantity: number): boolean {
    return this.stock >= quantity;
  }

  public reduceStock(quantity: number): Product {
    if (!this.canFulfillQuantity(quantity)) {
      throw new Error(`Insufficient stock. Available: ${this.stock}, Requested: ${quantity}`);
    }

    return new Product(
      this.id,
      this.name,
      this.description,
      this.price,
      this.imageUrl,
      this.category,
      this.stock - quantity,
      this.lowStockThreshold,
      this.createdAt,
      new Date(),
    );
  }

  public updateStock(newStock: number): Product {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }

    return new Product(
      this.id,
      this.name,
      this.description,
      this.price,
      this.imageUrl,
      this.category,
      newStock,
      this.lowStockThreshold,
      this.createdAt,
      new Date(),
    );
  }

  public updateDetails(
    name: string,
    description: string,
    price: number,
    imageUrl: string,
    category: string,
  ): Product {
    return new Product(
      this.id,
      name,
      description,
      price,
      imageUrl,
      category,
      this.stock,
      this.lowStockThreshold,
      this.createdAt,
      new Date(),
    );
  }
}