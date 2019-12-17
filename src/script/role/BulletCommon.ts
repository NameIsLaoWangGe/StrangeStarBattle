import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import Prefab = Laya.Prefab;
import MainWeaponData from "../manage/MainWeaponData";
import SecondWeaponData from "../manage/SecondWeaponData";
import BulletType = Data2.BulletType;
import PrefabType = Data2.prefabType;

export default class BulletCommon {
    /**
     * 默认速度
     */
    public readonly defaultSpeedY;
    /**
     * 子弹的火力值
     */
    public readonly hurtValue: number;
    /**
     * 发射间隔
     */
    public readonly shootSpeed;
    /**
     * 子弹的预设的name
     */
    public readonly nick: string;
    /**
     * 子弹的预设 Prefab
     */
    public readonly res: Prefab;
    public readonly prefabType: PrefabType;
    /**
     * 谁发射的子弹的nick Boss1 Boss2
     */
    public fromNick: string;
    /**
     * 部分boss子弹的方向 1 垂直  2 左下   3右下
     */
    public directType: number;
    /**
     * boss子弹类型
     */
    public bossBulletType: Data2.bossBulletType;
    // camp 阵营 1敌人 2主角
    public readonly camp: number;
    public readonly hitRadius: any;
    public scale: number;
    private bulletConfig: Data2.bullet;
    public isWFboss: Boolean;
    constructor(bulletT: BulletType, bossId?: number, isWf?: Boolean) {
        isWf && (this.isWFboss = isWf);
        switch (bulletT) {
            case BulletType.main:
                this.defaultSpeedY = MainWeaponData.getInstance().bulletSpeed;
                this.hurtValue = MainWeaponData.getInstance().fire;
                const tableSpeed = Number(MainWeaponData.getInstance().speed);
                this.shootSpeed = (0.15 - (tableSpeed - 9) * 0.001) * 1000;
                //暂时
                this.nick = "Bullet_red";
                this.res = Laya.loader.getRes("prefab/" + this.nick + ".json");
                this.prefabType = PrefabType.bulletRole;
                this.camp = 1;
                break;
            case BulletType.second:
                const secondInstance = SecondWeaponData.getInstance();
                this.defaultSpeedY = secondInstance.getbulletSpeed();
                this.hurtValue = secondInstance.getFire();
                this.shootSpeed = secondInstance.getSpeed() * 1000;
                this.nick = secondInstance.bulletPrefab;
                this.res = Laya.loader.getRes("prefab/" + this.nick + ".json");
                this.prefabType = PrefabType.bulletSkill;
                this.camp = 1;
                break;
            case BulletType.boss:
                if (!bossId) {
                    console.error("bossId传入错误", bossId);
                    return;
                }
                const configs: Data2.monster = Data.FixedDataTables.getInstance().getData(Data2.DataType.monster, bossId);
                this.bulletConfig = Data.FixedDataTables.getInstance().getData(Data2.DataType.bullet);
                this.hurtValue = 1/*Number(configs.fire)*/;
                switch (configs.pic) {
                    case "boss3":
                        this.shootSpeed = 0.5 * 1000;
                        break;
                    case "boss4":
                        this.shootSpeed = 1 * 1000;
                        break;
                    case "boss5":
                        this.shootSpeed = 1 * 1000;
                        break;
                    default:
                        this.shootSpeed = (0.15 - (Number(configs.shootSpeed) - 9) * 0.001) * 1000;
                        if (configs.pic != "boss1" && configs.pic != "boss2") {
                            this.isWFboss = true;
                        }
                        break;
                }

                this.defaultSpeedY = Number(configs.bulletSpeed);
                //其它通用boss3特别,因为会被主角子弹打掉
                this.nick = "Bullet_boss";
                // this.nick = configs.bullet == "-1" ? Data2.enemyToPerfab.bullet_blue : configs.bullet;
                this.res = Laya.loader.getRes("prefab/" + this.nick + ".json");
                this.prefabType = PrefabType.bullletBoss;
                this.camp = 2;
                this.hitRadius = { w: 51 / 2, h: 52 / 2 };
                break;
            case BulletType.bigEnemy:
                this.isWFboss = true;
                const configs_bigEnemy: Data2.monster = Data.FixedDataTables.getInstance().getData(Data2.DataType.monster, 30108);
                this.bulletConfig = Data.FixedDataTables.getInstance().getData(Data2.DataType.bullet);
                this.hurtValue = 1/*Number(configs.fire)*/;
                switch (configs_bigEnemy.pic) {
                    case "boss3":
                        this.shootSpeed = 0.5 * 1000;
                        break;
                    case "boss4":
                        this.shootSpeed = 1 * 1000;
                        break;
                    case "boss5":
                        this.shootSpeed = 1 * 1000;
                        break;
                    default:
                        this.shootSpeed = (0.15 - (Number(configs_bigEnemy.shootSpeed) - 9) * 0.001) * 1000;
                        break;
                }

                this.defaultSpeedY = Number(configs_bigEnemy.bulletSpeed);
                //其它通用boss3特别,因为会被主角子弹打掉
                this.nick = "Bullet_boss";
                // this.nick = configs.bullet == "-1" ? Data2.enemyToPerfab.bullet_blue : configs.bullet;
                this.res = Laya.loader.getRes("prefab/" + this.nick + ".json");
                this.prefabType = PrefabType.bullletBoss;
                this.camp = 2;
                this.hitRadius = { w: 51 / 2, h: 52 / 2 };
                break;
            default:
                break;
        }
    }
    bconfigProperty(bId, prop?: string) {
        if (prop) {
            return this.bulletConfig[bId][prop];
        } else {
            return this.bulletConfig[bId];
        }
    }
}