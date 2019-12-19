import SecondWeaponData from "../manage/SecondWeaponData"
import Enemy from "../playing/Enemy"
import PlayingControl from "../playing/PlayingSceneControl"
import BulletMain from "../Bullet/BulletMain";
interface cWhType {
    w: number;
    h: number;
}
export default class Bullet_second extends Laya.Script {
    constructor() {
        super();
    }
    private secondData: SecondWeaponData;
    private _bulletType: Array<string>;
    //冰缓时间和速度
    private _iceTS: Array<number>;
    //漂浮的时间
    private _flottantT: number;
    private sk_object: Laya.Skeleton;
    //sk状态
    private status: number;

    //repeateUse
    private repeateUse: boolean;
    private self: Laya.Sprite;
    private bulletSpeed: number;
    private property: BulletMain;
    private markTime: number;
    onEnable(): void {
        this.repeateUse = false;
        this.self = this.owner as Laya.Sprite;
        this.property = this.self["property"];
        if (this.self.parent !== PlayingControl.instance.bulletParent) {
            this.self.visible = true;
            this.self.on(Laya.Event.STOPPED, this, this.listenStop);
            return;
        }
        this.secondData = SecondWeaponData.getInstance();
        this._bulletType = this.secondData.buffType;
        const boxCollider: Laya.BoxCollider = this.self.getComponent(Laya.BoxCollider) as Laya.BoxCollider;
        const circleCollider: Laya.CircleCollider = this.self.getComponent(Laya.CircleCollider) as Laya.CircleCollider;
        this.sk_object = this.owner.getChildByName("sk_name") as Laya.Skeleton;
        const markType = Number(this._bulletType[0]);
        switch (markType) {
            case 3:
                Laya.timer.frameOnce(3, this, () => {
                    this.sk_object.play("bd", true, true);
                });
                // this.rigigBody.setVelocity({ x: 0, y: -this.secondData.getbulletSpeed() });
                break;
            case 4:
                Laya.timer.frameOnce(2, this, () => {
                    this.sk_object.play(3, true, true);
                });
                // this.rigigBody.setVelocity({ x: 0, y: -this.secondData.getbulletSpeed() });
                break;
            case 5:
                Laya.timer.frameOnce(2, this, () => {
                    this.sk_object.play(3, true, true);
                });
                // this.rigigBody.setVelocity({ x: 0, y: -this.secondData.getbulletSpeed() });
                break;
            default:
                break;
        }
        this.bulletSpeed = -this.secondData.getbulletSpeed();
        this.setData();
        //虚空引擎
        if (this.property.secondType === 8) {
            this.self.scale(0.3, 0.3);
            this.markTime = Date.now();
        }
        this.self.visible = true;
    };
    onUpdate(): void {
        if (!this.self.visible) {
            return;
        }
        if (this.self.parent !== PlayingControl.instance.bulletParent) {
            return;
        }
        //副武器 type3 偏移 -220   4:100 
        if (this.self.y < 0) {
            this.sk_object && this.sk_object.stop();
            this.self.removeSelf();
            return;
        }
        if (this.judgeType8()) {
            if (Date.now() - this.markTime >= this.property.keepTimeValue * 1000) {
                this.self.removeSelf();
            }
            return;
        }
        this.self.y += this.bulletSpeed;
    }
    onTriggerEnter(other: any, self: any): void {
        if (!other.owner.visible) {
            return;
        }
        if (!other.owner.parent) {
            return;
        }
        if (this._bulletType[0] !== "4") {
            this.owner.removeSelf();
        }
    }
    judgeType8(): boolean {
        const judgeY = Laya.stage.height * 0.4;
        if (this.property.secondType === 8) {
            if (!this.property.canHitCollision) {
                if (this.self.y <= judgeY) {
                    this.self.scale(1, 1);
                    this.property.canHitCollision = true;
                    return true;
                }
                const nextScaleNum = (this.self.scaleX + 0.01) >= 1 ? 1 : (this.self.scaleX + 0.01);
                this.self.scale(nextScaleNum, nextScaleNum);
            } else {
                return true;
            }
        }
        return false;
    }
    private setData(): void {
        switch (Number(this._bulletType[0])) {
            case 3:
                this._iceTS = this.secondData.getIceData;
                break;
            case 4:

                break;
            case 5:
                this._flottantT = this.secondData.getFlottantT;
                break;
            default:
                break;
        }
    }

    get iceTS(): Array<number> {
        return this._iceTS;
    }
    get flottantT(): number {
        return this._flottantT;
    }
    get bulletType(): number {
        return Number(this._bulletType[0]);
    }
    listenStop() {
        this.self.removeSelf();
    }
    onDisable(): void {
        this.self.visible = false;
        Laya.Pool.recover(SecondWeaponData.getInstance().bulletPrefab, this.owner);
    }

}