import BulletCommon from "../role/BulletCommon"
import PlayingSceneControl from "./PlayingSceneControl"
import Data from "../Data/JsonEnum"
import tools from "../Tools/Tool"
import toast from "../manage/toast"
import PlayingVar from "../manage/Playing_var";
import role from "../role/role";
import nanGuaWangZi_bullet from "../Boss/nanGuaWangZi_bullet";//南瓜王子子弹
import maoWangHou_bullet from "../Boss/maoWangHou_bullet";//猫王后子弹
import daShuRen_bullet from "../Boss/daShuRen_bullet"//大树人子弹
import shitoujuren_bullet from "../Boss/shitoujuren_bullet";//石头巨人子弹
import bingqilinzuhe_bullet from "../Boss/bingqilinzuhe_bullet";//冰淇淋组合子弹
import bingtouxiang_bullet from "../Boss/bingtouxiang_bullet";//冰头像子弹
import jibaobao_bullet from "../Boss/jibaobao_bullet";//鸡宝宝子弹
import zhangyunvhuang_bullet from "../Boss/zhangyunvhuang_bullet";//章鱼女皇子弹
import MediumEnemy_bullet from "../MediumEnemy/MediumEnemy_bullet";//所有中级小怪子弹

export default class Bullet_boss extends Laya.Script {
    constructor() { super(); }
    private self: Laya.Sprite;
    private propertyObj: BulletCommon;
    private bossType: string;
    //boss4移动 向量
    private movePointVector: Laya.Point;
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.propertyObj = this.self["vars_"].propertyObj;
        this.bossType = this.propertyObj.fromNick;
        this.delta = 0;
        this.radius = 0;
        this.timeBaoZi_boss1 = Date.now();
        this.baoZiStatus = "shot";
        this.self.visible = true;
        if ((this.bossType === Data.enemyToPerfab.boss2 && this.propertyObj.bossBulletType === Data.bossBulletType.ion) || this.bossType === Data.enemyToPerfab.boss4) {
            const lastRolePos = { x: PlayingSceneControl.instance.roleObj.x + 60, y: PlayingSceneControl.instance.roleObj.y + 55 };
            this.movePointVector = new Laya.Point(this.self.x - lastRolePos.x, this.self.y - lastRolePos.y);
            this.movePointVector.normalize();
        } else if (this.bossType === Data.enemyToPerfab.boss3) {
            Laya.timer.once(4000, this, () => {
                this.self.visible && this.self.removeSelf() && (this.self.visible = false);
            }, null);
        } else if (this.bossType === Data.enemyToPerfab.boss5) {
            if (this.propertyObj.bossBulletType === Data.bossBulletType.common2 && !this.propertyObj["isBomb"]) {
                this.startTimeB2_boss5 = Date.now();
            }
            if (this.propertyObj.bossBulletType === Data.bossBulletType.common) {
                this.lastChangeType = "create";
                //子弹1
                this.lasChangeTime_boss5 = 0/*Date.now()*/;
                if (!this.propertyObj["circleDotObj"]) {
                    this.self.alpha = 0;
                    this.notCanCreateNext_boss5 = false;
                } else {
                    this.notCanCreateNext_boss5 = true;
                }
            }
        }

    }
    onUpdate() {
        if (PlayingSceneControl.instance.isGamePause) {
            return;
        }
        if (!this.self.visible) {
            return;
        }
        this.hitDetect();
        //是否出屏幕   boss3的普通子弹实时跟随role的暂不 出屏幕销毁
        if (this.bossType === Data.enemyToPerfab.boss4) {
            if (this.self.x < 0 || this.self.y > Laya.stage.height || this.self.x > (Laya.stage.width + this.propertyObj.hitRadius.w * 2) || this.self.y < (-this.propertyObj.hitRadius.h * 2)) {
                this.self.visible = false;
                this.self.removeSelf();
            }
            if (this.self.visible && this.self.y < 100) {
                this.self.visible = false;
                this.self.removeSelf();
            }
        } else if (this.bossType === Data.enemyToPerfab.boss2) {
            if (this.propertyObj.bossBulletType === Data.bossBulletType.skill) {
                if (this.self.x <= 0 || this.self.x >= (Laya.stage.width - 178)) {
                    this.propertyObj.directType = 180 - this.propertyObj.directType;
                }
                if (this.self.y > Laya.stage.height) {
                    this.self.visible = false;
                    this.self.removeSelf();
                }
            } else {
                if (this.self.x < 0 || this.self.y > Laya.stage.height || this.self.x > (Laya.stage.width + this.propertyObj.hitRadius.w * 2) || this.self.y < (-this.propertyObj.hitRadius.h * 2)) {
                    this.self.visible = false;
                    this.self.removeSelf();
                }

            }
        } else if (this.bossType === Data.enemyToPerfab.boss1 || this.bossType === Data.enemyToPerfab.boss3 || this.bossType === Data.enemyToPerfab.boss4) {
            if (this.self.x < -100 || this.self.x > Laya.stage.width || this.self.y > Laya.stage.height || this.self.y < -100) {
                this.self.visible = false;
                this.self.removeSelf();
            }
        } else if (this.bossType === Data.enemyToPerfab.boss5) {
            if (this.propertyObj["isBomb"]) {
                if (this.self.x < -100 || this.self.x > Laya.stage.width || this.self.y > Laya.stage.height || this.self.y < -100) {
                    this.self.visible = false;
                    this.self.removeSelf();
                }
            } else {
                if (this.propertyObj.bossBulletType === Data.bossBulletType.common) {
                } else if (this.self.y > (Laya.stage.height + 50)) {
                    this.self.visible = false;
                    this.self.removeSelf();
                }
            }

        } else {
            //其它boss通用出屏幕销毁
            if (this.self.x < -100 || this.self.x > Laya.stage.width || this.self.y > Laya.stage.height || this.self.y < -100) {
                this.self.visible = false;
                this.self.removeSelf();
            }
        }
    }
    /**
     * boss1的普通子弹移动
     */
    private delta = 0;
    private radius = 0;

    private timeBaoZi_boss1: number;
    private baoZiStatus: string;
    moveBoss1() {

        if (this.bossType === Data.enemyToPerfab.boss1) {
            const selfAngle = this.propertyObj.directType;
            const defaultSpeed = this.propertyObj.defaultSpeedY;
            if (this.propertyObj.bossBulletType === Data.bossBulletType.common) {
                var markSpeedXY = tools.speedLabelByAngle(selfAngle, defaultSpeed, 0.5);
            } else if (this.propertyObj.bossBulletType === Data.bossBulletType.display) {
                var markSpeedXY = tools.speedLabelByAngle(selfAngle, defaultSpeed, 0.5);
            } else if (this.propertyObj.bossBulletType === Data.bossBulletType.skill2) {
                var markSpeedXY = tools.speedLabelByAngle(selfAngle, defaultSpeed, 0.7);
            }
            else {
                var markSpeedXY = tools.speedLabelByAngle(selfAngle, defaultSpeed, 0.3);
            }
            this.self.x += markSpeedXY.x;
            this.self.y += markSpeedXY.y;
        }
    }
    calRealDelta(delta: number) {
        if (delta > 360) {
            return 360 - (delta - 360 * Math.floor(delta / 360));
        }
        return 360 - delta;
    }
    //龙卷风相关
    private markDirect: string;
    moveBoss2() {
        if (this.bossType == Data.enemyToPerfab.boss2) {
            if (this.propertyObj.bossBulletType === Data.bossBulletType.common) {
                //普通子弹
                const speedAngle = this.propertyObj.directType * (360 / 30);
                if (speedAngle % 90 === 0) {
                    switch (speedAngle) {
                        case 0:
                        case 360:
                            this.self.x += this.propertyObj.defaultSpeedY * 0.5;
                            break;
                        case 90:
                            this.self.y += this.propertyObj.defaultSpeedY * 0.5;
                            break;
                        case 180:
                            this.self.x -= this.propertyObj.defaultSpeedY * 0.5;
                            break;
                        case 270:
                            this.self.y -= this.propertyObj.defaultSpeedY * 0.5;
                            break;
                        default:
                            console.error("are you kidding me?");
                            break;
                    }
                } else {
                    const speedXY = tools.speedXYByAngle(speedAngle, this.propertyObj.defaultSpeedY);

                    if (speedAngle > 0 && speedAngle < 180) {
                        this.self.y += Math.abs(speedXY.y) * 0.5;
                    } else if (speedAngle > 180 && speedAngle < 360) {
                        this.self.y -= Math.abs(speedXY.y) * 0.5;
                    }
                    if (speedAngle > 90 && speedAngle < 270) {
                        this.self.x -= Math.abs(speedXY.x) * 0.5;
                    } else {
                        this.self.x += Math.abs(speedXY.x) * 0.5;
                    }
                }

            } else if (this.propertyObj.bossBulletType === Data.bossBulletType.ion) {
                //离子炮
                if (this.self.y >= (Laya.stage.height / 3)) {
                    this.self.x -= this.propertyObj.defaultSpeedY * this.movePointVector.x * 0.5 * 0.5;
                    this.self.y -= this.propertyObj.defaultSpeedY * this.movePointVector.y * 0.5 * 0.5;
                } else {
                    this.self.x -= this.propertyObj.defaultSpeedY * this.movePointVector.x * 0.5;
                    this.self.y -= this.propertyObj.defaultSpeedY * this.movePointVector.y * 0.5;
                }
            } else {
                //龙卷风
                if (this.propertyObj.directType !== 90) {
                    const speedX: number = tools.speedByAngle(this.propertyObj.directType, { y: this.propertyObj.defaultSpeedY }).x;
                    this.self.x += speedX * 0.3;
                }
                this.self.y += this.propertyObj.defaultSpeedY * 0.3;
            }
        }
    }
    moveBoss3() {
        if (this.bossType === Data.enemyToPerfab.boss3) {
            const selfAngle = this.propertyObj.directType;
            const defaultSpeed = this.propertyObj.defaultSpeedY;
            const markSpeedXY = tools.speedLabelByAngle(selfAngle, defaultSpeed, 0.3);
            this.self.x += markSpeedXY.x;
            this.self.y += markSpeedXY.y;
            // if (this.propertyObj.bossBulletType === Data.bossBulletType.common) {
            //     //跟随玩家  玩家可以打掉
            //     const markPoint = new Laya.Point(this.self.x - PlayingSceneControl.instance.roleObj.x, this.self.y - PlayingSceneControl.instance.roleObj.y);
            //     markPoint.normalize();
            //     this.self.x -= this.propertyObj.defaultSpeedY * markPoint.x;
            //     this.self.y -= this.propertyObj.defaultSpeedY * markPoint.y;
            // }
        }
    }
    /**
     * 左右手冰怪移动
     */
    moveBoss4() {
        if (this.bossType == Data.enemyToPerfab.boss4) {
            if (this.propertyObj.bossBulletType === Data.bossBulletType.common) {
                // this.self.x -= this.propertyObj.defaultSpeedY * this.movePointVector.x;
                this.self.y += this.propertyObj.defaultSpeedY * 0.6;
            } else if (this.propertyObj.bossBulletType === Data.bossBulletType.common2) {
                const defaultSpeed = this.propertyObj.defaultSpeedY;
                let direct: number = this.propertyObj.directType;
                // if (direct + 0.5 >= 360) {
                //     direct = (direct + 0.5) - 360;
                // } else {
                //     direct += 0.5;
                // }
                this.self.rotation = direct - 90;
                const markSpeedXY = tools.speedLabelByAngle(direct, defaultSpeed, 0.5);
                this.self.x += markSpeedXY.x;
                this.self.y += markSpeedXY.y;
                // this.propertyObj.directType = direct;
            } else if (this.propertyObj.bossBulletType === Data.bossBulletType.skill2) {
                const selfAngle = this.propertyObj.directType;
                const defaultSpeed = this.propertyObj.defaultSpeedY;
                const markSpeedXY = tools.speedLabelByAngle(selfAngle, defaultSpeed, 0.3);
                this.self.x += markSpeedXY.x;
                this.self.y += markSpeedXY.y;
            } else {
                const rolePos: any = this.propertyObj.directType;
                this.self.x -= rolePos.x;
                this.self.y -= rolePos.y;
            }
        }
    }
    /**
     * 喷火怪
     */
    private lasChangeTime_boss5: number;    //上次的boss5子弹1 的改变时间点
    private lastChangeType: string;         //scale  ||   create
    private notCanCreateNext_boss5: boolean;    //自身是否还能创建下一个子弹
    private startTimeB2_boss5: number;  //boss5 子弹2 的孢子形态的开始时间点
    moveBoss5(): void {
        if (this.bossType == Data.enemyToPerfab.boss5) {
            switch (this.propertyObj.bossBulletType) {
                case Data.bossBulletType.common:
                    // this.self.y += this.propertyObj.defaultSpeedY * 0.2;
                    let angle = this.propertyObj.directType
                    const r = 60 || this.propertyObj["ridus"];
                    const circleDotObj = this.propertyObj["circleDotObj"] || { x: Laya.stage.width / 6, y: 388 };
                    if (this.propertyObj["nowStep"] === 1) {
                        //散开的子弹
                        const speedXy = tools.speedLabelByAngle(angle, this.propertyObj.defaultSpeedY, 0.1);
                        this.self.y += speedXy.y;
                        this.self.x += speedXy.x;
                        if (Math.abs(this.self.x - circleDotObj.x) >= r || Math.abs(this.self.y - circleDotObj.y) >= r) {
                            this.propertyObj["canCreateChild"] = true;
                            // switch (angle) {
                            //     case 0:
                            //         this.self.x = circleDotObj.x + r;

                            //         break;
                            //     case 90:
                            //         this.self.y = circleDotObj.y + r;
                            //         break;
                            //     case 180:
                            //         this.self.x = circleDotObj.x - r;
                            //         break;
                            //     case 270:
                            //         this.self.y = circleDotObj.y - r;
                            //         break;
                            //     default:
                            //         break;
                            // }
                            this.propertyObj["ridus"] = Math.abs(this.self.y - circleDotObj.y) || Math.abs(this.self.x - circleDotObj.x)
                            this.propertyObj["nowStep"] = 2;
                        }

                    } else if (this.propertyObj["nowStep"] === 2) {
                        // return;
                        if (--angle) {
                            if (angle < 0) {
                                angle += 360;
                            }
                        }
                        this.propertyObj.directType = angle;

                        const nowSelfPos = tools.getRoundPos(this.propertyObj.directType, this.propertyObj["ridus"], circleDotObj);
                        this.self.x = nowSelfPos.x;
                        this.self.y = nowSelfPos.y;

                        if (this.propertyObj["canCreateChild"] && this.propertyObj["createIndex"] < 6 && (++this.lasChangeTime_boss5) % 10 === 0) {
                            this.lasChangeTime_boss5 = 0;
                            this.propertyObj["canCreateChild"] = false;
                            this.propertyObj["createIndex"]++;
                            const markFunc = this.propertyObj["createOneBullet1_boss5"];
                            let nextAngle = this.propertyObj.directType + 20;
                            if (nextAngle > 360) {
                                nextAngle = nextAngle - 360;
                            }
                            const createPos = tools.getRoundPos(nextAngle, this.propertyObj["ridus"], circleDotObj);
                            markFunc && markFunc.call(this.propertyObj["functionThis"], createPos, circleDotObj, nextAngle, this.propertyObj["createIndex"], this.self.parent);
                        }
                    }
                    break;
                    if (Date.now() - this.lasChangeTime_boss5 >= 0.02 * 1000) {
                        this.lasChangeTime_boss5 = Date.now();

                        if (this.propertyObj["circleDotObj"]) {
                            if (this.lastChangeType === "create") {
                                this.self.scale(this.self.scaleX * 0.8, this.self.scaleY * 0.8);
                                this.lastChangeType = "scale";
                                if (this.self.scaleX <= Math.pow(0.8, 5)) {
                                    this.self.visible = false;
                                    this.self.removeSelf();
                                }
                            } else {
                                this.lastChangeType = "create";
                                if (this.notCanCreateNext_boss5) {
                                    this.notCanCreateNext_boss5 = false;

                                    const markFunc = this.propertyObj["createOneBullet1_boss5"];
                                    const centerPos = this.propertyObj["circleDotObj"];
                                    //调用createOneBullet1_boss5
                                    let nextAngle = this.propertyObj.directType - 6;
                                    if (nextAngle < 0) {
                                        this.propertyObj.directType = 360 + nextAngle;
                                    }
                                    const nextPos = tools.getRoundPos(this.propertyObj.directType, 50/**103.944**/, centerPos);
                                    markFunc && markFunc.call(this.propertyObj["functionThis"], nextPos.x, nextPos.y, centerPos, nextAngle);
                                }

                            }
                        }
                    }
                    break;
                case Data.bossBulletType.common2:
                    if (this.self.scaleX != 1 || this.self.scaleY != 1) {
                        console.error("得到放大倍数X:", this.self.scaleX, "得到放大倍数Y:", this.self.scaleY);
                    }
                    if (this.propertyObj["isBomb"]) {
                        const angle = this.propertyObj.directType
                        //散开的子弹
                        const speedXy = tools.speedLabelByAngle(angle, this.propertyObj.defaultSpeedY, 0.3);
                        this.self.x += speedXy.x;
                        this.self.y += speedXy.y;
                    } else {
                        //还未散开
                        this.self.y += this.propertyObj.defaultSpeedY * 0.3;
                        if (Date.now() - this.startTimeB2_boss5 >= 1500) {
                            const markFunc = this.propertyObj["createSpreadB_boss5"];
                            markFunc && markFunc.call(this.propertyObj["functionThis"], this.self.x, this.self.y);
                            this.self.removeSelf();
                        }
                    }
                    break;
                case Data.bossBulletType.skill:
                    this.self.y += (this.propertyObj.defaultSpeedY * 0.8);
                    console.log("技能1的y坐标-----", this.self.y, "技能1的x坐标-----", this.self.x);
                    break;
                case Data.bossBulletType.skill2:
                    const speedXY = this.propertyObj.directType
                    this.self.x += speedXY["x"];
                    this.self.y += speedXY["y"];
                    speedXY["y"] += 0.5;
                    console.log("技能2的y坐标-----", this.self.y);

                    break;
                default:
                    break;
            }
        }
    }
    /**
     * hitAndRole
     * 检测和主角的碰撞
     */
    hitDetect() {
        if (PlayingVar.getInstance().gameStatus !== "playing") {
            return;
        }
        const roleX = PlayingSceneControl.instance.roleObj.x + 60;
        const roleY = PlayingSceneControl.instance.roleObj.y + 55;
        //和role的碰撞
        if (/*this.bossType !== Data.enemyToPerfab.boss5 && */this.self.visible && Math.abs(roleX - this.self.x - this.propertyObj.hitRadius.w) < (this.propertyObj.hitRadius.w + 60) && Math.abs(roleY - this.self.y - this.propertyObj.hitRadius.h) < (this.propertyObj.hitRadius.h + 55)) {
            if (this.bossType === Data.enemyToPerfab.boss3 && this.propertyObj.bossBulletType === Data.bossBulletType.skill) {
                //玩家将会被控制1s
                // toast.noBindScript("已被控制~!");
                // PlayingSceneControl.instance.setRoleControled();
                if (this.propertyObj["setBossFollowVar"]) {
                    this.propertyObj["setBossFollowVar"].call(this.propertyObj["functionThis"]);
                }
            } else {
                if (!role.instance.noHurt) {
                    role.instance.setRoleHp(this.propertyObj.hurtValue, "子弹");

                    // let nowHp = PlayingSceneControl.instance.roleHp - this.propertyObj.hurtValue;
                    // if (nowHp <= 0) {
                    //     nowHp = 0;
                    //     role.instance.setRoleDead();
                    // }
                    // //现在子弹打到role不无敌
                    // // else {
                    // //     role.instance.startRoleNoHurt();
                    // // }
                    // PlayingSceneControl.instance.roleHp = nowHp;
                    // const mark_graphics = PlayingSceneControl.instance.hpBar.mask.graphics;
                    // mark_graphics.clear();
                    // const markWidth = 49 + (213 / PlayingSceneControl.instance.roleTotal) * nowHp;
                    // mark_graphics.drawRect(0, 0, markWidth, 44, "#ff0000");
                    // PlayingSceneControl.instance.delayHpBar2(markWidth);
                }
            }
            this.self.visible = false;
            this.self.removeSelf();
        } else {
            if (this.self.visible) {
                this.moveBoss1();
                this.moveBoss2();
                this.moveBoss3();
                this.moveBoss4();
                this.moveBoss5();
                if (this.propertyObj.isWFboss) {
                    this.bossSet();
                }
                if (this.bossType === Data.enemyToPerfab.boss3 || this.bossType === Data.enemyToPerfab.boss4) {
                    this.hitDetect_mainBullet();
                }
            }
        }
    }

    // 其余boss综合测试
    bossSet(): void {
        let fromNick = this.owner['vars_'].propertyObj.fromNick;
        switch (fromNick) {
            case "nanguawangzi":
                this.owner["nanGuaWangZi_bullet"].nanGuaWangZi_Move();
                break;
            case "maoWangHou":
                this.owner["maoWangHou_bullet"].maoWangHou_Move();
                break;
            case "dashuren":
                this.owner["daShuRen_bullet"].daShuRen_Move();
                break;
            case "shitoujuren":
                this.owner["shitoujuren_bullet"].shiTouJuRen_Move();
                break;
            case "bingqilinzuhe":
                this.owner["bingqilinzuhe_bullet"].bingQiLinZuHe_Move();
                break;
            case "bingtouxiang":
                this.owner["bingtouxiang_bullet"].bingTouXiang_Move();
                break;
            case "jibaobao":
                this.owner["jibaobao_bullet"].jibaobao_Move();
                break;
            case "zhangyunvhuang":
                this.owner["zhangyunvhuang_bullet"].zhangyunvhuang_Move();
                break;
            case "MediumEnemy_Move":
                this.owner["MediumEnemy_bullet"].bullet_Move();
                break;
            default:
                break;
        }
    }
    /**
     * 检测和主武器子弹的碰撞
     */
    hitDetect_mainBullet() {
        //return;
        const bulletParent: Laya.Sprite = PlayingSceneControl.instance.bulletParent;
        const bulletArray = PlayingSceneControl.instance.bulletParent._children;
        let i: number = 0;
        //和主武器（副武器稍后  因为每个副武器的判断半径都不一样）
        for (i; i < bulletArray.length; i++) {
            const bullet: Laya.Sprite = bulletArray[i];
            const bulletX = bullet.x + 14.5;
            const bulletY = bullet.y + 50;
            if (bullet.visible && Math.abs(bulletX - this.self.x - this.propertyObj.hitRadius.w) < (this.propertyObj.hitRadius.w + 14.5) && Math.abs(bulletY - this.self.y - this.propertyObj.hitRadius.h) < (this.propertyObj.hitRadius.h + 50)) {
                this.self.removeSelf();
                bullet.removeSelf();
                break;
            }
        }

    }
    onDisable(): void {
        Laya.timer.clearAll(this);
        this.self.visible = false;
        this.markDirect = null;
        this.self.scale(1, 1);
        if (this.bossType === Data.enemyToPerfab.boss2 && this.propertyObj.bossBulletType !== Data.bossBulletType.common) {
            // let recoverName = this.propertyObj.bossBulletType === Data.bossBulletType.skill ? "xuanfeng" : "boss2_pao";
            // Laya.Pool.recover(recoverName, this.self.removeChildAt(this.self.numChildren - 1));
        }
        if (this.bossType === Data.enemyToPerfab.boss1) {
            if (this.propertyObj.bossBulletType === Data.bossBulletType.skill) {
                Laya.Pool.recover("zd", this.self.removeChildAt(this.self.numChildren - 1));
            } else if (this.propertyObj.bossBulletType === Data.bossBulletType.common2) {
                Laya.Pool.recover("boss2_pao", this.self.removeChildAt(this.self.numChildren - 1));
            }
            this.backSelfImagAndRotation();
        }
        if (this.bossType === Data.enemyToPerfab.boss4) {
            if (this.propertyObj.bossBulletType === Data.bossBulletType.skill) {

                Laya.Pool.recover("bingzhui", this.self.removeChildByName("sk"));
            }
            this.backSelfImagAndRotation();
        }
        // if (this.bossType === Data.enemyToPerfab.boss4 || this.bossType === Data.enemyToPerfab.boss5) {
        //     this.backSelfImagAndRotation();
        // }
        if (this.bossType === Data.enemyToPerfab.boss5) {
            if (this.propertyObj.bossBulletType === Data.bossBulletType.skill || this.propertyObj.bossBulletType === Data.bossBulletType.skill2) {
                Laya.Pool.recover("boss5texiao", this.self.removeChildAt(this.self.numChildren - 1));
                this.backSelfImagAndRotation();
            } else {
                this.self.alpha = 1;
                this.notCanCreateNext_boss5 = null;
                //清理部分变量
                let circleDotObj = this.self["vars_"].propertyObj["circleDotObj"];
                circleDotObj && (this.self["vars_"].propertyObj["circleDotObj"] = null);
                let markFunc = this.self["vars_"].propertyObj["createOneBullet1_boss5"];
                markFunc && (this.self["vars_"].propertyObj["createOneBullet1_boss5"] = null);
                let markThat = this.self["vars_"].propertyObj["functionThis"];
                markThat && (this.self["vars_"].propertyObj["functionThis"] = null);
                let isBomb = this.self["vars_"].propertyObj["isBomb"];
                isBomb && (this.self["vars_"].propertyObj["isBomb"] = null);

                let canCreateChild = this.self["vars_"].propertyObj["canCreateChild"];
                canCreateChild && (this.self["vars_"].propertyObj["canCreateChild"] = null);
                let createIndex = this.self["vars_"].propertyObj["createIndex"];
                createIndex && (this.self["vars_"].propertyObj["createIndex"] = null);
            }
        }
        if (this.bossType === Data.enemyToPerfab.boss3) {
            this.backSelfImagAndRotation();
        }
        this.backSelfImagAndRotation();
        Laya.Pool.recover(this.propertyObj.nick, this.self);
        // if (PlayingVar.getInstance().gameStatus === "playing") {
        //     Laya.Pool.recover(this.propertyObj.nick, this.self);
        // } else {
        //     Laya.timer.frameOnce(5, this, () => {
        //         this.self.destroy();
        //     });

        // }
    }
    /**
     * 还原img 和 rotation
     */
    backSelfImagAndRotation() {
        this.self.rotation = 0;
        const img = (this.self.getChildByName("img") as Laya.Image);
        img.skin = "face/BOSS子弹_01.png";
        img.visible = true;
    }
    onDestroy() {
        debugger;
    }
    
}
