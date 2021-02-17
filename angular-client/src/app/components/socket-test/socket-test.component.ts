import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';
import { Subscription } from 'rxjs';
import { Message } from 'src/app/models/message';

@Component({
  selector: 'app-socket-test',
  templateUrl: './socket-test.component.html',
  styleUrls: ['./socket-test.component.scss']
})
export class SocketTestComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription();
  public username: string;
  public messages: Array<Message> = new Array<Message>();
  public message: string;
  public entered: boolean = false;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.exitClient();
  }

  private registerClient() {
    if (this.username && this.username.trim() != "") {
      this.socketService.registerClient({ username: this.username });
      this.subscribeServerResponse();
    }
  }

  private exitClient() {
    if (this.username && this.username.trim() != "") {
      this.socketService.removeSocket();
      this.username = null;
      this.message = null;
    }
  }

  private subscribeServerResponse() {
    this.subscriptions.add(this.socketService.receiveServerResponse().subscribe((data) => {
      console.log(data);

      if (!data.error) {
        this.messages.push(JSON.parse(data));
      } else {
        console.log(data.error);
      }
    }));
  }

  public toggleConnection() {
    if (this.username && this.username.trim() != "") {
      this.entered = !this.entered;

      if (this.entered) {
        this.registerClient();
      } else {
        this.exitClient();
      }
    }
  }

  public sendMessage() {
    if (this.entered && this.message) {
      this.socketService.sendClientResponse(this.message);
      this.message = null;
    }
  }
}
