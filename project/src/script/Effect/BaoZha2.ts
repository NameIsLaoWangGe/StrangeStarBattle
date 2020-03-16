export default class BaoZha2 extends Laya.Script {
    /**
     *boss的爆炸动画和敌人的死亡爆炸动画
     *  
     */
    constructor() { super(); }
    private self: Laya.Sprite;
    private skObj: Laya.Skeleton;
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.skObj = this.self.getChildAt(0) as Laya.Skeleton;
        this.skObj.on(Laya.Event.STOPPED, this, this.stopped);
    }
    stopped() {
        this.self.removeSelf();
    }
    onDisable(): void {
        Laya.Pool.recover("xg_baozha", this.self);
    }
}