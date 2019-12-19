import Tools, { tools } from "../Tools/Tool";
import PlayingVar from "../manage/Playing_var"
import Buff from "../role/Buff"
import PlayingControl from "../playing/PlayingSceneControl"
import toast from "../manage/toast"
import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import BattleParse from "../playing/BattleParse"
import Bullet_second from "../role/Bullet_second"
import EnemyObject from "../role/EnemyObject"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import DataType = Data2.DataType;
import secondSkill = Data2.secondSkill;
import DropHpStatus = Data2.dropHpStatus;
import FixedDataTables = Data.FixedDataTables;
import random = Tools.random;
import rectangleCollisions = Tools.rectangleCollisions;
import SecondWeaponData from "../manage/SecondWeaponData";
import BulletMain from "../Bullet/BulletMain";
import role from "../role/role";
import LYpoint = Laya.Point;
import LYTween = Laya.Tween;
import LYSkeleton = Laya.Skeleton;
import { Bullet } from "../Bullet/BulletInterface";
import BulletType = Bullet.BulletType;
import OpenWx from "../manage/OpenWx";
import SkeletonTempletManage from "../manage/SkeletonTempletManage";
import BaoZha from "../role/BaoZha";
import EndlessManage from "../manage/EndlessManage";
import EndlessParseSkill from "../manage/EndlessParseSkill";

export default class Enemy extends Laya.Script {
    public propertyObj: EnemyObject;
    constructor() {
        super();
    }
    private childLabel: Laya.Label;
    private self: any;
    // private selfRigidBody: Laya.RigidBody;
    private defaultSpeedY: number;
    //方向
    public _steering: string;
    //初始x上的速度
    private _speedX: number = 6;

    // private attacked: AttackedStatus;
    //是否是被普攻状态
    private stopped: boolean;
    //是否是被副武器攻击状态
    private secondAttacked: boolean;
    private attackedTime: number;
    private readonly attackedStopInterval: number = 50;
    //副武器效果的持续时间
    private secondWeaponInterval: number;
    private secondType: number;
    private markSk: LYSkeleton;
    //现在怪物一开始刚刚创建是无敌
    private wuDiStartTime: number;
    private readonly wuDiInterval: number = 750;
    private gameMode: string;   //游戏模式
    onEnable(): void {
        this.markHpArr = 0;
        this.self = this.owner;
        this.self["markScript"] = this;
        this.propertyObj = this.self["vars_"].propertyObj;
        this.wuDiStartTime = Date.now();
        this.propertyObj.setHpBarShowStatus(false);
        this.defaultSpeedY = this.propertyObj.defaultSpeedY;
        this.markSk = this.propertyObj.enmeySprite.getChildByName("EnemySK") as LYSkeleton;
        this.markSk && this.markSk.playbackRate(1);
        // this.selfRigidBody = self.getComponent(Laya.RigidBody) as Laya.RigidBody;
        //this.imgPic = self.getChildByName("imgPic") as Laya.Image || null;
        this.childLabel = this.self.getChildAt(0) as Laya.Label;
        this.childLabel.text = this.propertyObj.hp.toString();
        if (this.propertyObj.e_type !== 2) {
            if (Tools.random(0, 1) === 0) {
                this._steering = "left";
            } else {
                this._steering = "right";
            }
            // this.propertyObj.way && this.initSpecialMove();
        } else {
            Laya.timer.frameOnce(2, this, () => {
                this.propertyObj.playAction(Data2.bossDragonAction.stand);
            });
        }
        this.self.pos(random(0, Laya.stage.width - this.propertyObj.mark_w - 5), random(-30 - this.propertyObj.mark_h, -5 - this.propertyObj.mark_h));
        this.stopped = false;
        this.secondAttacked = false;
        this.self.visible = true;

        this.secondType = Number(SecondWeaponData.getInstance().buffType[0]);
        this.effectObj = null;
        //无尽模式技能相关
        this.gameMode = PlayingVar.getInstance().gameModel;
        this.palsyStatus = null;
        this.slowDownStatus = null;
        this.isRollBack_endless = null;
        this.isTriggerDropHp = null;
        this.isImmunityTui_endless = null;
        this.isRollBack_endless = null;
    }
    onUpdate() {
        if (PlayingControl.instance.isGamePause) {
            return;
        }
        if (!this.self.visible) {
            return;
        }
        if (this.propertyObj.dropHpStatus === DropHpStatus.second8) {
            return;
        }
        this.setMove();
        this.setColliteWall();
        this.checkCollisionRole();
        if (!this.self.visible) {
            return;
        }
        if (this.propertyObj.dropHpStatus === DropHpStatus.born) {
            this.judgeWudiStatus();
        } else {
            this.checkCollisionBullet();
        }
        this.setKeepDropHp();
        this.keepDropHp_endless();
        this.palsy_endless();
        this.slowDown_endless();
    }
    judgeWudiStatus() {
        if (Date.now() - this.wuDiStartTime >= this.wuDiInterval) {
            this.propertyObj.dropHpStatus = DropHpStatus.ordinary;
            this.propertyObj.setHpBarShowStatus(true);
        }
    }
    /**
     * 非boss碰到墙反向
     */
    setColliteWall() {
        if (this.propertyObj.e_type !== 2 && !this.propertyObj.way) {
            //不超过边缘
            if (this.self.x >= (Laya.stage.width - this.propertyObj.mark_w)) {
                this._steering = 'left';
            } else if (this.self.x < 0) {
                this._steering = 'right';
            }
        }
        //漂浮技能
        // if (this.self["vars_"].skillType && this.self["vars_"].skillType === secondSkill.flottant) {
        //     if (this.self.y < 0) {
        //         this.self.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: 0 });
        //         return;
        //     }
        // }
        if (this.self.y >= (Laya.stage.height + this.propertyObj.mark_h + 10)) {
            //到底部后再次回到屏幕的上方
            if (this.gameMode === "endless") {
                this.self.removeSelf();
            } else {
                this.self.pos(random(0, Laya.stage.width - this.propertyObj.mark_w - 5), random(-30 - this.propertyObj.mark_h, -5 - this.propertyObj.mark_h));
                this.initSpecialMove();
            }

        }
    }
    /**
     * 检测碰撞
     */
    checkCollisionRole() {
        if (!this.self.visible) {
            return;
        }
        const role_w = PlayingControl.instance.role_w;
        const role_h = PlayingControl.instance.role_h;

        const para = { x: this.self.x, y: this.self.y, w: this.propertyObj.mark_w, h: this.propertyObj.mark_h };
        const mainPlane = PlayingControl.instance.mainPlane;
        const mainPlanePoint = new LYpoint(mainPlane.x - role_w / 2, mainPlane.y - role_w / 2);
        mainPlane.localToGlobal(mainPlanePoint);

        const roleRect = { x: mainPlanePoint.x, y: mainPlanePoint.y, w: role_w, h: role_h };
        //role和enemy
        const isCollision = rectangleCollisions(para, roleRect);
        if (isCollision) {
            this.setDeadEffect();
            role.instance.setRoleHp(this.propertyObj.hurtValue, "敌人");
            //无尽计算分数
            EndlessManage.getInstance().getScore(this.propertyObj.e_type, this.propertyObj.enemyLevel);
            this.self.removeSelf();
        }
    }
    /**
     * 检测碰撞子弹
     */
    checkCollisionBullet() {
        if (!this.self.visible || this.propertyObj.dropHpStatus === DropHpStatus.second8) {
            return;
        }
        //子弹和enemey
        const para = { x: this.self.x, y: this.self.y, w: this.propertyObj.mark_w, h: this.propertyObj.mark_h };
        const bullets: Array<Laya.Sprite> = PlayingControl.instance.bulletParent._children;
        let i: number = 0;
        for (i; i < bullets.length; i++) {
            const oneBullet: Laya.Sprite = bullets[i];
            if (!oneBullet.visible) {
                continue;
            }
            const propertyObj = oneBullet["property"] as BulletMain;
            if (!propertyObj.canHitCollision) {
                continue;
            }
            const bulletRect = { x: oneBullet.x, y: oneBullet.y, w: propertyObj.w, h: propertyObj.h };
            const isCollision = rectangleCollisions(para, bulletRect);
            if (isCollision) {
                if (propertyObj.secondType === 8) {
                    this.propertyObj.dropHpStatus = DropHpStatus.second8;
                    this.setDropInEddy(oneBullet);
                    return;
                }
                i--;
                // if (propertyObj.bType === BulletType.roleMainBullet) {
                //     console.error("主武器的子弹的伤害为:", propertyObj.hurtValue);
                // }
                const startHurt = propertyObj.hurtValue;

                // const hurtValue_enhance = this.enhanceFire(startHurt);
                // const hurtValue_endless = this.spike_endless(hurtValue_enhance);
                const hurtValue_endless = this.changeHurtBySkillInEndless(startHurt);
                this.setEnemyHp(hurtValue_endless, propertyObj.buffValue, oneBullet);
                this.initDropHp_endless();
                this.intiPalsy_endless();
                oneBullet.removeSelf();
                this.initRollBack_endless();
                this.bombFire_endless(startHurt);
                this.initSlowDown_endless();
            }
        }
    }

