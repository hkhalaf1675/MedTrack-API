import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Reminder } from './entities/reminder.entity';

@WebSocketGateway({ cors: true })
export class ReminderGateway implements OnGatewayInit {
  private readonly logger = new Logger(ReminderGateway.name);
  
  @WebSocketServer() server: Server;

  afterInit() {
    this.logger.log('Reminder websocket gateway has been initialized .............');
  }

  handleConnection(client: Socket){
    const userId = Number(client.handshake.query.userId);

    if(userId && !isNaN(userId)){
      client.join(String(userId));
      this.logger.log(`Client has been joined room: ${userId} ..................`);
    }
  }

  @SubscribeMessage('reminder-notification')
  sendReminder(@ConnectedSocket() client: Socket, payload: { userId: number; reminder: Reminder }): void {
    this.sendReminderToUser(payload.userId, payload.reminder);
  }

  sendReminderToUser(userId: number, reminder: Reminder) {
    this.server.to(String(userId)).emit('reminder', reminder);
  }
}
