import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './../dtos/products.dtos';

@Injectable()
export class ProductsService {
  //inyectamos el respository en el constructor
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
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
    return this.productRepo.find();
  }

  //productRepo.findOne() retorna una promesa por lo que debemos usar async / await
  //resolvemos la promesa antes que el product.controllers.ts la resuelva, ya necesitamos saber si el product existe
  //con async y await resolvemos la promesa antes que el controller
  async findOne(id: number) {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  create(data: CreateProductDto) {
    //1 forma de guardar un nuevo producto, pero muy larga
    /*const newProduct = new Product();
    newProduct.name = data.name;
    newProduct.description = data.description;
    newProduct.price = data.price;
    newProduct.stock = data.stock;
    newProduct.image = data.image; */

    //2da forma. Nuestro repositorio productRepo creara una nueva instancia basado en los datos de dto
    const newProduct = this.productRepo.create(data);
    return this.productRepo.save(newProduct);
  }

  async update(id: number, changes: UpdateProductDto) {
    const product = await this.productRepo.findOne(id);
    //actualizamos la info de product basado en los cambos que vienen del dto
    this.productRepo.merge(product, changes);
    //enviamos los cambios a la bd
    return this.productRepo.save(product);
  }

  remove(id: number) {
    return this.productRepo.delete(id);
  }
}