    setEnemyHp(value: number, buffValue: number, oneBullet: Laya.Sprite) {
        if (!this.self.visible) {
            return;
        }
        if (this.propertyObj.hp - value <= 0) {
            this.setDeadEffect();
            PlayingControl.instance.setScreenShake();
            this.setGetBuff(buffValue);
            //无尽计算分数
            EndlessManage.getInstance().getScore(this.propertyObj.e_type, this.propertyObj.enemyLevel);
            this.self.removeSelf();
            this.vampire_endless();
        } else {
            this.propertyObj.hp = this.propertyObj.hp - value;
            this.propertyObj.changeHpProgress();
            oneBullet && this.setHurtEffect();
            oneBullet && this.setAttackedStatus(oneBullet);
        }
        oneBullet && this.initSecondSeven(oneBullet);
    }

    private isTriggerDropHp: boolean;
    private dropHpStartTime: number;
    private lastDropHpTime: number;
    private dropHpKeepTime: number;   //掉血持续的时间
    private dropHpInterval: number; //每次掉血的时间的间隔
    private dropHpValue: number;    //每次掉血的值
    /**
     * 持续掉血的skill (无尽模式技能9)
     */
    keepDropHp_endless() {
        if (PlayingVar.getInstance().gameModel === "endless") {
            if (this.isTriggerDropHp) {
                if (Date.now() - this.dropHpStartTime >= this.dropHpKeepTime) {
                    this.isTriggerDropHp = false;
                } else {
                    if (Date.now() - this.lastDropHpTime >= this.dropHpInterval) {
                        this.lastDropHpTime = Date.now();
                        this.keepDropHpPlayEffect();
                        this.setEnemyHp(this.dropHpValue, null, null);
                    }
                }
            }
        }
    }
    keepDropHpPlayEffect() {
        const effectName = EndlessParseSkill.getInstance().getEffectNameById(9);
        this.self.getChildByName(effectName).play("hit", false);
        this.self.getChildByName(effectName).visible = true;
    }
    initDropHp_endless() {
        if (!this.self.visible) {
            return;
        }
        const skillInstance = EndlessParseSkill.getInstance();
        if (PlayingVar.getInstance().gameModel === "endless" && skillInstance.isUpgraded(9) && !this.isTriggerDropHp) {
            this.isTriggerDropHp = true;
            this.dropHpStartTime = Date.now();
            this.lastDropHpTime = Date.now();
            const arg: string = this.propertyObj.e_type === 2 ? "boss" : "smallEnemy";
            const hurtArr = skillInstance.getSkillNum(9, arg);
            this.dropHpKeepTime = 1000 * hurtArr[0];
            this.dropHpInterval = 1000 * hurtArr[1];
            this.dropHpValue = this.propertyObj.startHp * 0.01 * hurtArr[2];
            // this.setEnemyHp(this.dropHpValue, null, null);
            const effectName = EndlessParseSkill.getInstance().getEffectNameById(9);
            if (this.self.getChildByName(effectName)) {
                const skObj = this.self.getChildByName(effectName);
                skObj.play("bz", false);
                skObj.visible = true;
            } else {
                EndlessParseSkill.getInstance().setSkillEffect(9, this.self);

            }
        }
    }
    /**
     * 麻痹敌人
     */
    palsy_endless() {
        if (!this.self.visible) {
            return;
        }
        if (this.gameMode === "endless") {
            if (this.palsyStatus === "麻痹中") {
                if (Date.now() - this.palsyStartTime >= this.palsyKeepTime) {
                    this.palsyStatus = "免疫中";
                    this.palsyImmunityStartTime = Date.now();
                    EndlessParseSkill.getInstance().cancalSkillEffect(10, this.self);
                }
            } else if (this.palsyStatus === "免疫中") {
                if (Date.now() - this.palsyImmunityStartTime >= this.palsyImmunityKeepTime) {
                    this.palsyStatus = "无状态"
                }
            }
        }
    }
    private palsyStatus: string;       //麻痹状态  "麻痹中"  "免疫中"  "无状态"
    private palsyStartTime: number;   //麻痹开始的时间
    private palsyKeepTime: number;   //麻痹持续的时间
    private palsyImmunityKeepTime: number;      //免疫持续的时间
    private palsyImmunityStartTime: number;     //免疫开始的时间
    intiPalsy_endless() {
        const skillInstance = EndlessParseSkill.getInstance();
        if (this.gameMode === "endless" && skillInstance.isUpgraded(10) && (this.palsyStatus === "无状态" || !this.palsyStatus)) {
            this.palsyStatus = "麻痹中";
            this.palsyStartTime = Date.now();
            const from: string = this.propertyObj.e_type === 2 ? "boss" : "smallEnemy";
            this.palsyKeepTime = 1000 * skillInstance.getSkillNum(10, from);
            this.palsyImmunityKeepTime = 1000 * skillInstance.getImmunityData(10, from);
            EndlessParseSkill.getInstance().setSkillEffect(10, this.self);
        }
    }
    /**
     * 冰缓敌人
     */
    slowDown_endless() {
        if (this.gameMode === "endless") {
            if (this.slowDownStatus === "冰缓中") {
                if (Date.now() - this.slowDownStartTime >= this.slowDownKeepTime) {
                    if (this.sdImmunityKeepTime) {
                        this.slowDownStatus = "免疫中";
                        this.sdImmunityStartTime = Date.now();
                    } else {
                        this.slowDownStatus = null;
                    }
                    //取消冰缓
                    EndlessParseSkill.getInstance().cancalSkillEffect(12, this.self);
                }
            } else if (this.slowDownStatus === "免疫中") {
                if (Date.now() - this.sdImmunityStartTime >= this.sdImmunityKeepTime) {
                    this.slowDownStatus = null;
                }
            }
        }
    }
    private slowDownStatus: string;      //"冰缓中 免疫中 无状态"
    private slowDownStartTime: number;      //冰缓开始的时间
    private slowDownKeepTime: number;
    private sdImmunityKeepTime: number;     //冰缓免疫持续的时间
    private sdImmunityStartTime: number;
    private sdPecentValue: number;  //减缓的百分比
    initSlowDown_endless() {
        if (!this.self.visible) {
            return;
        }
        const skillInstance = EndlessParseSkill.getInstance();
        if (this.gameMode === "endless" && skillInstance.isUpgraded(12) && (!this.slowDownStatus || this.slowDownStatus === "无状态")) {
            this.slowDownStatus = "冰缓中";
            this.slowDownStartTime = Date.now();
            const from: string = this.propertyObj.e_type === 2 ? "boss" : "smallEnemy";
            const value: Array<number> = skillInstance.getSkillNum(12, from);
            this.sdPecentValue = (100 - value[0]) * 0.01;
            this.slowDownKeepTime = 1000 * value[1];
            this.sdImmunityKeepTime = skillInstance.getImmunityData(12, from);
            const effectName = EndlessParseSkill.getInstance().getEffectNameById(12);
            const sk: Laya.Skeleton = this.self.getChildByName(effectName);
            if (sk) {
                sk.play("bingshuan", true);
                sk.visible = true;
            } else {
                EndlessParseSkill.getInstance().setSkillEffect(12, this.self);
            }
        }
    }
    /**
     * 根据技能改变伤害
     */
    changeHurtBySkillInEndless(value: number) {
        const skillInstance = EndlessParseSkill.getInstance();
        if (this.gameMode === "endless") {
            let addHurt = 0;
            //威力
            if (skillInstance.isUpgraded(2)) {
                const temp = EndlessParseSkill.getInstance().getSkillNum(2);
                addHurt += value * temp * 0.01;
            }
            //大幅度增强火力
            if (skillInstance.isUpgraded(17)) {
                const valueArr: Array<number> = skillInstance.getSkillNum(17);
                const nowHp: number = PlayingControl.instance.roleHp;
                const roleTotal: number = PlayingControl.instance.roleTotal;
                if ((nowHp / roleTotal) < 0.3) {
                    addHurt += value * valueArr[1] * 0.01
                    this.createEnhanceFireEffect();
                }
            }
            //爆头
            if (skillInstance.isUpgraded(14)) {
                const bate = skillInstance.getSkillProbability(14);
                const randomValue = tools.random(1, 100);
                if (randomValue <= bate) {
                    const pos = { x: this.self.x, y: this.self.y }
                    EndlessParseSkill.getInstance().setSkillEffect(14, null, pos);
                    addHurt += 10000;
                }
            }
            return value + addHurt;
        }
    }

