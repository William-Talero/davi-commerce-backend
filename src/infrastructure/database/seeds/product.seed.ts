import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductSeed {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async run(): Promise<void> {
    const existingProducts = await this.productRepository.count();
    
    if (existingProducts > 0) {
      console.log('Products already exist, skipping seed...');
      return;
    }

    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'El último smartphone de Apple con tecnología A17 Pro y cámara de 48MP',
        price: 1299.99,
        stock: 25,
        category: 'electronics',
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop',
      },
      {
        name: 'MacBook Air M3',
        description: 'Laptop ultraligera con chip M3 de Apple, perfecta para productividad',
        price: 1199.99,
        stock: 15,
        category: 'electronics',
        imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop',
      },
      {
        name: 'Nike Air Max 270',
        description: 'Zapatillas deportivas con amortiguación Air Max para máximo confort',
        price: 149.99,
        stock: 50,
        category: 'clothing',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Smartphone Android premium con S Pen y cámara de 200MP',
        price: 1199.99,
        stock: 20,
        category: 'electronics',
        imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop',
      },
      {
        name: 'Sony WH-1000XM5',
        description: 'Audífonos inalámbricos con cancelación de ruido líder en la industria',
        price: 399.99,
        stock: 30,
        category: 'electronics',
        imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop',
      },
      {
        name: 'Adidas Ultraboost 22',
        description: 'Zapatillas para running con tecnología Boost para máximo retorno de energía',
        price: 189.99,
        stock: 40,
        category: 'clothing',
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop',
      },
      {
        name: 'iPad Pro 12.9"',
        description: 'Tablet profesional con chip M2 y pantalla Liquid Retina XDR',
        price: 1099.99,
        stock: 18,
        category: 'electronics',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
      },
      {
        name: 'Levi\'s 501 Original Jeans',
        description: 'Jeans clásicos de mezclilla 100% algodón, el original desde 1873',
        price: 89.99,
        stock: 60,
        category: 'clothing',
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
      },
      {
        name: 'Canon EOS R6 Mark II',
        description: 'Cámara mirrorless full-frame con estabilización de imagen de 5 ejes',
        price: 2499.99,
        stock: 8,
        category: 'electronics',
        imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&h=500&fit=crop',
      },
      {
        name: 'The North Face Nuptse Jacket',
        description: 'Chaqueta de plumón retro con relleno de plumón 700-fill',
        price: 279.99,
        stock: 25,
        category: 'clothing',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
      },
    ];

    for (const productData of products) {
      const product = this.productRepository.create(productData);
      await this.productRepository.save(product);
      console.log(`✅ Created product: ${productData.name}`);
    }

    console.log('🎉 Product seed completed successfully!');
  }
}