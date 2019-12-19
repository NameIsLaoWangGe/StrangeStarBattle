import SecondWeaponData from "../manage/SecondWeaponData"
import Data from "../Data/JsonEnum"
export default class EnemySelfSkillControl extends Laya.Script {
    /** @prop {name:intType, tips:"整数类型示例", type:Int, default:1000}*/
    public intType: number = 1000;
    /** @prop {name:numType, tips:"数字类型示例", type:Number, default:1000}*/
    public numType: number = 1000;
    /** @prop {name:strType, tips:"字符串类型示例", type:String, default:"hello laya"}*/
    public strType: string = "hello laya";
    /** @prop {name:boolType, tips:"布尔类型示例", type:Bool, default:true}*/
    public boolType: boolean = true;
    // 更多参数说明请访问: https://ldc2.layabox.com/doc/?nav=zh-as-2-4-0
    private buffType: string;
    private self: Laya.Sprite;
    private skObj: Laya.Skeleton;
    private sk_status: number;
    constructor() { super(); }

    onEnable(): void {
        this.sk_status = null;
        this.self = this.owner as Laya.Sprite;
        this.buffType = SecondWeaponData.getInstance().buffType[0];
        switch (this.buffType) {
            case "3":
                this.skObj = this.self.getChildAt(0) as Laya.Skeleton;
                Laya.timer.frameOnce(3, this, () => { this.skObj.play(2, true, true); });
                break;
            case "4":
                this.skObj = this.self.getChildByName("sk_name") as Laya.Skeleton;

                Laya.timer.frameOnce(2, this, () => {
                    this.skObj.on(Laya.Event.STOPPED, this, this.stopLister);
                    this.skObj.play(2, false, true);
                    this.sk_status = 3;
                });
                break;
            default:
                break;
        }
    }
    stopLister(): void {
        if (this.sk_status && this.sk_status === 3) {
            this.self.removeSelf();
        }
    }
    onDisable(): void {
        Laya.Pool.recover(Data.muzzlePrefabEnemy[this.buffType], this.owner);
    }
}