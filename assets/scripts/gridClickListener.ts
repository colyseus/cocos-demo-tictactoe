
import { _decorator, Component, Node, Vec2 } from 'cc';
import { SceneManager } from './SceneManager';
const { ccclass, property } = _decorator;

@ccclass('GridClickListener')
export class GridClickListener extends Component {
    
    @property({type: Vec2})
    public gridPosition : Vec2 = new Vec2(0,0);

    private _owner: SceneManager | null = null;

    registerForClick(owner: SceneManager){
        this.unregisterForClick();
        this.node.active = true;
        this._owner = owner;
        this.node.on(Node.EventType.MOUSE_DOWN, this.spaceClicked, this);
    }

    unregisterForClick(){
        this.node.off(Node.EventType.MOUSE_DOWN, this.spaceClicked, this);
    }

    spaceClicked(event: any){
        this._owner!.playerAction(this.gridPosition);
        this.unregisterForClick();
        this.node.active = false;
    }
}
