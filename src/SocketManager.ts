export class User{
    public socket: WebSocket;
    public userId: string;
    public name: string;
    
    constructor(socket: WebSocket, userId:string, name: string){
        this.socket = socket;
        this.userId = userId;
        this.name = name;
    }

}



