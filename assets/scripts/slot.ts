
import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Slot')
export class Slot extends Component {

    @property({type:Label})
    private slotValue : Label | null = null;

    //Take a player number and convert to an X or O to display
    set(value: number){
        let label : string = "";
        if (value === 1) {
            label = "X";
      
          } else if (value === 2) {
            label = "O"
          }
        this.slotValue!.string = label;
    }
}

