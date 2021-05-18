import { Module, HttpModule, HttpService } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

//import pg client
//import { Client } from 'pg';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { DatabaseModule } from './database/database.module';
import { enviroments } from './enviroments';
import config from './config';

//construimos la conexion programatica a al BD
/* const client = new Client({
  //opciones de conexion
  user: 'root',
  host: 'localhost',
  database: 'mydb',
  password: '123456',
  port: 5432,
}); */

//nos conectamos
//client.connect();

//corremos una query. El metodo es error first, primero el error si ocurre o la respuesta
/* client.query('SELECT * FROM tasks', (err, res) => {
  console.error(err);
  console.info(res.rows);
}); */

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: enviroments[process.env.NODE_ENV] || '.env',
      load: [config],
      //ConfigModule será global para todos los servicios o modulos en la app
      isGlobal: true,
      validationSchema: Joi.object({
        //validamos los esquemas de los tipos de nuestras variables en el archivo de entorno .env
        API_KEY: Joi.number().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),

        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.number().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
      }),
    }),
    HttpModule,
    UsersModule,
    ProductsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'TASKS',
      useFactory: async (http: HttpService) => {
        const tasks = await http
          .get('https://jsonplaceholder.typicode.com/todos')
          .toPromise();
        return tasks.data;
      },
      inject: [HttpService],
    },
  ],
})
export class AppModule {}