    createEnhanceFireEffect() {
        const skName: string = EndlessParseSkill.getInstance().getEffectNameById(17);
        const skObj = PlayingControl.instance.roleObj.getChildByName("skName");
        if (!skObj) {
            EndlessParseSkill.getInstance().setSkillEffect(17);
        }
    }
    /**
     * 吸血
     */
    vampire_endless() {
        const skillInstance = EndlessParseSkill.getInstance();
        if (this.gameMode === "endless" && skillInstance.isUpgraded(15)) {
            const hp = skillInstance.getSkillNum(15);
            role.instance.setRoleHp(-hp);
        }
    }
    private rollBackDistance_endless: number;
    private isRollBack_endless: boolean;
    private immunityTuiStartTime_endless: number;
    private immunityTuiInterval_endless: number;

    private isImmunityTui_endless: boolean;//免疫击退中
    /**
     * 重击，击退
     */
    initRollBack_endless() {
        if (!this.self.visible) {
            return;
        }
        if (this.propertyObj.e_type !== 2 && this.gameMode === "endless") {
            const skillInstance = EndlessParseSkill.getInstance();
            if (skillInstance.isUpgraded(13) && !this.isRollBack_endless && !this.isImmunityTui_endless) {
                this.rollBackDistance_endless = skillInstance.getSkillNum(13);
                this.immunityTuiInterval_endless = skillInstance.getImmunityData(13, "smallEnemy");
                this.isRollBack_endless = true;
                Laya.Tween.to(this.self, { x: this.self.x, y: this.self.y - this.rollBackDistance_endless }, 400, Laya.Ease.circOut, Laya.Handler.create(this, () => {
                    this.isRollBack_endless = false;
                    this.immunityTuiStartTime_endless = Date.now();
                    this.isImmunityTui_endless = true;
                    Laya.timer.once(this.immunityTuiInterval_endless * 1000, this, () => {
                        this.isImmunityTui_endless = false;
                    });
                }));
            }
        }
    }

