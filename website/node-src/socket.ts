import { Server, Socket } from "net";
import { logMessage } from "./utilities/logger";
const fs = require('fs')
const os = require('os')
const net = require('net')
const OS = os.platform()

export class SocketServer {
  private clients: Map<Socket, number> = new Map();
  private CLIENT: Socket | undefined;
  private server: Server | undefined;
  private id = 0
  constructor(name: string, address: string, next: CallableFunction) {
    if (OS == 'linux' || OS == 'win32') {
      if (OS == 'linux')
        try { fs.unlinkSync(address); } catch (e) { }
      this.server = net.createServer((client: Socket) => {
        this.clients.set(client, this.id);
        this.id++;
        this.CLIENT = client;
        let dataBuffer = '';
        logMessage("INF", `${name} connected`)
        client.setEncoding('utf8');

        client.on('data', (chunk: any) => {
          dataBuffer += chunk;
          const tmp = dataBuffer.split('\r\n');
          if (tmp.length > 1) {
            for (let i = 0; i < tmp.length - 1; i++) {
              next(tmp[i])
            }
            dataBuffer = tmp[tmp.length - 1];
          }
        });
        client.on('end', () => {
          logMessage("INF", `${name} ${this.clients.get(client)} client disconnected`)
        });
      });

      this.server!.on('error', (e) => {
        logMessage("ERR", `Socket server ${name} initialization failed ${e}`)
      })

      this.server!.listen(address, () => {
        logMessage("INF", `Socket server ${name} initialization succeeded`)
      })
    }
  }

  closeServer() {
    this.server!.close();
  }

  sendMessage(message: string) {
    this.CLIENT!.write(message + '\n')
  }
}
