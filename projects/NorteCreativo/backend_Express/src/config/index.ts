import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from '../routes';
import { testConnection } from '../database/db';

dotenv.config();

export class App {
  private app: Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3012;

    this.settings();
    this.middlewares();
    this.routes();
    this.dbConnection();
  }

  private settings(): void {
    this.app.set('port', this.port);
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    this.app.use('/api', routes);
  }

  private dbConnection(): void {
    void testConnection();
  }

  public listen(): void {
    this.app.listen(this.app.get('port'), () => {
      console.log(`Servidor ejecutándose en puerto ${this.app.get('port')}`);
    });
  }
}
