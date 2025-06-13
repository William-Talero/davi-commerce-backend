import { Product } from '../entities/product.entity';

export interface ProductRepositoryInterface {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findByCategory(category: string): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  update(id: string, product: Partial<Product>): Promise<Product | null>;
  updateStock(id: string, stock: number): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  findLowStock(): Promise<Product[]>;
}