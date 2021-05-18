import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import config from './config';

//importamos el objeto Client para tipar nuestra conexion
import { Client } from 'pg';

@Injectable()
export class AppService {
  constructor(
    // @Inject('API_KEY') private apiKey: string,
    //inyectamos nuestro provider de conexion con postgresql
    @Inject('POSTGRES_CONNECTION') private clientPostgres: Client,
    @Inject('TASKS') private tasks: any[],
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}

  getHello(): string {
    const apiKey = this.configService.apiKey;
    const name = this.configService.database.name;
    return `Hello World! ${apiKey} ${name}`;
  }

  //nos conectamos a la refrencia directa del cliente
  getTasks() {
    //el service debe enviarle algo al controller por lo que enviamos una promesa y que se puede manejar de manera asincrona
    return new Promise((resolve, reject) => {
      this.clientPostgres.query('SELECT * FROM tasks', (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res.rows);
      });
    });
  }
}
