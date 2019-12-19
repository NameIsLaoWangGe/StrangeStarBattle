import Point = Laya.Point;
import Sprite = Laya.Sprite;
import Image = Laya.Image;
export default class GoldFly {
    private readonly start: Point;
    private readonly end: Point;
    private readonly addParent: Laya.Sprite;
    private readonly action: Function;
    private readonly moveObj: Image;
    private readonly moveFinishArg: any;
    //回调的上下问
    private readonly contex: Object;
    constructor(start: Point, endPoint: Point, moveObj?: Image, parent?: Laya.Sprite, action?: Function, arg?: any, contex?: Object) {
        this.start = start;
        this.end = endPoint;
        this.addParent = parent || Laya.stage;
        this.action = action;
        this.moveObj = moveObj || this.createFlyImage();
        this.moveFinishArg = arg || null;
        this.contex = contex || null;
        this.startMove();
    };
    private createFlyImage(): Image {
        const goldIcon: Image = new Image();
        goldIcon.skin = "commonPic/钻石图标.png";
        goldIcon.pos(this.start.x, this.start.y);
        this.addParent.addChild(goldIcon);
        Laya.Browser.window.markGold = goldIcon;
        return goldIcon;
    }
    private startMove() {
        Laya.Tween.to(this.moveObj, { x: this.end.x, y: this.end.y }, 500, null, Laya.Handler.create(this, this.moveEnd, []), null, false, true);
    }
    private moveEnd() {
        this.moveObj.destroy();
        if (this.action && this.contex) {
            this.action.call(this.contex, this.moveFinishArg);
        }
    }
}   