import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindConditions } from 'typeorm';

import { Product } from './../entities/product.entity';
import { BrandsService } from './brands.service';
import {
  CreateProductDto,
  UpdateProductDto,
  FilterProductDto,
} from './../dtos/products.dtos';

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

  //params es opcional
  async findAll(params?: FilterProductDto) {
    //si hay parametros, retornamos una busqueda de productos con sus marcas
    if (params) {
      //declaramos la clausla where tipada vacia para ir llenandola dinaminamente.
      const where: FindConditions<Product> = {};
      //deconstruimos el DTO
      const { limit, offset } = params;
      const { maxPrice, minPrice } = params;

      if (minPrice && maxPrice) {
        //podemos declrar una condicion fija
        //where.price = 300

        //declaramos el rango de precios a filtrar
        where.price = Between(minPrice, maxPrice);
      }

      return await this.productRepo.find({
        relations: ['brand'],
        where,
        //take and skip variables de Typeorm. Take -> cuantos datos se mostraran, skip -> offset
        take: limit,
        skip: offset,
      });
    }
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

    //actualizamos las categorias del producto
    if (changes.categoriesIds) {
      const categories = await this.categoryRepo.findByIds(
        changes.categoriesIds,
      );
      product.categories = categories;
    }

    //actualizamos la info de product basado en los cambos que vienen del dto
    this.productRepo.merge(product, changes);
    //enviamos los cambios a la bd
    return this.productRepo.save(product);
  }

  remove(id: number) {
    return this.productRepo.delete(id);
  }

  async removeCategoryByProduct(productId: number, categoryId: number) {
    const product = await this.productRepo.findOne(productId, {
      //resolvemos la relacion product-categories para que exista el array product.categores y poder manipularlo
      relations: ['categories'],
    });
    //retornamos un array (filter) de categories que no contenga a categoryId y se lo asignamos a product.categories
    product.categories = product.categories.filter((item) => {
      return item.id !== categoryId;
    });
    return this.productRepo.save(product);
  }

  async addCategoryToProduct(productId: number, categoryId: number) {
    //obtenemos el product con su relacion con categories
    const product = await this.productRepo.findOne(productId, {
      relations: ['categories'],
    });

    //obtenemos la category con el categoryId
    const category = await this.categoryRepo.findOne(categoryId);
    //agregamos al array de categories en producto nuestra category recuperada.
    product.categories.push(category);
    return this.productRepo.save(product);
  }
}
