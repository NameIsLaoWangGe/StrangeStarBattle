import SecondWeaponData from "../manage/SecondWeaponData"
import PlayingSceneControl from "../playing/PlayingSceneControl"
import Data2 from "../Data/JsonEnum"
export default class MuzzleControl extends Laya.Script {
    /** @prop {name:intType, tips:"整数类型示例", type:Int, default:1000}*/
    public intType: number = 1000;
    /** @prop {name:numType, tips:"数字类型示例", type:Number, default:1000}*/
    public numType: number = 1000;
    /** @prop {name:strType, tips:"字符串类型示例", type:String, default:"hello laya"}*/
    public strType: string = "hello laya";
    /** @prop {name:boolType, tips:"布尔类型示例", type:Bool, default:true}*/
    public boolType: boolean = true;
    // 更多参数说明请访问: https://ldc2.layabox.com/doc/?nav=zh-as-2-4-0
    /**
     * 炮口控制 副武器
     */
    private self: Laya.Sprite;
    private sk: Laya.Skeleton;
    private skStatus: number;
    private secondData: SecondWeaponData;
    private _bulletType: Array<string>;
    //private readonly hashSKNames = {""};
    private canCreateB: boolean;
    constructor() { super(); }
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.sk = this.self.getChildAt(0) as Laya.Skeleton;
        this.sk.on(Laya.Event.STOPPED, this, this.listerStop);
        this.secondData = SecondWeaponData.getInstance();
        this._bulletType = this.secondData.buffType;
        this.canCreateB = true;
        switch (this._bulletType[0]) {
            case "3":
                Laya.timer.frameOnce(3, this, () => {
                    this.sk.play(0, false);
                    this.skStatus = 0;
                });
                break;
            case "4":
            case "1":
            case "6":
            case "7":
            case "8":
            case "9":
            case "10":
                Laya.timer.frameOnce(3, this, () => {
                    this.sk.play(1, false);
                    this.skStatus = 2;
                });
                break;
            case "5":
                Laya.timer.frameOnce(3, this, () => {
                    this.sk.play(1, false);
                    this.skStatus = 1;
                });
                break;
            default:
                break;
        }
    }
    listerStop(e: Laya.Event): void {
        switch (this._bulletType[0]) {
            case "3":
                if (this.skStatus === 0 && this.canCreateB) {
                    this.canCreateB = false;
                    this.createBulletSecond();
                }
                break;
            case "4":
                if (this.skStatus === 2) {
                    this.sk.play(0, false);
                    this.skStatus = 1;
                } else if (this.skStatus == 1 && this.canCreateB) {
                    this.canCreateB = false;
                    this.createBulletSecond();
                }
                break;
            case "5":
                if (this.skStatus === 1 && this.canCreateB) {
                    this.canCreateB = false;
                    this.createBulletSecond();
                }
                break;
            //以下是暂时的
            case "6":
                //电磁炮
                if (this.skStatus === 2) {
                    this.sk.play(0, false);
                    this.skStatus = 1;
                } else if (this.skStatus == 1 && this.canCreateB) {
                    this.canCreateB = false;
                    this.createBulletSecond();
                }
                break;
            case "7":
                //导弹跑
                if (this.skStatus === 2) {
                    this.sk.play(0, false);
                    this.skStatus = 1;
                } else if (this.skStatus == 1 && this.canCreateB) {
                    this.canCreateB = false;
                    this.createBulletSecond();
                }
                break;
            case "1":
                //流星炮
                if (this.skStatus === 2) {
                    this.sk.play(0, false);
                    this.skStatus = 1;
                } else if (this.skStatus == 1 && this.canCreateB) {
                    this.canCreateB = false;
                    this.createBulletSecond();
                }
                break;
            case "8":
                //虚空引擎
                if (this.skStatus === 2) {
                    this.sk.play(0, false);
                    this.skStatus = 1;
                } else if (this.skStatus == 1 && this.canCreateB) {
                    this.canCreateB = false;
                    this.createBulletSecond();
                }
                break;
            case "9":
                //飞刃风暴
                if (this.skStatus === 2) {
                    this.sk.play(0, false);
                    this.skStatus = 1;
                } else if (this.skStatus == 1 && this.canCreateB) {
                    this.canCreateB = false;
                    this.createBulletSecond();
                }
                break;
            case "10":
                //蘑菇炮
                if (this.skStatus === 2) {
                    this.sk.play(0, false);
                    this.skStatus = 1;
                } else if (this.skStatus == 1 && this.canCreateB) {
                    this.canCreateB = false;
                    this.createBulletSecond();
                }
                break;
            default:
                break;
        }

    }
    createBulletSecond() {
        this.sk.stop();
        Laya.timer.clearAll(this);
        this.self.removeSelf();
        PlayingSceneControl.instance.createBulletSecond();
    }
    onDisable(): void {
        const recoverName = Data2.muzzlePrefab[Number(this._bulletType[0])];
        Laya.Pool.recover(recoverName || "Bullet_skill4_enemy", this.owner);
    }
}