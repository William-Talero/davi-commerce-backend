import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepositoryInterface } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ProductEntity } from '../database/entities/product.entity';

@Injectable()
export class ProductRepository implements ProductRepositoryInterface {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const products = await this.productRepository.find();
    return products.map(this.toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.productRepository.findOne({ where: { id } });
    return product ? this.toDomain(product) : null;
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const productEntity = this.productRepository.create({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
    });

    const savedProduct = await this.productRepository.save(productEntity);
    return this.toDomain(savedProduct);
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    await this.productRepository.update(id, updates);
    const updatedProduct = await this.productRepository.findOne({ where: { id } });
    return updatedProduct ? this.toDomain(updatedProduct) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const products = await this.productRepository.find({ where: { category } });
    return products.map(this.toDomain);
  }

  async search(query: string): Promise<Product[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.name ILIKE :query OR product.description ILIKE :query', { query: `%${query}%` })
      .getMany();
    
    return products.map(this.toDomain);
  }

  async updateStock(id: string, stock: number): Promise<boolean> {
    const result = await this.productRepository.update(id, { stock });
    return (result.affected ?? 0) > 0;
  }

  async findLowStock(): Promise<Product[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= 5')
      .getMany();
    
    return products.map(this.toDomain);
  }

  private toDomain(entity: ProductEntity): Product {
    return new Product(
      entity.id,
      entity.name,
      entity.description,
      entity.price,
      entity.imageUrl || '',
      entity.category || '',
      entity.stock,
      5, // lowStockThreshold default
      entity.createdAt,
      entity.updatedAt,
    );
  }
}