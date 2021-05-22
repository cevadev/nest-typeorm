import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './../entities/product.entity';
import { BrandsService } from './brands.service';
import { CreateProductDto, UpdateProductDto } from './../dtos/products.dtos';

import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class ProductsService {
  //inyectamos el respository en el constructor
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    //servicio Repository que nos permite realizar distintas operaciones sobre la tabla Category
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
  ) {}

  /* private counterId = 1;
  private products: Product[] = [
    {
      id: 1,
      name: 'Producto 1',
      description: 'lorem lorem',
      price: 10000,
      stock: 300,
      image: 'https://i.imgur.com/U4iGx1j.jpeg',
    },
  ];
 */
  findAll() {
    return this.productRepo.find({
      //le decimos que resuelva la relacion de Brands
      relations: ['brand'],
    });
  }

  //productRepo.findOne() retorna una promesa por lo que debemos usar async / await
  //resolvemos la promesa antes que el product.controllers.ts la resuelva, ya necesitamos saber si el product existe
  //con async y await resolvemos la promesa antes que el controller
  async findOne(id: number) {
    //obtenemos el producto y el detalle de categoria y brand
    const product = await this.productRepo.findOne(id, {
      relations: ['brand', 'categories'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async create(data: CreateProductDto) {
    //1 forma de guardar un nuevo producto, pero muy larga
    /*const newProduct = new Product();
    newProduct.name = data.name;
    newProduct.description = data.description;
    newProduct.price = data.price;
    newProduct.stock = data.stock;
    newProduct.image = data.image; */

    //2da forma. Nuestro repositorio productRepo creara una nueva instancia basado en los datos de dto
    const newProduct = this.productRepo.create(data);
    if (data.brandId) {
      const brand = await this.brandRepo.findOne(data.brandId);
      //le asignamos la marca al nuevo producto
      newProduct.brand = brand;
    }

    if (data.categoriesIds) {
      const categories = await this.categoryRepo.findByIds(data.categoriesIds);
      newProduct.categories = categories;
    }

    return this.productRepo.save(newProduct);
  }

  async update(id: number, changes: UpdateProductDto) {
    const product = await this.productRepo.findOne(id);
    if (changes.brandId) {
      const brand = await this.brandRepo.findOne(changes.brandId);
      product.brand = brand;
    }
    //actualizamos la info de product basado en los cambos que vienen del dto
    this.productRepo.merge(product, changes);
    //enviamos los cambios a la bd
    return this.productRepo.save(product);
  }

  remove(id: number) {
    return this.productRepo.delete(id);
  }
}
