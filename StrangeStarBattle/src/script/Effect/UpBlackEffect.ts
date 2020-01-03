import LYSprite = Laya.Sprite;
import AdaptScene from "../manage/AdaptScene";
export default class UpBlackEffect extends LYSprite {
    private static _instance: UpBlackEffect;
    /**
     * 战斗中手指松开,效果
     */
    constructor() {
        super();
        this.loadImage("face/暂停遮照.png");
        this.visible = false;
        this.width = Laya.stage.width;
        this.height = Laya.stage.height;
        AdaptScene.getInstance().setBg(this);
        Laya.stage.addChild(this);
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new UpBlackEffect();
        }

        return this._instance;
    }
    // private animationIndex: number;
    setShow() {
        this.visible = true;
        this.alpha = 1;
        // this.animationIndex = 0;
        this.clearEffect();
    }
    // setAnimation() {
    //     this.animationIndex++ % 2 == 0 && (this.visible = !this.visible);
    // }
    setHide() {
        this.alpha && Laya.Tween.to(this, { alpha: 0 }, 2000);
    }
    clearEffect() {
        Laya.timer.clearAll(this);
        Laya.Tween.clearTween(this);
    }
}