    private bombImmunityInterval_endless: number; //爆炸的免疫间隔
    private bombImmunityStartTime_endless: number;// 免疫开始的时间
    private isImmunityBomb_endless: boolean;
    private bombValue_endless: number;      //伤害的值
    private bombR_endless: number;  //爆炸半径
    /**
     * 爆炸伤害
     */
    bombFire_endless(value: number) {
        if (!this.self.visible) {
            return;
        }
        if (this.gameMode === "endless") {
            const skillInstance = EndlessParseSkill.getInstance();
            if (skillInstance.isUpgraded(11) && !this.isImmunityBomb_endless) {
                this.bombImmunityStartTime_endless = Date.now();
                const from: string = this.propertyObj.e_type === 2 ? "boss" : "smallEnemy";
                this.bombImmunityInterval_endless = skillInstance.getImmunityData(11, from);
                if (this.bombImmunityInterval_endless) {
                    this.isImmunityBomb_endless = true;
                }
                const arr: Array<number> = skillInstance.getSkillNum(11);
                this.bombValue_endless = value * 0.01 * arr[0];
                this.bombR_endless = arr[1];
                this.startRangeBomb();
                EndlessParseSkill.getInstance().setSkillEffect(11, this.self);
            }
        }
    }
    startRangeBomb() {
        const explosionHurt = this.bombValue_endless;
        const explosionR = this.bombR_endless;
        const enemyArr: Array<any> = PlayingControl.instance.EnemySpite._children;
        const markNowPoint = new LYpoint(this.self.x, this.self.y);
        let i: number = 0;
        for (i; i < enemyArr.length; i++) {
            const obj = enemyArr[i];
            const distance: number = markNowPoint.distance(obj.x, obj.y);
            if (distance < explosionR * 10) {
                if (!obj.visible) {
                    continue;
                }
                const markScript = obj.markScript as Enemy;
                markScript.setEnemyHp(explosionHurt, null, null);
            }
        }
    }
    /**
     * 
     * @param oneBullet 漩涡子弹
     * enemy掉进漩涡
     */
    setDropInEddy(oneBullet: any) {
        Laya.Tween.to(this.self, { x: oneBullet.x, y: oneBullet.y, scaleX: 0.1, scaleY: 0.1 }, 500, Laya.Ease.expoInOut, Laya.Handler.create(this, () => {
            this.setDeadEffect();
            PlayingControl.instance.setScreenShake();
            this.setGetBuff(null);
            this.self.removeSelf();
            this.self.scale(1, 1);
        }));
    }
    /**
     * 
     * @param oneBullet 
     * 类型为7的副武器  连环爆炸
     */
    initSecondSeven(oneBullet: Laya.Sprite) {
        const propertyObj = oneBullet["property"] as BulletMain;
        const bType = propertyObj.bType;
        const secondType = propertyObj.secondType;
        if (bType === BulletType.roleSecondBullet && secondType === 7) {
            const configArr: Array<string> = SecondWeaponData.getInstance().buffType
            const powerLevel: number = SecondWeaponData.getInstance().getItemPowerLevel();
            const explosionHurt = propertyObj.hurtValue * 0.01 * (Number(configArr[1]) + Number(configArr[2]) * powerLevel);
            const explosionR = powerLevel * Number(configArr[4]) + Number(configArr[3]);
            const enemyArr: Array<any> = PlayingControl.instance.EnemySpite._children;
            const markNowPoint = new LYpoint(this.self.x, this.self.y);
            let i: number = 0;
            for (i; i < enemyArr.length; i++) {
                const obj = enemyArr[i];
                const distance: number = markNowPoint.distance(obj.x, obj.y);
                if (distance < explosionR * 10) {
                    if (!obj.visible) {
                        continue;
                    }
                    const markScript = obj.markScript as Enemy;
                    markScript.setEnemyHp(explosionHurt, null, null);
                    this.setMissileEffect(obj);
                }
            }
        }
    }
    /**
     * 被攻击会停顿
     */
    //击退距离
    private fightBackDistance: number;
    setAttackedStatus(oneBullet: Laya.Sprite) {
        const propertyObj = oneBullet["property"] as BulletMain;
        const bType = propertyObj.bType;
        const secondType = propertyObj.secondType;
        if (bType === BulletType.roleMainBullet) {
            this.stopped = true;

        } else if (bType === BulletType.roleSecondBullet) {
            const randomNum = tools.random(1, 100);
            switch (secondType) {
                case 1:
                    if (!propertyObj.affectBate) {
                        console.error("击退的概率有问题需要查看~");
                    }
                    if (propertyObj.affectBate <= randomNum) {
                        const configArr: Array<string> = SecondWeaponData.getInstance().buffType;
                        const powerLevel = SecondWeaponData.getInstance().getItemPowerLevel();
                        //击退 
                        this.fightBackDistance = Number(configArr[1]) + powerLevel * Number(configArr[2]);
                        this.secondAttacked = true;
                        this.setBackDistance();
                    }
                    break;
                case 3:
                    //冰缓
                    this.setIceSlowEffect(propertyObj);
                    this.secondAttacked = true;
                    break;
                case 4:
                    //激光炮
                    break;
                case 5:
                    //漂浮
                    this.setFloatEffect();
                    this.secondAttacked = true;
                    break;
                case 6:
                    //电磁炮会导致麻痹

                    if (!propertyObj.affectBate) {
                        console.error("电磁炮麻痹概率有问题,需要查看~");
                        propertyObj.affectBate = 50;
                    }
                    if (propertyObj.affectBate <= randomNum) {
                        this.secondWeaponInterval = propertyObj.keepTimeValue;
                        this.secondAttacked = true;
                        this.setParalysis();
                    }
                    break;
                case 9:
                    //飞刃
                    this.propertyObj.dropHpStatus = DropHpStatus.second9;
                    this.secondWeaponInterval = propertyObj.keepTimeValue;
                    this.secondAttacked = true;
                    break;
                case 10:
                    //蘑菇炮 概率中毒 持续掉血
                    if (!propertyObj.affectBate) {
                        console.error("蘑菇炮麻痹概率有问题,需要查看~");
                        propertyObj.affectBate = 50;
                    }
                    if (propertyObj.affectBate <= randomNum) {
                        this.propertyObj.dropHpStatus = DropHpStatus.second10;
                        this.secondWeaponInterval = propertyObj.keepTimeValue;
                        this.secondAttacked = true;
                    }
                    break;
                default:
                    break;
            }

        }
        this.attackedTime = Date.now();
    }

