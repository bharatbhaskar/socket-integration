import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor() { }

  public initialise(): void {
    if (!this.socket) {
      this.socket = socketIo(environment.socketConfig.url, environment.socketConfig.options);
    }
  }

  public removeSocket(): void {
    if (this.socket) {
      this.socket.emit('client_disconnected');
      this.socket = null;
    }
  }

  public registerClient(data: any) {
    if (!this.socket) {
      this.initialise();
    }
    this.socket.emit('client_connected', data);
  }

  public sendClientResponse(data: any) {
    this.socket.emit('client_response', data);
  }

  public receiveServerResponse() {
    return new Observable<any>(observer => {
      this.socket.on('server_response', (data: any) => observer.next(data));
    });
  }
}
