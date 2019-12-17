export default class BuffProgressControl extends Laya.Script {
    constructor() { super(); }
    onEnable(): void {
    }
    onDisable(): void {
        (this.owner.getChildByName("img_bg") as Laya.Image).mask.graphics.clear();
        Laya.Pool.recover("buffProgress", this.owner);
    }
}