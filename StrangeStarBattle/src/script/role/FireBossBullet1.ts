/**
 * boss5 的普攻1 的 parent
 */
export default class FireBossBullet1 extends Laya.Sprite {
    private static _items: Array<FireBossBullet1> = [];
    constructor() {
        super();
        FireBossBullet1._items.push(this);
    }
    public static getItems() {
        return this._items || [];
    }
    updateDate() {
        this.y += 2;
        if (this.y >= (this.stage.height - 100)) {
            this.y = 0;
            Laya.timer.clearAll(this);
            let i: number = 0;
            this.removeChildren();
            // for (i; i < this.numChildren; i++) {
            //     // this.getChildAt(i).visible = false;
            //     this.getChildAt(i).removeSelf();
            // }
            Laya.Pool.recover("fireBossB1", this);
        }
    }
    startLoop() {
        Laya.timer.clearAll(this);
        Laya.timer.frameLoop(2, this, this.updateDate);
    }
}