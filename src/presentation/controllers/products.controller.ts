import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { ProductRepositoryInterface } from '../../domain/repositories/product.repository.interface';
import { CreateProductDto } from '../dtos/product/create-product.dto';
import { UpdateProductDto } from '../dtos/product/update-product.dto';
import { Product } from '../../domain/entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryInterface,
  ) {}

  @Get()
  async getAllProducts(@Query('category') category?: string, @Query('search') search?: string) {
    try {
      if (search) {
        return await this.productRepository.search(search);
      }
      
      if (category) {
        return await this.productRepository.findByCategory(category);
      }
      
      return await this.productRepository.findAll();
    } catch (error) {
      throw new HttpException('Failed to fetch products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    try {
      const product = await this.productRepository.findById(id);
      
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      
      return product;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createProduct(@Body() createProductDto: CreateProductDto) {
    try {
      const product = new Product(
        '',
        createProductDto.name,
        createProductDto.description,
        createProductDto.price,
        createProductDto.imageUrl || '',
        createProductDto.category || '',
        createProductDto.stock,
      );

      return await this.productRepository.create(product);
    } catch (error) {
      throw new HttpException('Failed to create product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    try {
      const existingProduct = await this.productRepository.findById(id);
      
      if (!existingProduct) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      const updatedProduct = await this.productRepository.update(id, updateProductDto);
      
      if (!updatedProduct) {
        throw new HttpException('Failed to update product', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      return updatedProduct;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteProduct(@Param('id') id: string) {
    try {
      const product = await this.productRepository.findById(id);
      
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      const deleted = await this.productRepository.delete(id);
      
      if (!deleted) {
        throw new HttpException('Failed to delete product', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return { message: 'Product deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}