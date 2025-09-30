import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
  private logger: Logger = new Logger('webSocketGateway');
  private total: number = 0;

  public afterInit(server: Server) {
    this.logger.verbose(`web socket Started: total: ${this.total}`);
  }

  handleConnection(client: WebSocket, ...args: any) {
    this.total++;
    this.logger.log(`web socket  Running: total: ${this.total}`);
  }

  handleDisconnect(client: WebSocket, ...args: any) {
    this.total--;
    this.logger.warn(`web socket Stopped: total: ${this.total}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
