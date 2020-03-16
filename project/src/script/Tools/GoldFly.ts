import Point = Laya.Point;
import Sprite = Laya.Sprite;
import Image = Laya.Image;
export default class GoldFly {
    private readonly start: Point;
    private readonly end: Point;
    private readonly addParent: Laya.Sprite;
    private readonly action: Function;
    private readonly moveObj: Laya.Sprite;
    private readonly moveFinishArg: any;
    //回调的上下问
    private readonly contex: Object;
    private readonly num: number;
    constructor(start: Point, endPoint: Point, moveObj?: Image, parent?: Laya.Sprite, action?: Function, arg?: any, contex?: Object, num?: number) {
        this.start = start;
        this.end = endPoint;
        this.addParent = parent || Laya.stage;
        this.action = action;
        this.num = num || 0;
        this.moveObj = moveObj || this.createFlyImage();
        this.moveFinishArg = arg || null;
        this.contex = contex || null;

        this.startMove();
    };
    private createFlyImage(): Laya.Sprite {
        const getDiamond: Laya.Prefab = Laya.loader.getRes("prefab/getDiamond.json");
        let aniDiamond: Laya.Sprite = Laya.Pool.getItemByCreateFun("getDiamond", getDiamond.create, getDiamond);
        aniDiamond.alpha = 0;
        aniDiamond.scale(0, 0);
        aniDiamond.pos(Laya.stage.width / 3 + 30, Laya.stage.height / 3 + 50);
        let numberDiamonds = aniDiamond.getChildByName('numberDiamonds') as Laya.FontClip;
        numberDiamonds.value = 'x' + this.num;
        aniDiamond.zOrder = 1100;
        this.addParent.addChild(aniDiamond);
        // Laya.Browser.window.aniDiamond = aniDiamond;
        return aniDiamond;

    }
    changeIconTexture(url: string) {
        if (url) {
            this.moveObj.texture = Laya.loader.getRes(url);
        }
    }
    private startMove() {
        const aniDiamond = this.moveObj;
        // 动画表现
        let timeLine = new Laya.TimeLine;

        timeLine.addLabel('appear', 0).to(aniDiamond, { scaleX: 1, scaleY: 1, alpha: 1 }, 500, Laya.Ease.circInOut, 0)
            .addLabel('move', 0).to(aniDiamond, { x: this.end.x - 10, y: this.end.y + 50, scaleX: 0.5, scaleY: 0.5 }, 700, Laya.Ease.circInOut, 0)
            .addLabel('vanish', 0).to(aniDiamond, { x: this.end.x, y: this.end.y, alpha: 0 }, 500, Laya.Ease.circInOut, 0)
        timeLine.play('appear', false);
        timeLine.on(Laya.Event.COMPLETE, this, this.moveEnd);
        timeLine.on(Laya.Event.LABEL, this, this.onLabel);
    }
    onLabel(label) {
        console.log("LabelName:" + label);
    }
    private moveEnd() {
        // this.moveObj.destroy();
        this.moveObj.removeSelf();
        Laya.Pool.recover("getDiamond", this.moveObj);
        if (this.action && this.contex) {
            this.action.call(this.contex, this.moveFinishArg);
        }
    }
}   