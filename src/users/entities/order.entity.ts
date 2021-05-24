import {
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  Entity,
  OneToMany,
} from 'typeorm';
import { Customer } from './customer.entity';
import { OrderItem } from './order-item.entity';

import { Exclude, Expose } from 'class-transformer';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer: Customer;

  @Exclude() //excluimos el array de items y que muestre el array de products
  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  //get array de products
  @Expose()
  get products() {
    //si tenemos productos dentro de items hacemos la transformacion
    if (this.items) {
      //filtramos, quitando datos nulos
      return (
        this.items
          .filter((item) => item !== null && item !== undefined)
          //ya quitados los nulos, transformamos con un map
          .map((item) => ({
            //ya estamos seguros que no hay nulos, definimos el nuevo objeto
            //volcamos la info del producto directamente
            ...item.product,
            OrdenLineId: item.id,
            //agregams el quantity
            quantity: item.quantity,
          }))
      );
    }
    //de lo contrario retornamos un array vacio
    return [];
  }

  //creamos el total del pedido
  @Expose()
  get totalOrder() {
    if (this.items) {
      return (
        this.items
          .filter((item) => item !== null && item !== undefined)
          //reduce nos permite reducir toda al orden a un solo valor, como en nuestro caso el total de la orden
          //total -> acumulador del total
          //item -> linea de la order-item
          .reduce((total, item) => {
            //funcion reductora, valor inicial de la funcion 0
            const totalOrderLine = item.product.price * item.quantity;
            return (total += totalOrderLine);
          }, 0)
      );
    }
    //si no hay items en la orden total 0
    return 0;
  }
}
