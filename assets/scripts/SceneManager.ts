
import { _decorator, Component, Node, systemEvent, SystemEvent, Vec2, Label, Color } from 'cc';
import { Board } from './board';
import Colyseus, { Room } from 'db://colyseus-sdk/colyseus.js';

const { ccclass, property } = _decorator;
@ccclass('SceneManager')
export class SceneManager extends Component {
  
    //Server connection settings
    @property
    private serverURL : string = "localhost";
    @property
    private port : string = "2567";

    //UI Nodes
    @property({type:Node})
    private menuNode : Node | null = null;
    @property({type:Node})
    private lobbyNode : Node | null = null;
    @property({type:Node})
    private gameNode : Node | null = null;
    @property({type:Node})
    private endgameNode : Node | null = null;

    //Game Elements
    @property({type : Board})
    private board : Board | null = null;
    @property({type : Label})
    private statusText : Label | null = null;
    @property({type : Label})
    private resultsText : Label | null = null;
    @property({type:Label})
    private timerText : Label | null = null;

    //local private variables
    private gameState : string = "MENU";
    private client : Colyseus.Client | null = null;
    private room : Colyseus.Room | null = null;
    private countdownInterval : any;

    onLoad(){
        let endpoint : string = `ws://${this.serverURL}:${this.port}`;
        this.client = new Colyseus.Client(endpoint);
        this.resetGame();
    }

    resetGame(){
        this.gameState = "MENU";
        this.board!.initialize(this);
        this.handleGameState();
    }

    onEnable () {
        systemEvent.on(SystemEvent.EventType.MOUSE_DOWN, this.handleMouseClick, this);
    }

    onDisable(){
        this.node.off('mousedown', this.handleMouseClick);
    }

    handleGameState() {
        this.menuNode!.active = this.gameState == "MENU";
        this.lobbyNode!.active = this.gameState == "LOBBY";
        this.gameNode!.active = this.gameState == "GAME";
        this.endgameNode!.active = this.gameState == "ENDGAME"
    }

    handleMouseClick(event: any){
        switch(this.gameState){
            case "MENU":
                {
                    this.gameState = "LOBBY";
                    this.handleGameState();
                    this.connect();
                    break;
                }
        }
    }

    async connect () {
        console.log("Joining game...");
        this.room = await this.client!.joinOrCreate("tictactoe");
    
        let numPlayers = 0;
        this.room.state.players.onAdd = () => {
          numPlayers++;
    
          if (numPlayers === 2) {
            this.onJoin();
          }
        }

        this.room.state.board.onChange = (value: number, index: number) => {
            const x = index % 3;
            const y = Math.floor(index / 3);
            this.board!.set(x, y, value);
          }
      
          this.room.state.listen("currentTurn", (sessionId: string ) => {
            // go to next turn after a little delay, to ensure "onJoin" gets called before this.
            setTimeout(() => this.nextTurn(sessionId), 10);
          });
      
          this.room.state.listen("draw", () => this.showEndgame("Draw!"));
          this.room.state.listen("winner", (sessionId: string) => this.showEndgame(this.room!.sessionId == sessionId ? "You win!" : "You lose!"));
      
          this.room.state.onChange = (changes: any) => {
            console.log("state.onChange =>", changes);
          }
      
          this.room.onError.once(() => {
            this.showEndgame("And error has occurred, sorry!");
          });
    }
    
    showWinner (sessionId: string) {
        this.showEndgame(this.room!.sessionId == sessionId ? "You win!" : "You lose!");
    }

    showEndgame(message : string){
        this.room!.leave()
        this.resultsText!.string = message;
        this.gameState = "ENDGAME";
        this.handleGameState();
        clearInterval(this.countdownInterval);
        //Reset afer a time
        setTimeout(() => {
            this.resetGame();
        }, 5000);
    }

    nextTurn (playerId: string) {
        if (playerId == this.room!.sessionId) {
            this.statusText!.string = "Your move!"
        } else {
            this.statusText!.string = "Opponent's turn..."
        }

        this.timerText!.string = "10";
        this.timerText!.color.set(Color.fromHEX(this.timerText!.color, '#000000'));
    }



    onJoin(){
        console.log("Joined game!");
        this.gameState = "GAME";
        this.handleGameState();
        this.countdownInterval = setInterval(this.turnCountdown.bind(this), 1000)
    }

    turnCountdown () {
        var currentNumber = parseInt(this.timerText!.string, 10) - 1
    
        if (currentNumber >= 0) {
          this.timerText!.string = currentNumber.toString()
        }
    
        let color = this.timerText!.color;
        if (currentNumber <= 3) {
          this.timerText!.color.set(Color.fromHEX(color, '#934e60'));
        } else {
            this.timerText!.color.set(Color.fromHEX(color, '#000000'));
        }
    
      }

    playerAction(pos: Vec2){
        this.room!.send("action", { x: pos.x, y: pos.y })
    }
    
}