    /**
     * 判断是的被攻击
     */
    judgeAttacked() {
        if (this.secondAttacked) {
            const secondb_type: number = Number(SecondWeaponData.getInstance().buffType[0]);
            //是持续的
            const isNotKeepArr = [1, 7];
            if (!(isNotKeepArr.indexOf(secondb_type) > -1)) {
                if (Date.now() - this.attackedTime >= this.secondWeaponInterval * 1000) {
                    this.secondAttacked = false;
                    this.cancelEffect();
                }
            }
        }
        if (this.stopped) {
            if (Date.now() - this.attackedTime >= this.attackedStopInterval) {
                this.stopped = false;
            }
        }
    }
    setDeadEffect() {
        Music.getInstance().playSound(musicToUrl.bomb);
        this.createEffectInEneny(Data2.baozhaAni.gwbaozha);
        this.propertyObj.clearTimes();
        BattleParse.getInstance().killEnemyS++;

        PlayingControl.instance.setProgressBar();
        OpenWx.getInstance().vibrateShort();
        Laya.SoundManager.playSound("sound/destroy.wav");
    }
    setHurtEffect() {
        Music.getInstance().playSound(musicToUrl.bullet_normal);
        this.createEffectInEneny(Data2.baozhaAni.baozha);
    }
    setGetBuff(buffValue) {

        //buff是否产出buff
        PlayingControl.instance.createBuff(this.propertyObj.buffProbabilit, this.self.x, this.self.y);
        // this.createDropGoldIcon();
        this.addGoldMark(buffValue);
    }
    /**
     * 设置移动
     */
    setMove() {
        if (this.secondAttacked && this.secondType === 1) {
            //击退不需要移动
            return;
        }
        if (this.isRollBack_endless) {
            //无尽模式击退中
            return;
        }
        if (this.propertyObj.way) {
            // this.specialMove();
            return;
        }
        if (this.palsyStatus === "麻痹中") {
            return;
        }
        this.judgeAttacked();
        const nowSpeed = this.calNowSpeed();
        //无尽模式的冰缓技能
        if (this.gameMode === "endless" && this.slowDownStatus && this.slowDownStatus === "冰缓中") {
            nowSpeed.x = this.sdPecentValue * nowSpeed.x;
            nowSpeed.y = this.sdPecentValue * nowSpeed.y;
        }
        this.self.x += nowSpeed.x;
        this.self.y += nowSpeed.y;
    }
    /**
     * 持续掉血的副武器攻击
     */
    setKeepDropHp() {
        if (!this.self.visible) {
            return;
        }
        if (this.secondAttacked) {
            switch (this.propertyObj.dropHpStatus) {
                case DropHpStatus.second10:
                case DropHpStatus.second9:
                    const bArr: Array<string> = SecondWeaponData.getInstance().buffType
                    let intervalT = 1000 * Number(bArr[3]);
                    if (Date.now() - this.attackedTime >= intervalT) {
                        this.attackedTime = Date.now();
                        let dropHp: number;
                        const hurtValue = Number(SecondWeaponData.getInstance().getFire());
                        dropHp = Number(bArr[0]) === 9 ? hurtValue * Number(bArr[4]) * 0.01 : this.propertyObj.startHp * Number(bArr[4]) * 0.01;
                        if (this.propertyObj.dropHpStatus === DropHpStatus.second9) {
                            this.setFlyKnife();
                        } else {
                            this.setMushroomEffect();
                        }
                        this.setEnemyHp(dropHp, null, null);
                    }
                    break;
                default:
                    break;
            }

        }
    }
    calNowSpeed() {
        const spx = this._speedX;
        const spy = this.defaultSpeedY;
        let speedXy = { x: this._speedX, y: this.defaultSpeedY };
        const secondTypeToAction = { 6: this.getParalysisSpeed, 3: this.getIceSpeed, 5: this.getFloatSpeed }
        if (this.secondAttacked && secondTypeToAction[this.secondType]) {
            return secondTypeToAction[this.secondType]();
        } else {
            if (this.stopped) {
                speedXy.y = spy * 0.5;
                if (this._steering === "left") {
                    speedXy.x = -spx * 0.3;
                } else {
                    speedXy.x = spx * 0.3;
                }
            } else {
                speedXy.y = spy;
                if (this._steering === "left") {
                    speedXy.x = -spx;
                } else {
                    speedXy.x = spx;
                }
            }

        }
        if (!PlayingControl.instance.fighting) {
            speedXy.x = speedXy.x * PlayingControl.instance.gameSlowBate;
            speedXy.y = speedXy.y * PlayingControl.instance.gameSlowBate;
        }
        return speedXy;
    }
    getFloatSpeed() {
        const spx = this._speedX;
        const spy = this.defaultSpeedY;
        let speedXy = { x: this._speedX, y: this.defaultSpeedY };
        speedXy.y = this.stopped ? -spy * (0.1 + 0.1 * 0.5) : -spy * 0.1;
        if (this._steering === "left") {
            speedXy.x = -0.1 * spx;
        } else {
            speedXy.x = 0.1 * spx;
        }
        return speedXy;
    }
    // getLightSpeed() {
    //     const spx = this._speedX;
    //     const spy = this.defaultSpeedY;
    //     let speedXy = { x: this._speedX, y: this.defaultSpeedY };
    //     if (this.stopped) {
    //         speedXy.y = spy * 0.5;
    //         if (this._steering === "left") {
    //             speedXy.x = -spx * 0.5;
    //         } else {
    //             speedXy.x = spx * 0.5;
    //         }
    //     } else {
    //         speedXy.y = spy;
    //         if (this._steering === "left") {
    //             speedXy.x = -spx;
    //         } else {
    //             speedXy.x = spx;
    //         }
    //     }
    //     return speedXy;

