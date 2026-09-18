import { Injectable, Logger } from '@nestjs/common';
import type { TipoDocumentoCliente } from '../../domain/entities/cliente.entity.js';
import { ClienteModel } from '../models/cliente.model.js';

interface ClienteDemo {
  tipoDocumento: TipoDocumentoCliente;
  numeroDocumento: string;
  nombre: string;
  telefono?: string;
  email?: string;
}

export const CLIENTE_DEMO_NUMERO_DOCUMENTO = '890900943-9';

const CLIENTES_DEMO: ClienteDemo[] = [
  {
    tipoDocumento: 'NIT',
    numeroDocumento: CLIENTE_DEMO_NUMERO_DOCUMENTO,
    nombre: 'Postobón S.A.',
    telefono: '+57 604 3391000',
    email: 'contacto@postobon.com',
  },
];

@Injectable()
export class ClienteSeeder {
  private readonly logger = new Logger(ClienteSeeder.name);

  async seed(): Promise<void> {
    for (const demo of CLIENTES_DEMO) {
      const [, created] = await ClienteModel.findOrCreate({
        where: { numeroDocumento: demo.numeroDocumento },
        defaults: demo,
      });

      if (created) {
        this.logger.log(`Cliente demo creado: ${demo.nombre} (${demo.numeroDocumento})`);
      }
    }
  }
}
