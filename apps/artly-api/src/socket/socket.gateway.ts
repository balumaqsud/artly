import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import * as url from 'url';
import { AuthService } from '../components/auth/auth.service';
import { Member } from '../libs/dto/member/member';

interface MessagePayload {
  event: string;
  text: string;
  memberData: Member | null | undefined;
}

interface InfoPayload {
  event: string;
  totalClients: number;
  memberData: Member | null | undefined;
  action: string;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
  private logger: Logger = new Logger('SocketEventsLogger');
  private total: number = 0;
  private clientAuthMap = new Map<WebSocket, Member | null>();
  private messagesList: MessagePayload[] = [];

  constructor(private authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  public afterInit(server: Server) {
    this.logger.verbose(`web socket Started: total: ${this.total}`);
  }

  public async handleConnection(client: WebSocket, req: any) {
    const authMember = await this.retrieveMember(req);
    this.total++;
    this.clientAuthMap.set(client, authMember);

    const clientNick: string = authMember?.memberNick ?? 'guest';

    this.logger.verbose(
      `web socket Connection ${clientNick} Running: total: ${this.total}`,
    );

    const infoMsg: InfoPayload = {
      event: 'info',
      totalClients: this.total,
      memberData: authMember,
      action: 'joined',
    };

    this.emitMessage(infoMsg);
    // client messages
    client.send(
      JSON.stringify({ event: 'getMessages', list: this.messagesList }),
    );
  }

  private async retrieveMember(req: any): Promise<Member | null> {
    try {
      const parsedUrl = url.parse(req.url, true);
      const { token } = parsedUrl.query;
      return await this.authService.verifyToken(token as string);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public handleDisconnect(client: WebSocket) {
    const authMember = this.clientAuthMap.get(client);
    this.total--;
    this.clientAuthMap.delete(client);

    const clientNick: string = authMember?.memberNick ?? 'guest';
    this.logger.warn(`disconnection: ${clientNick} total: ${this.total}`);

    const infoMsg: InfoPayload = {
      event: 'info',
      totalClients: this.total,
      memberData: authMember,
      action: 'left',
    };

    this.broadcastMessage(client, infoMsg);
  }

  @SubscribeMessage('message')
  public async handleMessage(
    client: WebSocket,
    payload: string,
  ): Promise<void> {
    const authMember = this.clientAuthMap.get(client);
    const newMsg: MessagePayload = {
      event: 'message',
      text: payload,
      memberData: authMember,
    };

    this.messagesList.push(newMsg);

    const clientNick: string = authMember?.memberNick ?? 'guest';
    this.logger.verbose(`message: ${clientNick} : ${payload}`);
    this.emitMessage(newMsg);
  }

  private broadcastMessage(sender: WebSocket, message: InfoPayload) {
    this.server.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private emitMessage(message: InfoPayload | MessagePayload) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