    // }
    getIceSpeed() {
        const spx = this._speedX;
        const spy = this.defaultSpeedY;
        let speedXy = { x: this._speedX, y: this.defaultSpeedY };
        speedXy.y = this.stopped ? (0.5 + 0.5 * 0.5) * spy : 0.5 * spy;
        if (this._steering === "left") {
            speedXy.x = -0.5 * spx;
        } else {
            speedXy.x = 0.5 * spx;
        }
        return speedXy;
    }
    getParalysisSpeed() {
        return { x: 0, y: 0 };
    }
    initSpecialMove() {
        this.snakeIndex = 0;
        this.snakeLikeVar = [];
        this.isTracking = null;
        this.trackTween && LYTween.clear(this.trackTween);
        this.isCrashing = null;
        this.crashTween0 && LYTween.clear(this.crashTween0);
        this.crashTween1 && LYTween.clear(this.crashTween1);
        this.crashTween2 && LYTween.clear(this.crashTween2);
    }
    /**
     * 特殊移动怪物
     */
    specialMove() {
        switch (this.propertyObj.way) {
            case 1:
                this.snakeLikeMobile();
                break;
            case 2:
                // if (!this.isTracking) {
                this.wirelessTracking();
                // console.error("无限跟踪~~~~~~~~~~~");
                // }
                break;
            case 3:
                if (!this.isCrashing) {
                    this.fixedCrash();
                }
                break;
            default:
                break;
        }
    }
    /**
     * 蛇皮走位
     */
    private snakeIndex = 0;
    private snakeLikeVar = [];
    snakeLikeMobile() {
        this.initSnakeLikeMobile(this.snakeIndex);
        let bate: number = 4;
        if (!PlayingControl.instance.fighting) {
            bate = bate * PlayingControl.instance.gameSlowBate;
        }
        this.self.y += this.snakeLikePointObj.y * this.defaultSpeedY * bate;
        if (this.snakeIndex % 2 === 0) {
            if (this.snakeLikePointObj.x > 0) {
                this.self.x += this.snakeLikePointObj.x * this.defaultSpeedY * bate;
            } else {
                this.self.x -= this.snakeLikePointObj.x * this.defaultSpeedY * bate;
            }
            if (this.self.x >= (Laya.stage.width - this.propertyObj.mark_w)) {
                this.snakeIndex++;
            }
        } else {
            if (this.snakeLikePointObj.x > 0) {
                this.self.x -= this.snakeLikePointObj.x * this.defaultSpeedY * bate;
            } else {
                this.self.x += this.snakeLikePointObj.x * this.defaultSpeedY * bate;
            }
            if (this.self.x <= 0) {
                this.snakeIndex++;
            }

        }
    }
    private snakeLikePointObj: LYpoint;
    initSnakeLikeMobile(index: number) {
        if (this.snakeLikeVar.indexOf(index) === -1) {
            const stageW = Laya.stage.width;
            const stageH = Laya.stage.height;
            this.snakeLikePointObj = new LYpoint((index % 2 === 0 ? stageW : 0) - this.self.x, (stageH / 4) * (index + 1) - this.self.y);
            this.snakeLikePointObj.normalize();
            this.snakeLikeVar.push(index);
        }
    }
    /**
     * 无限跟踪
     */
    private isTracking: boolean;
    private trackTween: LYTween;
    wirelessTracking() {
        const roleObj = PlayingControl.instance.roleObj;
        let speedXy: number = 5;
        if (!PlayingControl.instance.fighting) {
            speedXy = speedXy * PlayingControl.instance.gameSlowBate;
        }
        let point = new Laya.Point(roleObj.x - this.self.x, roleObj.y - this.self.y);//算出长宽差值
        point.normalize();//归一化成比例便于控制缩放
        this.self.x += point.x * speedXy;
        this.self.y += point.y * speedXy;

        // //放大这个比例
        // this.trackTween = Laya.Tween.to(this.self, { x: this.self.x + point.x * 3, y: this.self.y + point.y * 3 }, 10, Laya.Ease.linearIn, Laya.Handler.create(this, function () {
        //     this.wirelessTracking();
        // }, []), 0);
    }
    /**
     * 定点撞击
     */
    private isCrashing: boolean;
    private crashTween0: LYTween;
    private crashTween1: LYTween;
    private crashTween2: LYTween;
    fixedCrash() {
        let owner = this.owner as Laya.Sprite;//自己节点
        var roleObj = PlayingControl.instance.roleObj;
        this.crashTween0 = LYTween.to(owner, { x: owner.x, y: Laya.stage.height / 4 }, 2000, Laya.Ease.elasticInOut, Laya.Handler.create(this, this.fixedCrash1));
    }
    fixedCrash1() {
        var roleObj = PlayingControl.instance.roleObj;
        this.crashTween1 = LYTween.to(this.self, { x: roleObj.x, y: roleObj.y }, 500, Laya.Ease.sineIn, Laya.Handler.create(this, this.fixedCrash2), 0);
    }
    fixedCrash2() {
        this.crashTween2 = LYTween.to(this.self, { x: this.self.x, y: Laya.stage.height }, 1000, Laya.Ease.sineIn, null, 0);
    }
    //碰撞过后，延迟一帧
    private nextFrameCheckTrigger: boolean;
    private markHpArr: number;
    onTriggerEnter(other: any, self: any) {
        //if (!this.nextFrameCheckTrigger) {
        const otherSprite: Laya.Sprite = other.owner;
        const otherPropertyObj = otherSprite["vars_"] && otherSprite["vars_"].propertyObj;
        if (otherPropertyObj && otherPropertyObj.prefabType === Data2.prefabType.enemy) {
            if (!this.self.visible) {
                return;
            }
            //console.error("自身碰撞~~~~");
            if (!otherPropertyObj.way) {
                if (this._steering === "left") {
                    this._steering = "right"
                } else {
                    this._steering = "left"
                }
                // this.setSpeedRecover();
            }
            return;
        }
        if (!otherPropertyObj) {
            return;
        }
        if (otherPropertyObj.e_type === 2) {
            return;
        }
        if (otherPropertyObj.prefabType === Data2.prefabType.bulletSkill && this.propertyObj.enmeySprite.y < (-this.propertyObj.mark_h)) {
            return;
        }
        if (this.propertyObj.e_type !== 2 && otherPropertyObj.prefabType === Data2.prefabType.bulletSkill && otherSprite.y >= otherSprite.getComponent(Laya.BoxCollider).height) {
            this.secondBulletHandler(other, self);
        }
        if (this.propertyObj.prefabType === Data2.prefabType.boss) {
            this.propertyObj.playAction(Data2.bossDragonAction.attacked);
        }
        this.nextFrameCheckTrigger = true;

        let xxx = PlayingVar.getInstance().canColorKillEnemy;
        if (!PlayingVar.getInstance().canColorKillEnemy) {
            if (otherPropertyObj.prefabType === Data2.prefabType.role) {
                Music.getInstance().playSound(musicToUrl.bomb);

                this.createEffectInEneny(Data2.baozhaAni.gwbaozha);
                this.propertyObj.clearTimes();
                this.self.removeSelf();
                BattleParse.getInstance().killEnemyS++;

                PlayingControl.instance.setProgressBar();
                Laya.SoundManager.playSound("sound/destroy.wav");
                return;
            }
            if (this.propertyObj.hp - otherPropertyObj.hurtValue == this.markHpArr) {
                debugger;
            }
            this.propertyObj.hp -= otherPropertyObj.hurtValue * 0.15 / 0.15;

            this.markHpArr = this.propertyObj.hp;
            // console.error("子弹的伤害：", otherPropertyObj.hurtValue);
            if (this.propertyObj.hp <= 0) {
                // Music.getInstance().playSound(musicToUrl.bullet_normal);
                Music.getInstance().playSound(musicToUrl.bomb);
                this.createEffectInEneny(Data2.baozhaAni.gwbaozha);
                this.propertyObj.clearTimes();
                //explode动画是原来测试效果的,已经淘汰
                // let effect: Laya.Animation = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                // effect.pos(this.self.x, this.self.y);
                // this.owner.parent.addChild(effect);
                // effect.play(0, true);
                //buff是否产出buff
                PlayingControl.instance.createBuff(this.propertyObj.buffProbabilit, this.self.x, this.self.y);
                this.createDropGoldIcon();
                this.addGoldMark(otherSprite["vars_"].buffValue);
                this.self.removeSelf();
                //杀死的数量增加
                BattleParse.getInstance().killEnemyS++;
                PlayingControl.instance.setProgressBar();
                Laya.SoundManager.playSound("sound/destroy.wav");
            } else {
                // Music.getInstance().playSound(musicToUrl.bomb);
                this.createEffectInEneny(Data2.baozhaAni.baozha);
                this.childLabel.text = this.propertyObj.hp.toString();
                this.propertyObj.changeHpProgress();
            }

        } else {
            Laya.timer.frameOnce(1, this, () => {
                self.owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: 0 });
            });
        }
        /* 
     } else {
         Laya.timer.frameOnce(1, this, () => {
             this.nextFrameCheckTrigger = false;
         });
     }
     */

        //console.log("敌人发生了碰撞");
    }
    addGoldMark(value: number) {
        BattleParse.getInstance().calKillOneGold(this.propertyObj.enemyId, value || null);
    }
    /**
     * 怪物被子弹攻击后的效果
     * @param type 是被子弹攻击  还是死亡
     */
    createEffectInEneny(type: Data2.baozhaAni) {
        if (type === Data2.baozhaAni.gwbaozha) {
            if (this.owner["vars_"].propertyObj.e_type && this.owner["vars_"].propertyObj.e_type === 2) {
                //boss
                // const baozhaPrefab: Laya.Prefab = Laya.loader.getRes("prefab/boss_baozha.json");

                var baozhaSprite = Laya.Pool.getItemByCreateFun("sign_boss_baozha", this.createBossBaoZha, this);
                baozhaSprite.aniName = "baozha2";
                baozhaSprite.prefabName = "boss_baozha";
            } else {
                const baozhaPrefab: Laya.Prefab = Laya.loader.getRes("prefab/xg_baozha.json");
                var baozhaSprite = Laya.Pool.getItemByCreateFun("xg_baozha", baozhaPrefab.create, baozhaPrefab);
                baozhaSprite.aniName = "baozha1";
                baozhaSprite.prefabName = "xg_baozha";
            }
        } else {
            const baozhaPrefab: Laya.Prefab = Laya.loader.getRes("prefab/zidan.json");
            var baozhaSprite = Laya.Pool.getItemByCreateFun("zidan", baozhaPrefab.create, baozhaPrefab);
            baozhaSprite.aniName = type;
            baozhaSprite.prefabName = "zidan";
            // const randomScale = (random(6, 8)) / 10;
            // baozhaSprite.scaleX = randomScale;
            // baozhaSprite.scaleY = randomScale;
        }
        const offX: number = random(this.propertyObj.mark_w / 4, this.propertyObj.mark_w * 3 / 4 - 5);
        const offy: number = random(this.propertyObj.mark_h * 3 / 4 - 30, this.propertyObj.mark_h - 30);
        const posX: number = this.self.x + offX;
        const posY: number = this.self.y + offy;
        // console.error("缩放倍数", randomScale);
        // console.error("偏移量X", offX, "偏移量Y", offy);
        baozhaSprite.pos(posX, posY);
        PlayingControl.instance.effectParent.addChild(baozhaSprite);
        // Laya.stage.addChild(baozhaSprite);
    }
    createBossBaoZha(): LYSkeleton {
        const templets = SkeletonTempletManage.getInstance().templets;
        const boss_baoZha: Laya.Templet = templets["boss_baozha"];
        const sk: LYSkeleton = boss_baoZha.buildArmature(0);
        sk.addComponent(BaoZha);
        return sk;
    }
    /**
     * 
     * @param name .sk的name
     */
    baoZhaGragonCreate(name: string): LYSkeleton {
        return;
    }
    onDisable(): void {
        this.self.visible = false;
        EndlessParseSkill.getInstance().cancalSkillEffect(9, this.self);
        EndlessParseSkill.getInstance().cancalSkillEffect(10, this.self);
        //取消冰缓
        EndlessParseSkill.getInstance().cancalSkillEffect(12, this.self);
        this.isTriggerDropHp = null;
        const markSK = (this.self.getChildByName("EnemySK") as LYSkeleton) || this.self;
        markSK && markSK.stop && markSK.stop();
        Laya.timer.clearAll(this);
        Laya.Tween.clearAll(this.self);
        this.self["vars_"].skillType = null;
        const markSine = this.propertyObj.nick;
        this.cancelEffect();
        if (this.self.getChildByName("Boss_hp")) {
            this.self.getChildByName("Boss_hp").destroy(true);
        }
        if (this.propertyObj && this.propertyObj.e_type && this.propertyObj.e_type === 2) {
            Laya.Pool.recover(markSine, this.self);
            if (this.gameMode === "endless" && EndlessManage.getInstance().isBossFighting) {
                //打死了无尽boss
                EndlessManage.getInstance().endBossFighting();
            }
        } else {
            Laya.Pool.recover(markSine, this.self);

        }
        this.propertyObj = null;

    }
    /**
     * 每杀死一个敌人掉落金币icon
     */
    createDropGoldIcon() {
        const goldIcon: Laya.Prefab = Laya.loader.getRes("prefab/DropGold.json");
        const goldObj: Laya.Image = Laya.Pool.getItemByCreateFun("DropGold", goldIcon.create, goldIcon);
        goldObj.pos(this.self.x + this.propertyObj.mark_w / 2 - goldObj.width / 2, this.self.y + this.propertyObj.mark_h / 2 - goldObj.height / 2, true);
        PlayingControl.instance.dropGoldParent.addChild(goldObj);
    }
    /**使用对象池创建爆炸动画 */
    createEffect(): Laya.Animation {
        let ani: Laya.Animation = new Laya.Animation();
        ani.loadAnimation("test/explode.ani");
        ani.on(Laya.Event.COMPLETE, null, recover);
        function recover(): void {
            ani.removeSelf();
            Laya.Pool.recover("effect", ani);
        }
        return ani;
    }

    /**
     * 设置反向速度
     */
    setSpeedReverse(): void {
        // this.selfRigidBody.setVelocity({ x: 0, y: -this.defaultSpeedY });
    }
    private effectObj: any;
    setIceSlowEffect(propertyObj: BulletMain) {
        const bate = Math.random();
        const iceBate = propertyObj.affectBate / 100;
        // console.error("冰概率:------", iceBate, "bate:-----", bate);
        if (iceBate > bate) {
            return;
        }

        if (!this.effectObj) {
            const prafabName = Data2.muzzlePrefabEnemy[SecondWeaponData.getInstance().buffType[0]];
            const markPrefab: Laya.Prefab = Laya.loader.getRes("prefab/" + prafabName + ".json");
            const prefabObj = Laya.Pool.getItemByCreateFun(prafabName, markPrefab.create, markPrefab);
            this.effectObj = prefabObj;
            prefabObj.pos(this.propertyObj.mark_w / 2, this.propertyObj.mark_h / 2);
            this.self.addChild(prefabObj);
            this.markSk && this.markSk.playbackRate(0.01);
        }
    }
    setFloatEffect() {
        if (!this.effectObj) {
            const prafabName = Data2.muzzlePrefabEnemy[SecondWeaponData.getInstance().buffType[0]];
            const markPrefab: Laya.Prefab = Laya.loader.getRes("prefab/" + prafabName + ".json");
            const prefabObj = Laya.Pool.getItemByCreateFun(prafabName, markPrefab.create, markPrefab);
            this.effectObj = prefabObj;
            prefabObj.pos(this.propertyObj.mark_w / 2, this.propertyObj.mark_h);
            this.self.addChild(prefabObj);
        }
    }
    cancelEffect() {
        this.effectObj && this.effectObj.removeSelf() && (this.effectObj = null);
        this.markSk && this.markSk.playbackRate(1);
        this.propertyObj.dropHpStatus = DropHpStatus.ordinary;
    }
    secondBulletHandler(other: Laya.PhysicsComponent, self: any) {
        if (this.self["vars_"] && this.self["vars_"].skillType) {
            Laya.timer.clear(this, this.flottantCall);
            this.self.removeChildByName("paopao");
        }
        const bullet_second: Bullet_second = other.owner.getComponent(Bullet_second);
        const prafabName = Data2.muzzlePrefabEnemy[SecondWeaponData.getInstance().buffType[0]];
        const markPrefab: Laya.Prefab = Laya.loader.getRes("prefab/" + prafabName + ".json");
        const prefabObj = Laya.Pool.getItemByCreateFun(prafabName, markPrefab.create, markPrefab);
        this.self.addChild(prefabObj);
        switch (bullet_second.bulletType) {
            case 3:
                prefabObj.name = "paopao";
                prefabObj.pos(this.propertyObj.mark_w / 2, this.propertyObj.mark_h / 2);
                // toast.noBindScript("受到了减缓效果!", this.self);
                this.setIce(other, bullet_second);
                break;
            case 4:
                prefabObj.pos(this.propertyObj.mark_w / 2, this.propertyObj.mark_h / 2);
                break;
            case 5:
                prefabObj.name = "paopao";
                prefabObj.pos(this.propertyObj.mark_w - this.propertyObj.mark_w / 2, this.propertyObj.mark_h);
                // toast.noBindScript("受到了漂浮效果效果!", this.self);
                this.setFlottant(other, bullet_second);
                break;
            default:
                break;
        }
    }

    /**
     * 冰缓
     */
    private setIce(other: Laya.PhysicsComponent, bullet_second: Bullet_second): void {
        Laya.timer.once(bullet_second.iceTS[0] * 1000, this, this.iceCall, null, true);
        this.self["vars_"].skillType = secondSkill.ice;
        // this.setSpeedValue(null, bullet_second.iceTS[1]);
        console.error("冰缓~~~");
    }
    private iceCall(): void {
        this.self["vars_"].skillType = null;
        this.self.removeChildByName("paopao");
        Laya.timer.clear(this, this.iceCall);
        // this.setSpeedRecover();
    }
    /**
     * 激光
     */
    private setLaser(other: Laya.Sprite): void {

    }
    /**
     * 漂浮
     */
    private setFlottant(other: Laya.PhysicsComponent, bullet_second: Bullet_second): void {
        this.self["vars_"].skillType = secondSkill.flottant;
        /*
        const img: Laya.Image = Laya.Pool.getItemByCreateFun("flottantCircle", this.createFlottantCircle, this);
        img.pos(this.imgPic.x + (this.imgPic.width / 2) - img.width / 2, this.imgPic.y + (this.imgPic.height / 2) - img.height / 2, true);
        img.name = "paopao";
        this.self.addChild(img);
        console.log(bullet_second.flottantT);
        */
        Laya.timer.once(bullet_second.flottantT * 1000, this, this.flottantCall, null, true);
        this.setSpeedReverse();
        console.log("漂浮~~~");
    }
    private flottantCall(): void {
        this.self["vars_"].skillType = null;
        this.self.removeChildByName("paopao");
        Laya.timer.clear(this, this.flottantCall);
        // this.setSpeedRecover();
    }
    /**
     * 创建捆包敌人的圈圈 piaofu
     */
    createFlottantCircle(): Laya.Image {
        const img: Laya.Image = new Laya.Image("secondWeapon/悬浮炮子弹.png") as Laya.Image;
        img.onDisable = this.imgDisable;
        return img;
    }
    imgDisable() {
        console.error("进入了泡泡disable的事件");
        Laya.Pool.recover("flottantCircle", this);
    }
    /**
     * 电磁炮麻痹麻痹
     */
    setParalysis() {
        this.markSk && this.markSk.playbackRate(0.01);
        this.effectObj = SkeletonTempletManage.getInstance().createSkByTemplet("diancipao");
        this.effectObj.pos(this.propertyObj.mark_w / 2, this.propertyObj.mark_h / 2);
        this.effectObj.play(1, true);
        this.self.addChild(this.effectObj);
        toast.noBindScript("触发麻痹效果~q");
    }
    /**
 * 设置击退的效果
 */
    private backDistanceTween: LYTween;
    setBackDistance() {
        this.markSk && this.markSk.playbackRate(0.01);
        this.effectObj = SkeletonTempletManage.getInstance().createSkByTemplet("liuxingpao");
        this.effectObj.pos(this.propertyObj.mark_w / 2, this.propertyObj.mark_h);
        this.effectObj.play(1, true);
        this.self.addChild(this.effectObj);
        var nowY = this.self.y;
        this.backDistanceTween = LYTween.to(this.self, { x: this.self.x, y: this.self.y - this.fightBackDistance }, 100, Laya.Ease.circOut, Laya.Handler.create(this, () => {
            this.secondAttacked = false;
            this.cancelEffect();
        }));
    }
    /**
     * 设置蘑菇特效
     */
    setMushroomEffect() {
        this.effectObj = SkeletonTempletManage.getInstance().createSkByTemplet("mogupao");
        this.effectObj.pos(this.propertyObj.mark_w / 2, this.propertyObj.mark_h / 2);
        this.effectObj.play(1, false);
        this.effectObj.zOrder = -1;
        this.self.addChild(this.effectObj);
        toast.noBindScript("触发中毒效果~q");
    }
    /**
     * 设置飞刃的效果
     */
    setFlyKnife() {
        this.effectObj = SkeletonTempletManage.getInstance().createSkByTemplet("feirenfengbao");
        this.effectObj.pos(this.propertyObj.mark_w / 2, this.propertyObj.mark_h / 2);
        this.effectObj.play(1, false);
        this.self.addChild(this.effectObj);
        toast.noBindScript("触发飞刃效果~q");
    }

    setMissileEffect(obj: any) {
        this.effectObj = SkeletonTempletManage.getInstance().createSkByTemplet("daodanpao");
        const w = obj.vars_.propertyObj.mark_w;
        const h = obj.vars_.propertyObj.mark_h;
        this.effectObj.pos(w / 2, h / 2);
        this.effectObj.play(1, false);
        obj.addChild(this.effectObj);
        toast.noBindScript("触发导弹效果~q");
    }
}