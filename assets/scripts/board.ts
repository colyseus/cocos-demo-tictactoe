
import { _decorator, Component, instantiate, Vec2, Node} from 'cc';
import { GridClickListener } from './gridClickListener';
import { SceneManager } from './SceneManager';
import { Slot } from './slot';

const { ccclass, property } = _decorator;

@ccclass('Board')
export class Board extends Component {
    //The object that will be spawned upon a click
    @property({type: Node})
    private slotRef : Node | null = null;

    //Array of items listening for clicks
    @property({type: GridClickListener})
    private listeners : GridClickListener[] = [];

    //The size of each grid space, used for placing X's and O's
    size: number = 190;

    //Reference to slots that we've spawned so we can delete them on reset
    private slotReferences : Array<Slot> = [];
    
    initialize(owner: SceneManager){
        if(this.slotReferences != null && this.slotReferences.length > 0){
            this.slotReferences.forEach((slot) =>{
                slot.node.destroy();
            });
        }
        this.slotReferences = new Array<Slot>();
        this.listeners.forEach((listener) =>{
            listener.registerForClick(owner);
        })
    }

    //The server has responded with the grid indices and player that clicked
    set(x: number, y: number, value: number){
        let yPos = -this.size + (y * this.size);
        let xPos = -this.size + (x * this.size);

        let node = instantiate(this.slotRef);
        node!.parent = this.node;
        node!.setPosition(xPos, yPos);
        let slot = node!.getComponent(Slot);
        slot!.set(value);
        this.slotReferences.push(slot!);
    }
}