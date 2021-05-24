import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
  JoinColumn,
} from 'typeorm';

import { Brand } from './brand.entity';
import { Category } from './category.entity';

@Entity({
  //indicamos le nombre de la tabla en la BD
  name: 'products',
})
@Index(['price', 'stock'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Index()
  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'varchar' })
  image: string;

  @CreateDateColumn({
    //le indicamos como se debe llamar el campo en la tabla products de la BD
    name: 'create_at',
    //definimos el tipo de campo: timestamptz, de tipo timestamp que organiza la zona horaria, es decir
    //no importa donde este, la va a adaptar al pais
    type: 'timestamptz',
    //Al momento de hacer la insercion del registro agrega el timestamp actual
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date;

  @UpdateDateColumn({
    name: 'update_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt: Date;

  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({
    name: 'brand_id',
  })
  brand: Brand;

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({
    name: 'products_categories', //nombre de la tabla ternaria que typeorm creara aplicando naming
    joinColumn: {
      name: 'product_id', //relacion con la entidad donde estas situado (estamos situado en la entity product)
    },
    inverseJoinColumn: {
      name: 'category_id', //relacion con la otra entidad.
    },
  })
  categories: Category[];
}
