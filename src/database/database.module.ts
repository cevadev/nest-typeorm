import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

//import pg client
import { Client } from 'pg';

import config from '../config';

const API_KEY = '12345634';
const API_KEY_PROD = 'PROD1212121SA';

//corremos una query. El metodo es error first, primero el error si ocurre o la respuesta
/* client.query('SELECT * FROM tasks', (err, res) => {
  console.error(err);
  console.info(res.rows);
}); */

@Global()
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY_PROD : API_KEY,
    },
    {
      provide: 'POSTGRES_CONNECTION',
      //pasamos el config.KEY como parametro de entrada
      useFactory: (configService: ConfigType<typeof config>) => {
        //seleccionamos nuestra configuracion para postgres del configService
        //const { user, host, dbName, password, port } = configService.postgres;

        //construimos la conexion programatica a al BD
        const client = new Client({
          //opciones de conexion
          user: configService.postgres.user,
          host: configService.postgres.host,
          database: configService.postgres.dbName,
          password: configService.postgres.password,
          port: configService.postgres.port,
        });

        //nos conectamos
        client.connect();
        //retornamos el client para todos nuestros servicios
        return client;
      },
      inject: [config.KEY],
    },
  ],
  exports: ['API_KEY', 'POSTGRES_CONNECTION'],
})
export class DatabaseModule {}
