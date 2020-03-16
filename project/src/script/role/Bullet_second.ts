import SecondWeaponData from "../manage/SecondWeaponData"
import Enemy from "../playing/Enemy"
import PlayingControl from "../playing/PlayingSceneControl"
import BulletMain from "../Bullet/BulletMain";
import { tools } from "../Tools/Tool";
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
    private secondType: number;
    //secondType = 11 自动跟随
    //调整方向的间隔
    private changeTraceInterval: number = 800;
    //上一次调整方向的时间戳
    private changeDirectTime: number;
    // 自动跟随的的x.y speed
    private speedXy: any;
    //跟随的目标
    private targetObj: Laya.Sprite;

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
        this.sk_object = this.owner.getChildByName("sk_name") as Laya.Skeleton;
        this.secondType = Number(this._bulletType[0]);
        switch (this.secondType) {
            case 3:
                Laya.timer.frameOnce(3, this, () => {
                    this.sk_object.play("bd", true, true);
                });
                break;
            case 4:
                Laya.timer.frameOnce(3, this, () => {
                    this.sk_object.play("ld", true, true);
                });
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
        this.secondType === 11 && this.selectTraceTarget();
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
        //纠正
        if (this.self.x >= Laya.stage.width + 200 || this.self.x <= -200) {
            this.self.removeSelf();
        }
        if (this.judgeType8()) {
            if (Date.now() - this.markTime >= this.property.keepTimeValue * 1000) {
                this.self.removeSelf();
            }
            return;
        }
        if (this.secondType === 11) {
            if (Date.now() - this.changeDirectTime >= this.changeTraceInterval) {
                this.selectTraceTarget();
            }
            this.self.x += this.speedXy.x;
            this.self.y += this.speedXy.y;
        } else {
            this.self.y += this.bulletSpeed;
        }
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
    /**
     * 选择跟随的目标
     */
    selectTraceTarget() {
        this.changeDirectTime = Date.now();
        // if (!(this.targetObj && this.targetObj.visible)||) {
        const parentSprite: Laya.Sprite = PlayingControl.instance.EnemySpite;
        if (parentSprite._children.length) {
            this.targetObj = parentSprite._children[tools.random(0, parentSprite._children.length - 1)];
            if (this.targetObj.x === void 0) {
                debugger
            }

            this.setTraceDirect();
            return;
        }
        // }
        this.setTraceDirect(true);
    }
    /**
     * 设置跟随的方向
     */
    setTraceDirect(noTarget?: boolean) {
        (this.speedXy === void 0) && (this.speedXy = {});
        if (noTarget) {
            this.speedXy.y = this.bulletSpeed;
            this.speedXy.x = 0;
            this.self.rotation = 0;
            return;
        }
        const proportion = new Laya.Point(this.targetObj.x - this.self.x, this.targetObj.y - this.self.y);
        proportion.normalize();
        let angle = 0;
        if (proportion.x === 0 && proportion.y === 0) {
            angle = -90;
        } else if (proportion.x === 0) {
            angle = proportion.y > 0 ? 90 : 360 - 90;
        } else if (proportion.y === 0) {
            angle = proportion.x < 0 ? 180 : 0;
        } else {
            angle = tools.getAngleByTan(proportion.y / proportion.x);
        }
        if (proportion.x < 0 && proportion.y < 0) {
            angle = 180 + angle;
        } else if (proportion.x < 0 && proportion.y > 0) {
            angle = angle - 180 + 360;
        }

        this.self.rotation = angle + 90;
        this.speedXy.y = this.bulletSpeed;
        this.speedXy.x = (proportion.x * this.speedXy.y) / proportion.y;
        this.speedXy.y = proportion.y < 0 ? -Math.abs(this.speedXy.y) : Math.abs(this.speedXy.y);
        this.speedXy.x = proportion.x < 0 ? -Math.abs(this.speedXy.x) : Math.abs(this.speedXy.x);
    }
    onDisable(): void {
        this.self.visible = false;
        this.targetObj = null;
        Laya.Pool.recover(SecondWeaponData.getInstance().bulletPrefab, this.owner);
    }

}