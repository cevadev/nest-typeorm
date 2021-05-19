import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
//import pg client
import { Client } from 'pg';
//import TypeORM
import { TypeOrmModule } from '@nestjs/typeorm';

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
  //Todos los Module como TypeOrmModule se importan dentro de @Module y no en los providers
  imports: [
    //espeficamos la configuracion asincrona por lo que podemos usar useFactory e Inject
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      //pasamos el config.KEY como parametro de entrada
      useFactory: (configService: ConfigType<typeof config>) => {
        //seleccionamos nuestra configuracion para postgres del configService
        const { user, host, dbName, password, port } = configService.postgres;
        //retornamos los valores que typeorm necesita para hacer la conexion
        return {
          //tipo de bd
          type: 'postgres',
          host,
          port,
          username: user,
          password,
          database: dbName,
          //sincronizamos nuestra entiedad con la base de datos, si no existe la tabla la crea
          //en ambiente de produccion este atributo y autoLoadEntities sdebe ser false
          synchronize: false,
          autoLoadEntities: true,
        };
      },
    }),
  ],
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
  //la configuracion de TypeOrmModule la exportamos a toda la app
  exports: ['API_KEY', 'POSTGRES_CONNECTION', TypeOrmModule],
})
export class DatabaseModule {}
