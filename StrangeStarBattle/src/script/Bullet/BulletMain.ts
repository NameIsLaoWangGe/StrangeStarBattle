import BulletParent from "../Bullet/BulletParent"
import MainWeaponData from "../manage/MainWeaponData";
import PlayingControl from "../playing/PlayingSceneControl"
import Bullet from "./BulletInterface";
import tools from "../Tools/Tool"
import BulletType = Bullet.BulletType;
import LYPrefab = Laya.Prefab
import SecondWeaponData from "../manage/SecondWeaponData";
import Buffer from "../role/Buff";
import SkeletonTempletManage from "../manage/SkeletonTempletManage";
export default class BulletMain extends BulletParent {
    private playingControlObj: PlayingControl;
    public bulletObj: any;
    //如果是boss子弹得话是否可被打掉
    public canHit: boolean;
    public buffValue: number;
    public secondType: number;
    //吃到buff4 才有的属性
    public markX: number;
    public markY: number;
    private readonly buffObj: Buffer;
    constructor(type: BulletType, pos: any, pic?: string, angle?: number, buff?: Buffer, fireBuffType?: number) {
        super();
        this.bType = type;
        this.startPos = pos;
        this.angle = angle || 270;
        if (pic) {
            this.pic = pic + ".png";
        }
        if (buff) {
            this.buffObj = buff;
        }
        if (fireBuffType !== (void 0)) {
            this.fireBuffType = fireBuffType;
        }
        this.playingControlObj = PlayingControl.instance;
        this.initVar();
        this.createPrefab();
    };
    createPrefab() {
        let prefabObj: LYPrefab;
        switch (this.bType) {
            case BulletType.roleMainBullet:
                prefabObj = this.playingControlObj.bullet_red;
                this.prefabName = "bullet_red";
                if (!this.angle) {
                    this.angle = 270;
                }
                this.w = 29;
                this.h = 100;
                break;
            case BulletType.roleSecondBullet:
                this.prefabName = SecondWeaponData.getInstance().bulletPrefab;
                if (this.secondType !== 3 && this.secondType !== 4/* && this.secondType !== 5*/) {
                    this.bulletObj = SkeletonTempletManage.getInstance().createSkByTemplet(this.prefabName);
                    this.w = 50;
                    this.h = 50;
                    if (this.secondType === 5) {
                        this.startPos.x += 60;
                    }
                    this.bulletObj.pos(this.startPos.x, this.startPos.y);
                    this.bulletObj["property"] = this;
                    // this.bulletObj.visible = true;
                    if (this.secondType === 4) {
                        this.bulletObj.play("jgp", true);

                    } else if (this.secondType === 5) {
                        this.bulletObj.play("pp", true);
                        this.bulletObj.scale(0.5, 0.5);
                    }else if(this.secondType===10){
                        this.bulletObj.play("mgp", true);
                    } else {
                        this.bulletObj.play(0, true);
                    }
                    this.setBulletOrder();
                    PlayingControl.instance.bulletParent.addChild(this.bulletObj);
                    return;
                }
                if (!this.angle) {
                    this.angle = 270;
                }
                prefabObj = Laya.loader.getRes("prefab/" + this.prefabName + ".json");
                if (this.prefabName === "Bullet_skill3") {
                    this.w = 57;
                    this.h = 234;
                    this.offsetY = -220;
                } else if (this.prefabName == "Bullet_skill4") {
                    this.w = 57;
                    this.h = 1081;
                }
                // else if (this.prefabName === "Bullet_skill5") {
                //     this.w = 257;
                //     this.h = 220;
                // }
                break;
            case BulletType.bossBullet:
                break;
            default:
                break;
        }
        this.bulletObj = Laya.Pool.getItemByCreateFun(this.prefabName, prefabObj.create, prefabObj);
        if (this.pic) {
            const imgObj = (this.bulletObj.getChildByName("img_pic") as Laya.Image);
            imgObj.skin = this.path + this.pic;
            this.w = imgObj.width;
            this.h = imgObj.height;
        }
        this.bulletObj.pos(this.startPos.x, this.startPos.y);
        this.bulletObj["property"] = this;
        this.bulletObj.visible = true;
        this.setBulletOrder();
        PlayingControl.instance.bulletParent.addChild(this.bulletObj);
    }
    initVar() {
        let markSpeed: number;
        if (this.bType === BulletType.roleMainBullet) {
            markSpeed = MainWeaponData.getInstance().bulletSpeed;
            if (this.buffObj) {
                this.buffValue = this.buffObj.buffValue;
                this.BuffType = this.buffObj.type;
            }
            if (this.BuffType === 3) {
                //火力子弹的伤害
                const defaultHurt = Number(MainWeaponData.getInstance().getShowFire());
                const hurtArr: Array<string> = this.buffObj.buffValue.split("#")
                this.hurtValue = defaultHurt * Number(hurtArr[this.fireBuffType]);
            } else {
                this.hurtValue = Number(MainWeaponData.getInstance().getShowFire());

            }
        } else if (this.bType === BulletType.roleSecondBullet) {
            const configProperty = SecondWeaponData.getInstance().buffType;
            markSpeed = SecondWeaponData.getInstance().getbulletSpeed();
            this.hurtValue = Number(SecondWeaponData.getInstance().getFire());
            this.secondType = Number(configProperty[0]);
            const affectArr = [1, 3, 5, 6, 10];
            if (affectArr.indexOf(this.secondType) > -1) {
                const powerLevel = SecondWeaponData.getInstance().getItemPowerLevel();
                const configArrLength = configProperty.length;
                this.affectBate = Number(configProperty[configArrLength - 2]) + powerLevel * Number(configProperty[configArrLength - 1]);
            }
            this.initKeepTime(this.secondType, configProperty);
            if (this.secondType === 8) {
                //黑洞开始无法触发检测
                this.canHitCollision = false;
            }
        } else {
            //boss

        }
        if (this.BuffType === 3 && this.fireBuffType === 2) {
            this.bulletSpeed = tools.speedLabelByAngle(270, markSpeed);
        } else if (this.angle) {
            this.bulletSpeed = tools.speedLabelByAngle(this.angle, markSpeed);
        }
    }
    setBuff(markxy?: any) {
        if (markxy) {
            this.markX = markxy.x;
            this.markY = markxy.y;
        }
    }
    /**
     * 
     * @param type 
     * @param configArr 
     * 持续性副武器的持续时间
     */
    initKeepTime(type: number, configArr: Array<string>) {
        const powerLevel = SecondWeaponData.getInstance().getItemPowerLevel();
        switch (type) {
            case 3:
                this.keepTimeValue = Number(configArr[2]) + powerLevel * Number(configArr[3]);
                break;
            case 5:
            case 6:
            case 8:
            case 9:
            case 10:
                this.keepTimeValue = Number(configArr[1]) + powerLevel * Number(configArr[2]);
            default:
                break;
        }
    }
    /**
     * 设置不同类型的子弹的图层
     */
    setBulletOrder() {
        switch (this.bType) {
            case BulletType.roleMainBullet:
                if (this.fireBuffType !== (void 0)) {
                    if (this.fireBuffType === 0) {
                        this.bulletObj.zOrder = 2;
                    } else if (this.fireBuffType === 1) {
                        this.bulletObj.zOrder = 4;
                    } else if (this.fireBuffType === 0) {
                        this.bulletObj.zOrder === 0;
                    }
                } else {
                    this.bulletObj.zOrder = 3;
                }
                break;
            case BulletType.roleSecondBullet:
                this.bulletObj.zOrder = 1;
                break;
            default:
                this.bulletObj.zOrder = 0;
                break;
        }
    }
}