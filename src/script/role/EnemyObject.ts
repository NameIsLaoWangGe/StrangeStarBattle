import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import Tool, { tools } from "../Tools/Tool"
import Buff from "../role/Buff"
import DataType = Data2.DataType;
import FixedDataTables = Data.FixedDataTables;
import Skeleton = Laya.Skeleton;
import Sprite = Laya.Sprite;
import bossStatus = Data2.bossStatus;
import EnemyCommon from "./EnemyCommon";
import BulletCommon from "./BulletCommon"
import PlayingSceneControl from "../playing/PlayingSceneControl"
import toast from "../manage/toast";
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import bossDragonAction = Data2.bossDragonAction;
import SkeletonTempletManage from "../manage/SkeletonTempletManage";
import FireBossBullet1 from "./FireBossBullet1";
import MediumEnemy_Move from "../MediumEnemy/MediumEnemy_Move";
export default class BossObject extends EnemyCommon {
    public enmeySprite: Laya.Sprite;
    public readonly bossSK: Skeleton;
    private readonly bulletObj: BulletCommon;
    private status: bossStatus;
    //敌人内部得img对象
    private imgObj: Laya.Image;
    //敌人内部得 boxCollider
    private boxCollider: Laya.BoxCollider;
    private bossHpObj: Laya.Sprite;
    constructor(bossId: number) {
        super(bossId);
        this.createEnemy();
        if (this.way && this.e_type !== 2) {
            //判断是否有重复脚本
            let mediumEnemy_Move = this.enmeySprite.getComponent(MediumEnemy_Move);
            if (!mediumEnemy_Move) {
                this.enmeySprite.addComponent(MediumEnemy_Move);
            }
            return;
            // return;
        }
        Laya.Browser.window.markBoss = this.enmeySprite;
        if (this.e_type === 2) {
            this.bossSkillInterval = (this.nick === "Boss4" || this.nick === "Boss5") ? 8000 : 6000;
            //boss子弹~
            this.bulletObj = new BulletCommon(Data2.BulletType.boss, this.enemyId, this.isWFboss);

            this.bossSK = (this.enmeySprite as Sprite).getChildByName(this.nick) as Skeleton;

            Laya.Browser.window.bossSK = this.bossSK;
            this.bossSK.on(Laya.Event.STOPPED, this, this.SK_listener, [Laya.Event.STOPPED])
            this.bossSK.on(Laya.Event.LABEL, this, this.SK_action);
            //warning
            this.createWarning();
            // const warning: Laya.Prefab = Laya.loader.getRes("prefab/Boss_warning.prefab");

            // let bossWarning = warning.create();
            // Laya.stage.addChild(bossWarning);
            // this.setWarningMusic();

            //this.bossMove();
            // Laya.Tween.to(this.enmeySprite, { x: this.enmeySprite.x, y: this.bossStartY }, 1100, null, Laya.Handler.create(this, this.bossAtatck), null, true, true);
        }
    }
    createWarning() {
        const warning: Laya.Prefab = Laya.loader.getRes("prefab/Boss_warning.prefab");
        let bossWarning = warning.create();
        Laya.stage.addChild(bossWarning);
        this.setWarningMusic();
        Laya.timer.once(2300, this, () => {
            Laya.Tween.to(this.enmeySprite, { x: this.enmeySprite.x, y: this.bossStartY }, 1100, null, Laya.Handler.create(this, this.bossAtatck), null, true, true);
        });
    }
    setWarningMusic() {
        Music.getInstance().playSound(musicToUrl.warning);
        Music.getInstance().playMusic(musicToUrl.warning_bg);
    }
    private progress_di: Laya.Image;
    private progress_bar: Laya.Image;
    //enemy得width 和height
    public mark_w: number;
    public mark_h: number;
    createEnemy(): void {
        this.enmeySprite = Laya.Pool.getItemByCreateFun(this.nick, this.res.create, this.res);
        Laya.Tween.clearAll(this.enmeySprite);
        Laya.timer.clearAll(this.enmeySprite);
        const markESK: Laya.Skeleton = this.enmeySprite.getChildByName("EnemySK") as Laya.Skeleton;
        // markESK && markESK.removeSelf();
        var w = 0;
        var h = 0;
        if (this.e_type !== 2) {
            if (true || Data2.midEnemyNameToSK[this.pic]) {
                let sk: Laya.Skeleton;
                if (markESK) {
                    const nickName = markESK.templet["_skBufferUrl"].split("/")[1].split(".")[0];
                    if (nickName !== this.nick) {
                        Laya.Pool.recover("sk_" + nickName, markESK.removeSelf())
                        sk = this.createMonsterAddChild("sk_" + nickName);
                    }
                    else {
                        sk = markESK;
                    }
                } else {
                    sk = this.createMonsterAddChild("sk_" + this.nick);
                }
                // const templetValue: Laya.Templet = SkeletonTempletManage.getInstance().templets[this.pic];
                // const sk: Laya.Skeleton = templetValue.buildArmature(0)/*new Laya.Skeleton()*/;
                // sk.play(0, true);
                // this.enmeySprite.addChild(sk);
                // const url = "dragonbones/" + (this.pic === "chuji_xiaoemo" ? "chuji_xiaoguai3" : this.pic) + ".sk";
                // sk.load(url);
                sk.pos(80.5, 65.5);
                sk.name = "EnemySK";
                this.progress_di = this.enmeySprite.getChildByName("hp_di") as Laya.Image;
                this.progress_di.y = 150 - 15 + 31 - 30;

                this.progress_bar = this.enmeySprite.getChildByName("hp_bar") as Laya.Image;
                this.progress_bar.y = 150 - 15 + 31 - 30;
                w = 165;
                h = 148;
            } else {
                this.imgObj = this.enmeySprite.getChildByName("imgPic") as Laya.Image;
                this.progress_di = this.enmeySprite.getChildByName("hp_di") as Laya.Image;
                this.progress_bar = this.enmeySprite.getChildByName("hp_bar") as Laya.Image;
                this.imgObj.skin = Data2.monsterUrl + this.pic + ".png";
                this.boxCollider = (this.enmeySprite as Laya.Sprite).getComponent(Laya.BoxCollider);
                w = this.imgObj.width || 100;
                h = this.imgObj.height || 0;
                this.boxCollider.width = w;
                this.boxCollider.height = h;
                this.progress_di.x = this.imgObj.x + w / 2 - this.progress_di.width / 2;
                this.progress_di.y = this.imgObj.y + h;
                this.progress_bar.pos(this.progress_di.x, this.progress_di.y);
            }
            this.changeHpProgress(this.hp);
            this.enmeySprite.visible = false;

        } else {
            markESK && markESK.removeSelf();
            this.boxCollider = (this.enmeySprite as Laya.Sprite).getComponent(Laya.BoxCollider);
            w = this.boxCollider.width;
            h = this.boxCollider.height;
            this.createBossHp();
            //暂时缩放只对boss2更改~
            if (this.e_type === 2) {
                this.enmeySprite.scale(this.scaleXY.x, this.scaleXY.y);
            } else {
                this.enmeySprite.scale(0.9, 0.9);
            }
        }
        if (!this.enmeySprite["vars_"]) {
            this.enmeySprite["vars_"] = {};
        }
        this.mark_w = w;
        this.mark_h = h;
        this.enmeySprite["vars_"].propertyObj = this;
        const e_posX = Tool.random(0, Laya.stage.width - w - 5);
        const e_posY = Tool.random(-30 - h, -5 - h);
        this.enmeySprite.pos(e_posX, e_posY);
    }
    createMonsterAddChild(signName: string): Laya.Skeleton {
        // Laya.Pool.getItemByCreateFun(signName, () => {

        // }, this);
        const templetValue: Laya.Templet = SkeletonTempletManage.getInstance().templets[this.pic];
        const sk: Laya.Skeleton = templetValue.buildArmature(0)/*new Laya.Skeleton()*/;
        sk.play(0, true);
        this.enmeySprite.addChild(sk);
        return sk;
    }
    destroyEnemy(): void {
        this.enmeySprite.destroy();
    }
    /**
     * 只有boss的血条是动态创建的~
     */
    private boss_hpMask: Laya.Sprite;
    createBossHp(nowHp?: number) {
        const prefabObj: Laya.Prefab = Laya.loader.getRes("prefab/Boss_hp.json");
        this.bossHpObj = prefabObj.create();
        this.bossHpObj.name = "Boss_hp";
        const imgDi: Laya.Image = this.bossHpObj.getChildByName("progress_pic") as Laya.Image;
        this.boss_hpMask = imgDi.mask as Laya.Sprite;
        this.bossHpObj.x = this.boxCollider.width / 2 - imgDi.width / 2;
        this.bossHpObj.y = this.boxCollider.height;
        this.changeHpProgress(this.hp);

        this.bossHpObj.zOrder = 5;
        this.enmeySprite.addChild(this.bossHpObj);
    }
    /**
     * 改变hp进度条
     */
    changeHpProgress(nowHp?: number): void {
        //暂无boss的进度条
        if (this.e_type !== 2) {
            let mask: Laya.Sprite = this.progress_bar.mask as Laya.Sprite;
            mask.graphics.clear()
            mask.graphics.drawRect(0, -5.5, 104 * ((nowHp || this.hp) / this.startHp), 20, "##ff0000");
        } else {
            if (this.boss_hpMask) {
                this.boss_hpMask.graphics.clear();
                this.boss_hpMask.graphics.drawRect(0, 0, 321 * ((nowHp || this.hp) / this.startHp), 52, "#ff0000");
            }
        }
    }
    setHpBarShowStatus(show: boolean) {
        if (this.e_type !== 2) {
            this.progress_bar.visible = show;
            this.progress_di.visible = show;
        } else {
            this.bossHpObj.visible = show;
        }
    }
    /**
     * boss移动
     */
    bossMove(): void {
        if (this.e_type !== 2) {
            return;
        }
        this.tween = Laya.Tween.to(this.enmeySprite, { x: Tool.random(0, Laya.stage.width - this.enmeySprite.width / 2), y: ((Laya.stage.height / 3) - this.enmeySprite.height / 2) }, Tool.random(2000, 5000), null, Laya.Handler.create(this, this.bossAtatck), null, true);
    }
    private tween: Laya.Tween;
    /**
     * boss攻击
     */
    private bulletNum = 0;
    bossAtatck(): void {
        if (this.isWFboss) {
            this.enmeySprite.addComponent(this.needAddScript);
            return;
        }
        this.bossStatus = "stand";
        this.nick === Data2.enemyToPerfab.boss2 && this.initVarBoss2();
        this.nick === Data2.enemyToPerfab.boss1 && this.initVarBoss1();
        this.nick === Data2.enemyToPerfab.boss3 && this.initVarBoss3();
        this.nick === Data2.enemyToPerfab.boss4 && this.initVarBoss4();
        this.nick === Data2.enemyToPerfab.boss5 && this.initVarBoss5();

        this.moveVarInit();
        Laya.Tween.clearTween(this.enmeySprite);
        Laya.timer.frameLoop(2, this, this.onBossUpdate);
        this.createBulletTime = Date.now();
        this.bossMoveTime = Date.now();
        this.bossSkillTime = Date.now();
        //Laya.timer.loop(this.bulletObj.shootSpeed, this, this.createBullet);
    }
    initVarBoss2() {
        this.triggerSkill = false;
        this.commBulletWave = Date.now();
        this.ionPaoTime = Date.now();
        this.skillBulletTime = Date.now();
        this.commBulletTime = Date.now();
        this.bossStatus = "coolSkill";
    }
    initVarBoss3() {
        this.triggerSkill = false;
        this.cbStatus1_boss3 = "shot";
        this.cbStatus2_boss3 = "shot";
        this.cbTime1_boss3 = Date.now();
        this.shotBTime_boss3 = this.cbTime1_boss3;
        this.cbShotIndex1_boss3 = 0;
        this.shotNumInWave_boss3 = 0;
        this.shotWave2_boss3 = 0;
        this.bossStatus = "endFollowUp"
        this.isWaring_boss3 = true;
        this.skillWarnTime_boss3 = this.cbTime1_boss3;
    }
    /**
     * boss4 冰怪部分初始化
     */
    initVarBoss4() {
        this.triggerSkill = false;
        this.triggerNBSkill = false;
        this.btime1_boss4 = Date.now();
        this.bShotTime1_boss4 = Date.now();
        this.bCommStatus = "b1";
        this.bShotLeft1 = false;
        this.bShotIndex1 = 0;
        this.isBSkill1 = true;
        this.isBSkill2 = false;
        this.skillStartTime_boss4 = Date.now();
        this.skillNum1_boss4 = 0;
        this.skillBStartTime_boss4 = Date.now();
        this.bShotIndex2 = 0;
    }
    /**
     * boss5 火怪的变量初始化
     */
    initVarBoss5() {
        this.triggerSkill = false;
        this.triggerNBSkill = false;
        this.isBSkill1 = true;
        this.isBSkill2 = false;
        this.skillStartTime_boss5 = Date.now();
        this.skillLastTime_boss5 = this.skillStartTime_boss5;
        this.bCommStatus = "b1";
        this.bCommWaveIndex1 = 0;

        this.waveLastTime_boss5 = this.skillStartTime_boss5;
    }
    initVarBoss1() {
        this.triggerSkill = false;
        this.commBStatus_boss1 = "shoting";
        this.commBulletTime_boss1 = Date.now();
        this.isCircleing = true;
        this.commBulletContinueTime_boss1 = null/*Date.now()*/;
        this.nowBulletPlace = 0;
        this.isCommonBStop = false;
        this.commBIndex = 0;
        this.commBStopIndex = 0;
        this.canCreateSkill1_boss1 = false;

        this.timeLastSkill1_boss1 = Date.now();
        this.nowNumOneLieSkill1_boss1 = 0;
        this.timeLastSkill2_boss1 = Date.now();
        this.obj_bossBSkill1 = [];
        this.bSkillObj1_boss1 = [];
        this.initControlBNumByOnePlaceVar();
    }
    initControlBNumByOnePlaceVar() {
        this.controlBNumByOnePlace = [];
        let i: number = 0;;
        for (i; i < this.circleNums; i++) {
            this.controlBNumByOnePlace[i] = 0;
        }
    }
    /**
     * boss的update 发射子弹移动都在这里处理
     */
    private createBulletTime: number;
    public bossStatus: string;
    private bossMoveInterval: number;
    private bossMoveTime: number;
    private readonly bossSkillInterval: number = 6000;
    private bossSkillTime: number;
    //boss4 普通子弹 左手 右手  1  2
    private bulletPosInBoss4: number;
    private skillDateNow: number;

    /**
     * boss3 相关
     */

    private cbStatus1_boss3: string;    //boss3子弹1的状态   shot stop
    private readonly cbIntervar1_boss3: number = 0.05 * 1000;  //boss3 普通子弹1的发射间隔
    private cbTime1_boss3: number;      //boss3 普通子弹1上次的发射时间
    private readonly cb1AngleRange = [30, 150];    //boss3 普通子弹1 的设计方向
    private readonly cbStopInterval1_boss3: number = 2000;   //普通子弹1 停顿Interval
    private cbShotIndex1_boss3: number;             //发射的第index个 普通子弹1

    private cbStatus2_boss3: string;
    private readonly shotNumsCb2_boss3 = 18;    //普通子弹2 每次创建的数量
    private shotWave2_boss3: number;            //记录当前发射的波数
    private shotNumInWave_boss3: number;         //记录当前波发射的数量
    private shotWaveStopTime_boss3: number = 3000;  //每发射两波后停顿的时间
    private readonly shotOffset2 = 1;       //普通子弹2的每颗子弹的偏移
    private readonly shotBInterval2: number = 0.5; //每发子弹间隔
    private shotBTime_boss3: number;    //上次子弹的时间点

    //另外bossStatus  followUping  endFollowUping   endFollowUp
    private isWaring_boss3: boolean;
    private readonly skillWarnInterval_boss3: number = 2000;      //警告的时间
    private skillWarnTime_boss3: number;      //上次警告的时间点
    private skillShotndex_boss3: number;    //技能子弹发射到第？
    private skillShotTime_boss3: number;    //记录技能子弹时间
    private skillBInterval_boss3 = 1000;    //技能子弹的发射间隔
    private bossFollowUpTime: number;   //boss开始追击的时间
    private bossFollowUpInterval: number = 6000;    //追击的持续时间

    /**
     * boss4 相关
     */
    // bossStatus:  nBSkill notNBSkill
    private triggerNBSkill: boolean;   //触发终极技能

    private bCommStatus: string;        // b1 b2   现在是普攻1 还是普攻2
    private readonly continuedTime1_boss4: number = 5000;    //普通攻击1 持续时间
    private readonly bInterval1_boss4: number = 0.2 * 1000;     //普攻1 的间隔
    private bShotLeft1: boolean;     //普1 方向
    private bShotIndex1: number;     //普1 位置
    private bShotTime1_boss4: number;    //普1 子弹的发射时间
    private btime1_boss4: number;       //普1 的开始时间
    private btime2_boss4: number;      //普通攻击2开始的时间
    private bGasTime2_boss4: number;    //普2 聚气开始的时间
    private readonly continuedTime2_boss4: number = 6000; //聚气的持续时间
    private readonly bStartInterval2_boss4 = 2000;  // 聚气后两秒开始
    private readonly bInterval2_boss4: number = 0.1 * 1000;    //普2 子弹间隔时间
    private bShotIndex2: number;     //普2 位置

    private isBSkill1: boolean;      //是技能1
    private isBSkill2: boolean;    // skill2   是技能2
    private skillNum1_boss4: number;    //技能1 发射的次数 触发由骨骼事件触发
    private skillStopTime_boss4: number;    //技能1 停止的时候的事件

    private readonly skillStopInterval1_boss4: number = 3000;    //技能1停止的时间
    private readonly skillContinued2_boss4: number = 4000;   //技能2 持续的时间
    private skillStartTime_boss4: number;       //技能2 的开始的时间
    private skillBStartTime_boss4: number;      //技能2 的子弹的发射时间
    private readonly skillInterval2_boss4: number = 0.1 * 1000;  //技能2发射的间隔

    private readonly nBSkillInterval: number = 10000;     //终极技能的触发的 间隔
    private nBSkillEndTime: number;     //终极技能结束的时间
    /**
     * boss5相关 变量
     */
    //普通攻击1 子弹再分裂出去之前能被打掉
    private readonly bCommTotal1_boss5: number = 4;    //普通攻击1每次总数量
    private containerB1_boss5: Array<Laya.Sprite>;     //普攻1 子弹的容器
    private waveLastTime_boss5: number;                //记录普攻1的上次的发射时间
    private readonly bCommInterval1_boss5: number = 1.5 * 1000;     //每两发之间的间隔
    private readonly bCommWave1_boss5: number = 2 * 1000;     //每波之间的间隔
    private bCommWaveIndex1: number;          //记录当前的波数
    private readonly bCommBomeNum2_boss5: number = 20;   //每发 普2子弹会分裂出20发

    private skillLastTime_boss5: number;    //记录技能上次发射的时间 技能1||技能2
    private skillStartTime_boss5: number;    //记录技能开始的时间
    private readonly skillContinuedTime1_boss5: number = 5000;     //技能1持续5s
    private readonly skillChangeStopTime1: number = 3000;         //技能1过后停顿3s
    private readonly skillInterval1_boss5 = 0.1 * 1000;          //技能1的间隔
    private readonly skillInterval2_boss5 = 0.2 * 1000;         //技能2的间隔
    private readonly skillContinuedTime2_boss5: number = 5000;   //技能2持续5s
    private readonly skillChangeStopTime2: number = 5000;    //技能2过后再停顿5s技能1
    private skillStopStartTime: number;     //技能放完后停顿开始的点

    // private readonly 
    /**
     * boss1相关
     */
    private commBulletTime_boss1: number;       //上次发射的时间
    private commBulletContinueTime_boss1: number;   //发射的持续时间
    private commBStatus_boss1: string;          //普通攻击的状态 cooling  shoting
    private readonly commBInterval_boss1: number = 150;
    private commBulletDiffTime_boss1: number;    //不同位置上的上次发射的时间
    private readonly commBulletInterval_boss1: number = 6000;   //每隔6s停顿
    private readonly stopShotTime: number = 2500;    //停顿的时间
    private nowBulletPlace: number;      //记录还未创建一圈的时候的位置
    private isCircleing: boolean = true;   //正在初始创建转圈
    private readonly circleNums: number = 20; //没圈 20个
    private commBIndex: number;         //第二种普通子弹发射第index 次
    private readonly commBShotNums = 6;  //第二种普通子弹每发射6 次停顿4次的时间
    private commBStopIndex: number;
    private commBStopNums: number = 4;
    private isCommonBStop: boolean;     //是否是第二种普通子弹的停顿状态

    private canCreateSkill1_boss1: boolean = true;     //是否能够创建boss1的第一个技能 || 子弹是否都消失了
    private readonly shotNumsSkill1_boss1: number = 18; //每次创建18个
    private nowNumOneLieSkill1_boss1: number;   //现在是当前位置创建的第n个 根据n调整后续角度   || 通用boss3
    private readonly oneLieSkillInterval1_boss1: number = 0.05 * 1000;  //每个位置创建下一个的间隔 
    private timeLastSkill1_boss1: number;   //上次创建的时间 boss1的第一个技能

    private timeLastSkill2_boss1: number;
    private readonly skillInterval2_boss1: number = 6000;   //boss1的技能2 发射间隔
    private skillStatus2_boss1: number;     //boss1技能2状态  preSkill stand 
    private readonly skillBNum2_boss1: number = 3;   //每次同时发射的孢子的数量

    /**
     * boss2相关
     */
    private triggerSkill: boolean;   //触发技能
    private commBulletTime: number;   //普通子弹的上一次的创建时间
    private readonly commBulletInterval: number = 4000;
    private readonly commBulletNumOne: number = 60;      //每次创建30个
    private commBulletWave: number;   //记录普通子弹得波数
    private readonly commBulletWaveInterval: number = 3000;  //每三波停顿时间
    private readonly skillInterval: number = 5000;   //技能间隔
    private skillBulletTime: number;
    private readonly ionPaoInterval: number = 1000;   //离子炮间隔时间
    private readonly ionPaoLifeTime: number = 3000;  //离子炮 存活时间
    private ionPaoTime: number;
    private readonly ionPaoSpeed1: number = 10;  //离子炮速度1
    private readonly ionPaoSpeed2: number = 4;  //离子炮速度2


    //skill释放技能 coolSkill技能冷却   skillPre释放之前动作 
    /**
     * boss的移动大部分是吧统一  蝎子怪除外
     */
    onBossUpdate() {
        switch (this.nick) {
            case Data2.enemyToPerfab.boss2:
                this.move_boss2();
                this.attack_boss2();
                break;
            case Data2.enemyToPerfab.boss1:
                this.move_boss2();
                this.attack_boss1();
                break;
            case Data2.enemyToPerfab.boss3:
                this.move_boss2();
                this.attack_boss3();
                break;
            case Data2.enemyToPerfab.boss4:
                this.move_boss2();
                this.attack_boss4();
                break;
            case Data2.enemyToPerfab.boss5:
                this.move_boss2();
                this.attack_boss5();
                break;

            default:
                break;
        }
        return;
        if (Date.now() - this.createBulletTime >= this.bulletObj.shootSpeed) {
            this.createBulletTime = Date.now();
            if (this.bossStatus != "skill" && this.bossStatus != "skillPre") {
                switch (this.nick) {
                    case Data2.enemyToPerfab.boss1:
                        this.createBullet_boss1();
                        break;
                    case Data2.enemyToPerfab.boss2:
                        this.createBullet();
                        break;
                    case Data2.enemyToPerfab.boss3:
                        this.createBullet_boss3();
                        break;
                    case Data2.enemyToPerfab.boss4:
                        //冰怪
                        this.createBullet_boss4();
                        break;
                    case Data2.enemyToPerfab.boss5:
                        //火怪
                        this.createBullet_boss5();
                        break;
                    default:
                        break;
                }
            }
        }
        if (this.bossStatus === "stand") {
            !this.bossMoveInterval && (this.bossMoveInterval = tools.random(2000, 4000));
            if (Date.now() - this.bossMoveTime >= this.bossMoveInterval) {
                this.bossStatus = "move";
                this.bossMoveInterval = null;
                this.bossMoveTime = Date.now();
                Laya.Tween.to(this.enmeySprite, { x: Tool.random(0, Laya.stage.width - (this.enmeySprite.width || 140) / 2) }, 1200, null, Laya.Handler.create(this, this.bossMoveEnd), null, true, true);
            }
        }
        if (this.bossStatus === "stand") {
            if (Date.now() - this.bossSkillTime >= this.bossSkillInterval) {
                this.bossSkillTime = Date.now();
                console.log("boss开始释放技能！");

                this.bossStatus = "skillPre";
                this.nick !== Data2.enemyToPerfab.boss3 && this.playAction(bossDragonAction.skill);
                // if (this.nick !== Data2.enemyToPerfab.boss1 && this.nick !== Data2.enemyToPerfab.boss2 && this.nick !== Data2.enemyToPerfab.boss4) {
                //     Laya.timer.once(this.nick === Data2.enemyToPerfab.boss5 ? 3500 : 1000, this, this.skillEnd);
                // }
                switch (this.nick) {
                    case Data2.enemyToPerfab.boss1:
                        //this.setBossSkill_boss1();
                        break;
                    case Data2.enemyToPerfab.boss2:
                        //this.setBossSkill();
                        break;
                    case Data2.enemyToPerfab.boss3:

                        this.setBossSkill_boss3();
                        break;
                    case Data2.enemyToPerfab.boss4:
                        //this.setBossSkill_boss4();
                        break;
                    case Data2.enemyToPerfab.boss5:
                        // this.skillDateNow = Date.now();
                        // this.createBulletPlaceByBoss5 = 0;
                        // this.setBossSkill_boss5();
                        break;
                    default:
                        break;
                }

            }
        }
        if (this.nick === Data2.enemyToPerfab.boss5 && this.bossStatus === "skill" && (Date.now() - this.skillDateNow) >= 500) {

            this.setBossSkill_boss5();
        }
    }
    /**
     * boss1 释放技能
     */
    setBossSkill_boss1() {
        Laya.timer.once(200, this, this.setSkill_createSpore);
    }
    /**
     * setBossSkill_boss3释放技能
     */
    setBossSkill_boss3() {
        //toast.noBindScript("开始锁定！！！");
        Laya.Pool.getItemByCreateFun("focusRole", this.focusRole, this);
        Laya.Tween.to(this.enmeySprite, { x: PlayingSceneControl.instance.roleObj.x, y: PlayingSceneControl.instance.roleObj.y }, 1900, null, Laya.Handler.create(this, this.bossMoveEnd), 500, true);
    }
    private warnSK: Laya.Skeleton;
    focusRole() {
        const sk: Laya.Skeleton = new Laya.Skeleton();
        //sk.loadImage("")
        sk.url = "dragonbones/" + "miaozhun" + ".sk";
        sk.pos(60, -50);
        // sk.on(Laya.Event.STOPPED, this, (sk) => {
        //     sk.removeSelf();
        //     Laya.Pool.recover("focusRole", sk);
        // }, [sk]);
        return sk;
    }
    /**
     * boss4释放技能
     */
    setBossSkill_boss4() {
        const bulletObj = this.bulletObj;
        let i: number = 0;
        const iceNum: number = 4;
        //186-25-50        186-25  186+25 186+25+50
        let startX: number;
        for (i; i < iceNum; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);

            if (i === 0) {
                if (this.enmeySprite.x + 186 - 25 - 50 < 0) {
                    startX = 0;
                } else if (this.enmeySprite.x + 186 + 25 + 50 > Laya.stage.width) {
                    startX = Laya.stage.width - 50 - 25 - 25 - 50;
                } else {
                    startX = this.enmeySprite.x + 186 - 25 - 50;
                }
            }
            b_instance.pos(startX + i * 100, this.enmeySprite.y + 207 + 10);

            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            (b_instance.getChildByName("img") as Laya.Sprite).visible = false;
            const sk = b_instance.getChildByName("sk") as Laya.Skeleton;
            sk.visible = true;
            sk.url = "dragonbones/bingzhui.sk";
            // Laya.stage.addChild(b_instance);
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
    }
    /**
     * setBossSkill_boss5
     */
    private createBulletPlaceByBoss5: number;
    setBossSkill_boss5() {
        const posX: Array<number> = [97, 179, 258, 344, 258, 179, 97];

        const bulletObj = this.bulletObj;

        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        b_instance.pos(this.enmeySprite.x + posX[this.createBulletPlaceByBoss5], this.enmeySprite.y + 298);
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        //boss子弹leix
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill;

        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        b_instance.getChildByName("img").visible = false;
        const sk: Laya.Skeleton = (b_instance.getChildByName("sk") as Laya.Skeleton);
        sk.url = "dragonbones/huoqiu.sk"
        sk.visible = true;
        // Laya.stage.addChild(b_instance);
        PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        this.createBulletPlaceByBoss5++;
        if (posX.length === this.createBulletPlaceByBoss5) {
            Laya.timer.once(1000, this, this.skillEnd);
            this.playAction(Data2.bossDragonAction.stand);
        }
    }
    /**
     * boss1 创建孢子
     */
    setSkill_createSpore() {
        Laya.timer.clear(this, this.setSkill_createSpore);
        const bulletObj = this.bulletObj;
        //三个孢子
        let i: number = 1;
        const markXY = { 1: 186 - 70, 2: 186, 3: 186 + 70 };
        for (i; i < 4; i++) {

            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            b_instance.pos(this.enmeySprite.x + markXY[i], this.enmeySprite.y + 207 + 70 + 90);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.display;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            b_instance.getChildByName("img").visible = false;
            const sk: Laya.Skeleton = b_instance.getChildByName("sk") as Laya.Skeleton;
            //sk.url = "dragonbones/baozi.sk";
            sk.visible = false;
            sk.load("dragonbones/baozi.sk", Laya.Handler.create(this, (markSk) => {
                markSk.visible = true;
            }, [sk]));


            // Laya.stage.addChild(b_instance);
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }

        // Laya.timer.once(200, this, this.setSkill_spore);
    }

    /**
     * boss释放技能
     */
    setBossSkill() {
        const bulletObj = this.bulletObj;
        //每次发射三排子弹
        let i: number = 1;
        for (i; i <= 3; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            b_instance.pos(this.enmeySprite.x + 186, this.enmeySprite.y + 207);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            // Laya.stage.addChild(b_instance);
            (b_instance.getChildByName("img") as Laya.Sprite).visible = false;
            const sk: Laya.Skeleton = (b_instance.getChildByName("sk") as Laya.Skeleton);
            sk.visible = true;
            sk.url = "dragonbones/xuanfeng.sk";
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
    }
    bossMoveEnd(): void {
        this.bossStatus = "stand";
    }
    skillEnd() {
        this.bossStatus = "stand";
    }
    SK_listener(e: string) {
        switch (e) {
            case Laya.Event.STOPPED:
                switch (this.nick) {
                    case Data2.enemyToPerfab.boss2:
                        if (this.bossStatus == "skillPre") {
                            this.createSkill_b2();
                            this.bossSK.play(bossDragonAction.stand, true);
                            this.bossStatus = "skill";
                            this.skillBulletTime = Date.now();
                            this.playAction(bossDragonAction.stand);
                        } else {
                            this.playAction(bossDragonAction.stand);
                        }
                        break;
                    case Data2.enemyToPerfab.boss1:
                        this.playAction(bossDragonAction.attack);
                        break;
                    case Data2.enemyToPerfab.boss3:
                        this.playAction(bossDragonAction.attack);
                        break;
                    case Data2.enemyToPerfab.boss4:
                        this.playAction(bossDragonAction.stand);
                        break;
                    case Data2.enemyToPerfab.boss5:
                        this.playAction(bossDragonAction.attack);
                    default:
                        break;
                }

                return;
                if (this.bossStatus == "skillPre") {
                    this.bossStatus = "skill";
                    Laya.timer.once(1000, this, this.skillEnd);
                    switch (this.nick) {
                        case Data2.enemyToPerfab.boss1:
                            this.setBossSkill_boss1();
                            break;
                        case Data2.enemyToPerfab.boss2:
                            this.setBossSkill();
                            break;
                        case Data2.enemyToPerfab.boss3:

                            this.setBossSkill_boss3();
                            break;
                        case Data2.enemyToPerfab.boss4:
                            this.setBossSkill_boss4();
                            break;
                        case Data2.enemyToPerfab.boss5:
                            this.skillDateNow = Date.now();
                            this.createBulletPlaceByBoss5 = 0;
                            this.setBossSkill_boss5();
                            break;
                        default:
                            break;
                    }
                }
                this.playAction(bossDragonAction.stand);
                break;
            default:
                break;
        }
    }
    SK_action(e: Laya.EventData): void {
        switch (e.name) {
            case "commshot2":
                console.error("创建boss1普通子弹2");
                this.createCommBullet2_b1();
                break;
            case "rightshot":
                this.calSkillNum_boss4();
                break;
            case "leftshot":
                this.calSkillNum_boss4();

                break;
            default:
                break;
        }
    }
    calSkillNum_boss4() {

        this.attackSkill_boss4();
        if (++this.skillNum1_boss4 == 2) {
            this.skillStartTime_boss4 = Date.now();
            this.skillBStartTime_boss4 = this.skillStartTime_boss4;
            this.isBSkill2 = true;

        }
        //发射四次 boss1停顿n s
        if (this.skillNum1_boss4 === 4) {
            this.isBSkill1 = false;
            this.skillNum1_boss4 = 0;
            this.playAction(bossDragonAction.attack);
            this.skillStopTime_boss4 = Date.now();
        }
    }
    //boss2放普通子弹 
    createBullet(): void {
        const bulletObj = this.bulletObj;
        //每次发射三排子弹
        let i: number = 1;
        for (i; i <= 3; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            b_instance.pos(this.enmeySprite.x + 186, this.enmeySprite.y + 207);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
            //方向
            b_instance.vars_.propertyObj.directType = i;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            const sk: Laya.Skeleton = b_instance.getChildByName("sk") as Laya.Skeleton;
            sk.visible = false;
            (b_instance.getChildByName("img") as Laya.Sprite).visible = true;
            // Laya.stage.addChild(b_instance);
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
    }
    /**
     * boss3普通子弹
     */
    createBullet_boss3() {
        const bulletObj = this.bulletObj;
        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        b_instance.pos(this.enmeySprite.x + 108, this.enmeySprite.y + 309);
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        //boss子弹leix
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        // Laya.stage.addChild(b_instance);
        PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
    }
    /**
     * boss4的普通子弹
     */
    createBullet_boss4() {
        if (this.bulletPosInBoss4 === void 0 || this.bulletPosInBoss4 === 2) {
            this.bulletPosInBoss4 = 1;
        } else {
            this.bulletPosInBoss4 = 2;
        }
        const posMarkPlus = { 1: -70, 2: 460 };
        const bulletObj = this.bulletObj;
        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        b_instance.pos(this.enmeySprite.x + posMarkPlus[this.bulletPosInBoss4], this.enmeySprite.y + 288);
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        //boss子弹leix
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        //

        // Laya.stage.addChild(b_instance);
        b_instance.getChildByName("img").visible = true;
        const sk = b_instance.getChildByName("sk") as Laya.Skeleton;
        sk.stop();
        sk.visible = false;
        PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
    }
    /**
     * boss5的普通子弹
     */
    createBullet_boss5() {
        const bulletNum: number = 4;
        const posArr: Array<number> = [-178, -78, 520, 620];
        let i: number = 0;
        for (i; i < bulletNum; i++) {
            const bulletObj = this.bulletObj;
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            b_instance.pos(this.enmeySprite.x + posArr[i], this.enmeySprite.y + 210);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            //标记位置
            b_instance.vars_.propertyObj.directType = i + 1;
            (b_instance.getChildByName("img") as Laya.Image).visible = true;
            const sk: Laya.Skeleton = b_instance.getChildByName("sk") as Laya.Skeleton;
            sk.stop();
            sk.visible = false;
            // Laya.stage.addChild(b_instance);
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
    }
    /**
     * boss1普通子弹
     */
    createBullet_boss1() {
        const bulletObj = this.bulletObj;
        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        b_instance.pos(this.enmeySprite.x + 186, this.enmeySprite.y + 207);
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        //boss子弹leix
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        (b_instance.getChildByName("img") as Laya.Image).visible = true;
        const sk: Laya.Skeleton = (b_instance.getChildByName("sk") as Laya.Skeleton);
        sk.stop();
        sk.visible = false;
        // Laya.stage.addChild(b_instance);
        PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
    }
    playAction(actionName: bossDragonAction): void {
        switch (actionName) {
            case bossDragonAction.stand:
                if (this.bossSK.templet) {
                    this.bossSK.play(actionName, true);
                }
                break;
            case bossDragonAction.attacked:
                if (this.nick !== Data2.enemyToPerfab.boss4 && this.bossStatus !== "skillPre" && this.bossSK.templet) {
                    this.bossSK.play(actionName, false, false);
                }
                break;
            case bossDragonAction.attack:
                this.bossSK.play(actionName, true);
                break;
            case bossDragonAction.skill:
                //boss5的时候skill action 持续知道7颗火球放完
                const isLoop = this.nick === Data2.enemyToPerfab.boss5;

                this.bossSK.play(actionName, isLoop, false);
                if (isLoop) {
                    this.bossStatus = "skill";
                    this.skillDateNow = Date.now();
                    this.createBulletPlaceByBoss5 = 0;
                    this.setBossSkill_boss5();
                }
            case bossDragonAction.skill1:
                //只针对boss4 冰怪
                this.bossSK.play(actionName, true);
                break;
            default:
                break;
        }
    }
    moveVarInit() {
        this.isMoving = tools.random(0, 1) ? true : false;
        this.statusContinueTime = Date.now();
        this.statusContinueInterval = 3;
        this.nowBossDirector = this.enmeySprite.x > 195 ? "left" : "right";
    }
    /**
     * 所有的boss的移动逻辑
     */
    private isMoving: boolean;  //是否是移动状态
    private nowBossDirector: string;   //移动的方向

    private statusContinueTime: number;
    private statusContinueInterval: number;
    move_boss2() {
        if (this.nick === Data2.enemyToPerfab.boss3 && this.bossStatus === "followUping") {
            return;
        }
        if (this.isMoving) {
            if (Date.now() - this.statusContinueTime >= this.statusContinueInterval * 1000) {
                this.isMoving = false;
                this.statusContinueTime = Date.now();
                this.statusContinueInterval = tools.random(2, 5);
            } else {
                if (this.nowBossDirector === "left") {
                    this.enmeySprite.x -= 1.5;
                    if (this.enmeySprite.x < this.moveAreaPos.x1) {
                        this.isMoving = false;
                        this.statusContinueTime = Date.now();
                        this.statusContinueInterval = tools.random(2, 5);
                    }
                } else {
                    this.enmeySprite.x += 1.5;
                    if (this.enmeySprite.x > this.moveAreaPos.x2) {
                        this.isMoving = false;
                        this.statusContinueTime = Date.now();
                        this.statusContinueInterval = tools.random(2, 5);
                    }
                }

            }
        } else {
            if (Date.now() - this.statusContinueTime >= this.statusContinueInterval * 1000) {
                this.isMoving = true;
                this.statusContinueTime = Date.now();
                this.statusContinueInterval = tools.random(4, 10);
                this.nowBossDirector = this.enmeySprite.x > 195 ? "left" : "right";
            }
        }
    }
    attack_boss2() {
        // console.log("怪物还剩下的血量比例~~~~~~~~", (this.hp / this.startHp));
        if (!this.triggerSkill && (this.hp / this.startHp) < 0.5) {
            this.triggerSkill = true;
            this.bossStatus === "coolSkill";
        }
        if (this.triggerSkill) {
            this.attackSkill_boss2();
        } else {
            this.attackComm_boss2();
        }
    }

    attackComm_boss2() {
        if (Date.now() - this.commBulletTime >= this.commBulletInterval) {
            if (this.bossStatus === "skillPre") {
                return;
            }
            this.commBulletTime = Date.now();
            this.createCommBullet_b2();
        }
    }
    /**
     * boss2旋风技能
     */
    attackSkill_boss2() {
        if (this.bossStatus === "coolSkill" && Date.now() - this.skillBulletTime >= this.skillInterval) {
            this.bossStatus = "skillPre";
            this.bossSK.play(bossDragonAction.skill, false);
            //重置普通子弹得创建时间
            this.commBulletTime = Date.now();
        } else {
            this.bossStatus === "skill" && (this.bossStatus = "coolSkill");
            if (this.bossStatus === "coolSkill") {
                if (Date.now() - this.ionPaoTime >= this.ionPaoInterval) {
                    this.ionPaoTime = Date.now();
                    this.createIon_b2();
                }
                this.attackComm_boss2();
            }
        }
    }
    createIon_b2() {
        const bulletObj = this.bulletObj;
        let bconfig_scale = Number(bulletObj.bconfigProperty(3, "scale"));
        let bconfig_layer = Number(bulletObj.bconfigProperty(3, "layer"));

        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        b_instance.pos(this.enmeySprite.x + 186, this.enmeySprite.y + 207);
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        //boss子弹leix
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.ion;
        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        (b_instance.getChildAt(0)).visible = false;
        //需要在之前选个地方预加载
        SkeletonTempletManage.getInstance().play(Data2.templetType.other, "pao", "boss2_pao", true, { x: 25.5, y: 26 }, b_instance, null, "sk");
        b_instance.scale(bconfig_scale, bconfig_scale);
        if (bconfig_layer === 1) {
            PlayingSceneControl.instance.bulletParentUp_enmey.addChild(b_instance);
        } else {
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }

    }
    /**
     * boss2旋风创建
     */
    createSkill_b2() {
        let i: number = 0;
        const bulletObj = this.bulletObj;

        let bconfig_scale = Number(bulletObj.bconfigProperty(2, "scale"));
        let bconfig_layer = Number(bulletObj.bconfigProperty(2, "layer"));
        for (i; i < 3; i++) {
            const randonAngle: number = tools.random(30, 150);
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            b_instance.pos(this.enmeySprite.x + 186, this.enmeySprite.y + 207);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill;
            //方向
            b_instance.vars_.propertyObj.directType = randonAngle;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            (b_instance.getChildByName("img") as Laya.Image).visible = false;
            //需要在之前选个地方预加载
            SkeletonTempletManage.getInstance().play(Data2.templetType.other, "xuanfeng", "xuanfeng", true, { x: 102, y: 186 }, b_instance, null, "sk");
            b_instance.scale(bconfig_scale, bconfig_scale);
            if (bconfig_layer === 1) {
                PlayingSceneControl.instance.bulletParentUp_enmey.addChild(b_instance);
            } else {
                PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
            }
        }
    }
    /**
     * boss普通攻击得子弹
     */
    createCommBullet_b2() {
        const bulletObj = this.bulletObj;
        let bconfig_position = bulletObj.bconfigProperty(1, "position");
        bconfig_position = bconfig_position.split("#");
        const pos_left = { x: Number(bconfig_position[0].split("|")[0]), y: Number(bconfig_position[0].split("|")[1]) };
        const pos_right = { x: Number(bconfig_position[1].split("|")[0]), y: Number(bconfig_position[1].split("|")[1]) };


        let i: number = 0;
        for (i; i < this.commBulletNumOne; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            if (i < 30) {
                b_instance.pos(this.enmeySprite.x + pos_left.x, this.enmeySprite.y + pos_left.y);
            } else {
                b_instance.pos(this.enmeySprite.x + pos_right.x, this.enmeySprite.y + pos_right.y);
            }

            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
            //方向
            b_instance.vars_.propertyObj.directType = i < 30 ? i : (i - 30);
            (b_instance.getChildByName("img") as Laya.Image).visible = true;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
    }
    attack_boss1() {
        // console.log("怪物还剩下的血量比例~~~~~~~~", (this.hp / this.startHp));
        if (!this.triggerSkill && (this.hp / this.startHp) < 0.5) {
            this.triggerSkill = true;
            this.bossStatus === "coolSkill";
        }
        if (this.triggerSkill) {
            this.attackSkill_boss1();
            this.createBSkill2_boss1();
            this.attackComm_boss1();
        } else {
            this.attackComm_boss1();
        }
    }
    /**
     * boss1 普通攻击
     */
    attackComm_boss1() {
        if (!this.commBulletContinueTime_boss1) {
            this.commBulletContinueTime_boss1 = Date.now();
        }
        if (this.commBStatus_boss1 === "shoting" && Date.now() - this.commBulletTime_boss1 >= this.commBInterval_boss1 && this.controlBNumByOnePlace[this.circleNums - 1] < 6/*Date.now() - this.commBulletContinueTime_boss1 < this.commBulletInterval_boss1*/) {
            this.commBulletTime_boss1 = Date.now();
            this.createCommBullet_b1();
        } else {
            if (this.commBStatus_boss1 === "shoting" && this.controlBNumByOnePlace[this.circleNums - 1] >= 6/*Date.now() - this.commBulletContinueTime_boss1 >= this.commBulletInterval_boss1*/) {
                this.commBStatus_boss1 = "cooling";
                this.commBulletContinueTime_boss1 = Date.now();
            }
            if (this.commBStatus_boss1 === "cooling" && Date.now() - this.commBulletContinueTime_boss1 >= this.stopShotTime) {
                //停顿超过3s
                this.commBStatus_boss1 = "shoting";
                this.commBulletContinueTime_boss1 = Date.now();
                this.isCircleing = true;
                this.nowBulletPlace = 0;
                this.initControlBNumByOnePlaceVar();
            }
        }
    }
    /**
     * 创建boss1的普通攻击的子弹
     */
    private controlBNumByOnePlace: Array<number>;  //控制每隔位置的数量
    createCommBullet_b1() {
        // return;
        const bulletObj = this.bulletObj;
        const needCreateNum = this.isCircleing ? this.nowBulletPlace : this.circleNums;
        let i: number = 0;
        for (i; i <= needCreateNum; i++) {
            if (this.controlBNumByOnePlace[i] >= 6) {
                continue;
            }
            this.controlBNumByOnePlace[i]++;
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            b_instance.pos(this.enmeySprite.x + 162, this.enmeySprite.y + 152);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
            const startAngle = 360 - (360 / this.circleNums) * i + 180 - (this.controlBNumByOnePlace[i] - 1) * 2;
            //方向  角度
            b_instance.vars_.propertyObj.directType = startAngle > 360 ? (startAngle - 360) : startAngle;;
            b_instance.rotation = b_instance.vars_.propertyObj.directType - 90;
            const bIcon: Laya.Image = (b_instance.getChildByName("img") as Laya.Image);
            bIcon.skin = "face/花种小子弹.png";
            bIcon.visible = true;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;

            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
        if (this.isCircleing && ++this.nowBulletPlace >= this.circleNums) {
            this.isCircleing = false;
        }
    }
    /**
     * 创建boss1的第二种普通子弹~   boss张嘴触发
     */
    createCommBullet2_b1() {
        if (this.isCommonBStop) {
            if (++this.commBStopIndex > this.commBStopNums) {
                this.isCommonBStop = false;
                this.commBIndex = 0;
            }
        } else {
            const bulletObj = this.bulletObj;
            const randomR = tools.random(45, 135);
            const pos = tools.speedXYByAngle(randomR, 380 / 2);

            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            b_instance.pos(this.enmeySprite.x + pos.x, this.enmeySprite.y + pos.y);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common2;
            //方向  角度
            b_instance.vars_.propertyObj.directType = randomR;
            (b_instance.getChildByName("img") as Laya.Image).visible = false;

            //需要在之前选个地方预加载
            SkeletonTempletManage.getInstance().play(Data2.templetType.other, "pao", "boss2_pao", true, { x: 25.5, y: 26 }, b_instance, null, "sk");
            b_instance.scale(2, 2);

            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            PlayingSceneControl.instance.bulletParentUp_enmey.addChild(b_instance);
            if (++this.commBIndex >= this.commBShotNums) {
                this.isCommonBStop = true;
                this.commBStopIndex = 0;
            }
        }
    }
    /**
     * boss1技能攻击
     */
    //boss1技能1子弹对象
    private obj_bossBSkill1: any;
    attackSkill_boss1() {
        // return;
        if (this.canCreateSkill1_boss1) {
            if (Date.now() - this.timeLastSkill1_boss1 >= this.oneLieSkillInterval1_boss1) {
                this.timeLastSkill1_boss1 = Date.now();

                let i: number = 0;
                const bulletObj = this.bulletObj;
                for (i; i < this.shotNumsSkill1_boss1; i++) {
                    const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
                    b_instance.pos(this.enmeySprite.x + 162, this.enmeySprite.y + 152);
                    if (!b_instance.vars_) {
                        b_instance.vars_ = {};
                    }
                    b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
                    //boss子弹leix
                    b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill;
                    //方向  角度
                    b_instance.vars_.propertyObj.directType = (360 / this.shotNumsSkill1_boss1) * i - (this.nowNumOneLieSkill1_boss1 * 0.5);
                    (b_instance.getChildByName("img") as Laya.Image).visible = false;
                    //发射子弹的boss的nick
                    b_instance.vars_.propertyObj.fromNick = this.nick;
                    this.obj_bossBSkill1.push(b_instance);

                    SkeletonTempletManage.getInstance().play(Data2.templetType.other, "zd", "zd", true, { x: 45, y: 44 }, b_instance, null, "sk");
                    PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
                }
                if (++this.nowNumOneLieSkill1_boss1 >= 5) {
                    this.canCreateSkill1_boss1 = false;
                }
            }

        } else {
            let allCancel = true;
            let i: number = 0;
            for (i; i < this.obj_bossBSkill1.length; i++) {
                if ((this.obj_bossBSkill1[i] as Laya.Sprite).parent && this.obj_bossBSkill1[i].vars_.propertyObj.bossBulletType === Data2.bossBulletType.skill) {
                    allCancel = false;
                    break;
                }
            }
            if (allCancel) {
                this.canCreateSkill1_boss1 = true;
                this.nowNumOneLieSkill1_boss1 = 0;
                this.obj_bossBSkill1 = [];
            }
        }
    }
    /**
     * boss1技能2
     */
    //生成的孢子都放进去
    private bSkillObj1_boss1: any;
    createBSkill2_boss1() {
        if (Date.now() - this.timeLastSkill2_boss1 >= this.skillInterval2_boss1) {
            this.timeLastSkill2_boss1 = Date.now();
            const bulletObj = this.bulletObj;
            //三个孢子
            let i: number = 1;
            const markXY = { 1: { x: 223, y: 210 }, 2: { x: 156, y: 186 }, 3: { x: 107, y: 177 } };
            for (i; i < 4; i++) {

                const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
                b_instance.pos(this.enmeySprite.x + markXY[i].x, this.enmeySprite.y + markXY[i].y);
                if (!b_instance.vars_) {
                    b_instance.vars_ = {};
                }
                b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
                //boss子弹leix
                b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.display;
                //发射子弹的boss的nick
                b_instance.vars_.propertyObj.fromNick = this.nick;
                b_instance.getChildByName("img").skin = "face/花种子弹.png"
                b_instance.rotation = -90 + 45 * i;
                //方向  角度
                b_instance.vars_.propertyObj.directType = 45 * i;
                // Laya.stage.addChild(b_instance);
                this.bSkillObj1_boss1.push(b_instance);
                PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
            }
            Laya.timer.once(1000, this, this.removeBaoZiFromParent);
        }
    }
    /**
     * 创建由孢子分裂出来的子弹
     */
    attackSkill2_boss1(pos: any) {
        let i: number = 0;
        const bulletObj = this.bulletObj;
        //每次分裂出4个孢子
        for (i; i < 4; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            b_instance.pos(pos.x, pos.y);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill2;
            //方向  角度
            b_instance.vars_.propertyObj.directType = 45 + 90 * i;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            const img: Laya.Image = b_instance.getChildByName("img");
            img.skin = "face/花种分裂子弹.png"
            img.visible = true;

            b_instance.rotation = 45 + 90 * i;
            // Laya.stage.addChild(b_instance);
            this.bSkillObj1_boss1.push(b_instance);
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
    }
    removeBaoZiFromParent() {
        if (!Array.isArray(this.bSkillObj1_boss1)) {
            return;
        }
        Laya.timer.clear(this, this.removeBaoZiFromParent);
        let objS: any = [];
        let i: number = 0;
        for (i; i < this.bSkillObj1_boss1.length; i++) {
            objS.push(this.bSkillObj1_boss1[i]);
        }
        if (Array.isArray(objS)) {
            let j: number = 0;
            for (j; j < objS.length; j++) {
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, "baozha", "baozi", false, { x: objS[j].x, y: objS[j].y }, Laya.stage, null, "sk");
                this.attackSkill2_boss1({ x: objS[j].x, y: objS[j].y });
                objS[j].removeSelf();
            }
            this.bSkillObj1_boss1 = [];
        }
    }
    /**
     *  boss3 蝎子怪的普通攻击
     */
    attack_boss3() {
        // console.log("怪物还剩下的血量比例~~~~~~~~", (this.hp / this.startHp));
        if (!this.triggerSkill && (this.hp / this.startHp) < 0.5) {
            this.triggerSkill = true;
            this.bossStatus === "endFollowUp";

        }
        if (this.triggerSkill) {
            if (this.bossStatus === "endFollowUp") {
                if (!this.isWaring_boss3) {
                    if (Date.now() - this.skillShotTime_boss3 >= this.skillBInterval_boss3) {
                        this.attackSkill_boss3();
                        this.skillShotTime_boss3 = Date.now();
                        this.skillWarnTime_boss3 = Date.now();
                    }
                } else {
                    //警告
                    if (this.warnSK && Date.now() - this.skillWarnTime_boss3 >= this.skillWarnInterval_boss3) {
                        this.warnSK.removeSelf();
                        Laya.Pool.recover("focusRole", this.warnSK);
                        this.warnSK = null;

                        this.isWaring_boss3 = false;
                        this.skillWarnTime_boss3 = Date.now();
                        this.skillShotndex_boss3 = 0;
                        this.skillShotTime_boss3 = 0;
                    } else {
                        //创建警告
                        if (!this.warnSK) {
                            this.warnSK = Laya.Pool.getItemByCreateFun("focusRole", this.focusRole, this);
                            PlayingSceneControl.instance.roleObj.addChild(this.warnSK);
                            this.skillWarnTime_boss3 = Date.now();
                        }
                    }
                }
            } else if (this.bossStatus === "followUping") {
                if (Date.now() - this.bossFollowUpTime >= this.bossFollowUpInterval) {
                    this.bossStatus = "endFollowUping";
                } else {
                    this.followUpBoss3();
                }

            } else {
                this.followUpBackBoss3();
            }
        }
        if (this.bossStatus === "endFollowUp") {
            if (this.cbStatus1_boss3 === "shot") {
                if (Date.now() - this.cbTime1_boss3 >= this.cbIntervar1_boss3) {
                    this.attackComm_boss3();
                    this.cbTime1_boss3 = Date.now();
                }
            } else {
                if (Date.now() - this.cbTime1_boss3 >= this.cbStopInterval1_boss3) {
                    this.cbStatus1_boss3 = "shot";
                    this.cbShotIndex1_boss3 = 0;
                }
            }
            if (this.cbStatus2_boss3 === "shot") {
                if (Date.now() - this.shotBTime_boss3 >= this.shotBInterval2) {
                    this.shotBTime_boss3 = Date.now();
                    this.attackComm2_boss3();
                }
            } else {
                if (Date.now() - this.shotBTime_boss3 >= (this.shotWave2_boss3 === 1 ? 1000 : this.shotWaveStopTime_boss3)) {
                    this.cbStatus2_boss3 = "shot";
                }
            }
        }

    }
    /**
     * boss5火怪 喷火boss
     */
    attack_boss5() {
        if (!this.triggerSkill && (this.hp / this.startHp) < 0.5) {
            this.triggerSkill = true;
            this.skillStartTime_boss5 = Date.now();
        }
        if (!this.triggerNBSkill && (this.hp / this.startHp) < 0.2) {
            //终极技能触发
            // this.triggerNBSkill = true;
        }
        if (this.triggerNBSkill) {
            //开始终极技能

        } else {
            if (this.triggerSkill) {
                if (this.isBSkill2) {
                    //技能2触发 
                    if (Date.now() - this.skillStartTime_boss5 < this.skillContinuedTime2_boss5) {
                        if (Date.now() - this.skillLastTime_boss5 >= this.skillInterval2_boss5) {
                            this.skillLastTime_boss5 = Date.now();
                            this.attackSkill2_boss5();
                            this.skillStopStartTime = Date.now();
                        }
                    } else {
                        //技能2放完停顿 3s
                        if (Date.now() - this.skillStopStartTime >= this.skillChangeStopTime2) {
                            this.isBSkill2 = false;
                            this.skillStartTime_boss5 = Date.now();
                        }
                    }
                } else {
                    //技能1触发
                    if (Date.now() - this.skillStartTime_boss5 < this.skillContinuedTime1_boss5) {
                        if (Date.now() - this.skillLastTime_boss5 >= this.skillInterval1_boss5) {
                            this.skillLastTime_boss5 = Date.now();
                            this.attackSkill_boss5();
                            this.skillStopStartTime = Date.now();
                        }
                    } else {
                        //技能1放完停顿 3s
                        if (Date.now() - this.skillStopStartTime >= this.skillChangeStopTime1) {
                            this.isBSkill2 = true;
                            this.skillStartTime_boss5 = Date.now();
                        }
                    }
                }
                this.attackJudge_boss5();
            } else {
                this.attackJudge_boss5();

            }
        }
    }
    /**
     * boss 4冰怪
     */
    private needChangeAni: boolean;
    attack_boss4() {
        if (!this.triggerSkill && (this.hp / this.startHp) < 0.5) {
            this.triggerSkill = true;
        }
        if (!this.triggerNBSkill && (this.hp / this.startHp) < 0.2) {
            //终极技能触发
            // this.triggerNBSkill = true;
        }
        if (this.triggerNBSkill) {

        } else {
            if (this.triggerSkill) {
                if (this.isBSkill2) {
                    if (Date.now() - this.skillStartTime_boss4 <= this.skillContinued2_boss4) {
                        if (Date.now() - this.skillBStartTime_boss4 >= this.skillInterval2_boss4) {
                            this.skillBStartTime_boss4 = Date.now();
                            this.attackSkill2_boss4();
                        }
                    } else {
                        // this.isBSkill1 = true;
                        // this.skillNum1_boss4 = 0;
                    }
                }
                if (this.isBSkill1) {
                    if (this.skillNum1_boss4 === 0 && !this.needChangeAni) {
                        this.needChangeAni = true;
                        this.changeAni_boss4();
                    }
                } else {
                    if (Date.now() - this.skillStopTime_boss4 > this.skillStopInterval1_boss4) {
                        this.isBSkill1 = true;
                        this.skillNum1_boss4 === 0;
                        this.needChangeAni = null;
                    }
                }
                this.attackJudge_boss4();
                //骨骼事件调用
                // this.attackSkill_boss4();
            } else {
                this.attackJudge_boss4();
            }
        }
    }
    changeAni_boss4() {
        this.playAction(bossDragonAction.skill1);
    }
    /**
     * boss5的普攻处理
     */
    private canB2_boss5: boolean;
    attackJudge_boss5() {
        if (this.bCommStatus === "b1") {
            if (this.bCommWaveIndex1 < 8) {
                if (Date.now() - this.waveLastTime_boss5 >= this.bCommInterval1_boss5) {
                    this.waveLastTime_boss5 = Date.now();
                    //创建普攻1
                    this.attackComm_boss5();
                    this.bCommWaveIndex1 += 2;
                }
            } else {
                this.bCommWaveIndex1 = 0;
                this.bCommStatus = "b2";
                this.canB2_boss5 = true;
            }

        } else {
            if (this.canB2_boss5) {
                this.canB2_boss5 = false;
                this.attackComm2_boss5();
                this.waveLastTime_boss5 = Date.now();
            }

        }
    }
    /**
     * boss5技能1
     */
    attackSkill_boss5() {
        const bossPos = { 0: { x: 164, y: 412 }, 1: { x: 212.1, y: 412 }, 2: { x: 265.5, y: 412 } };
        const bulletObj = this.bulletObj;
        let i: number = 0;
        for (i; i < 1; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.pos(this.enmeySprite.x + bossPos[i].x, this.enmeySprite.y + bossPos[i].x);
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill;
            b_instance.vars_.propertyObj.directType = 90;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            // (b_instance.getChildByName("img") as Laya.Image).visible = false;

            //新建一个快照先~~~
            SkeletonTempletManage.getInstance().play(Data2.templetType.other, "huozhu", "boss5texiao", true, { x: 25.5, y: 56 }, b_instance, null, "sk");
            b_instance.scale(2.5, 2.5);
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
    }

    /**
     * boss5技能2
     */
    attackSkill2_boss5() {
        //扔火球
        const bulletObj = this.bulletObj;
        const posXY = { x: tools.random(86, 375), y: -100 };
        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.pos(this.enmeySprite.x + posXY.x, this.enmeySprite.y + posXY.y);
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill2;
        const startAngle: number = tools.random(210, 330);
        const speedXy = tools.speedLabelByAngle(startAngle, bulletObj.defaultSpeedY, 0.3);
        b_instance.vars_.propertyObj.directType = { x: speedXy.x, y: speedXy.y };
        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        // (b_instance.getChildByName("img") as Laya.Image).visible = false;
        SkeletonTempletManage.getInstance().play(Data2.templetType.other, "huoqiu", "boss5texiao", true, { x: 25.5, y: 56 }, b_instance, null, "sk");
        PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
    }

    /**
     * boss5的普通攻击2
     */
    attackComm2_boss5() {
        const bulletObj = this.bulletObj;
        let i: number = 0;
        for (i; i < 2; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.pos(this.enmeySprite.x + 229, this.enmeySprite.y + 410);
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common2;
            b_instance.vars_.propertyObj.directType = tools.random(30, 30 + 120);
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            b_instance.vars_.propertyObj.createSpreadB_boss5 = this.createSpreadB_boss5;
            b_instance.vars_.propertyObj.functionThis = this;
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
    }
    /**
     * 创建散开的子弹 boss5
     */
    createSpreadB_boss5(posx, posy) {
        const bulletObj = this.bulletObj;
        let i: number = 0;
        for (i; i < this.bCommBomeNum2_boss5; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.pos(posx, posy);
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common2;
            //标记是炸裂后的子弹
            b_instance.vars_.propertyObj.isBomb = true;
            b_instance.vars_.propertyObj.directType = (360 / this.bCommBomeNum2_boss5) * i;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
        if (this.bCommStatus !== "b1") {
            this.bCommStatus = "b1";
        }
    }
    fireBossCreateB1(): FireBossBullet1 {
        const obj = new FireBossBullet1();
        return obj;
    }
    /**
     * boss5的普通攻击1
     */
    attackComm_boss5() {
        const bulletObj = this.bulletObj;
        let i: number = 1;
        // const startPos = { x: -140, y: 348 };
        const ridus = 60;   //旋转半径
        const startPosY = 388;
        let centerB: any;
        const bParentObj: FireBossBullet1 = Laya.Pool.getItemByCreateFun("fireBossB1", this.fireBossCreateB1, this);
        bParentObj.pos(0, 0);
        bParentObj.startLoop();
        Laya.stage.addChild(bParentObj);
        for (i; i < 9; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
            let markAngle = 0;
            let bPos = { x: 0, y: 0 };
            if (i > 4) {
                if (this.bCommWaveIndex1 == 0 || this.bCommWaveIndex1 == 4) {
                    bPos.x = (Laya.stage.width / 6) * 5;
                } else {
                    bPos.x = (Laya.stage.width / 6) * 4;
                }

                bPos.y = startPosY;
                b_instance.vars_.propertyObj.circleDotObj = { x: bPos.x, y: bPos.y };
                //方向
                markAngle = 270 + 90 * (i - 1 - 4);
                if (markAngle >= 360) {
                    markAngle = markAngle - 360;
                }
                b_instance.vars_.propertyObj.directType = markAngle;
            } else {
                if (this.bCommWaveIndex1 == 0 || this.bCommWaveIndex1 == 4) {
                    bPos.x = (Laya.stage.width / 6);
                } else {
                    bPos.x = (Laya.stage.width / 6) * 2;
                }

                bPos.y = startPosY;
                b_instance.vars_.propertyObj.circleDotObj = { x: bPos.x, y: bPos.y };
                //方向
                markAngle = 270 + 90 * (i - 1);
                if (markAngle >= 360) {
                    markAngle = markAngle - 360;
                }
                b_instance.vars_.propertyObj.directType = markAngle;
            }
            b_instance.pos(bPos.x, bPos.y);


            b_instance.vars_.propertyObj.createOneBullet1_boss5 = this.createOneBullet1_boss5;
            b_instance.vars_.propertyObj.functionThis = this;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            b_instance.vars_.propertyObj.canCreateChild = false;
            b_instance.vars_.propertyObj.createIndex = 0;
            b_instance.vars_.propertyObj.nowStep = 1;
            b_instance.vars_.propertyObj.ridus = ridus;
            // PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
            bParentObj.addChild(b_instance);

        }
        // bParentObj.startLoop();
    }
    /**
     * 
     * @param createPos    创建的位置
     * @param circleDotObj  圆形的位置
     * @param roundAngle    圆心角     
     * @param createIndex   总的创建到了index
     * @param createParent      父节点
     */
    createOneBullet1_boss5(createPos: any, circleDotObj: any, roundAngle: number, createIndex: number, createParent: any) {
        const bulletObj = this.bulletObj;
        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        //boss子弹leix
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
        b_instance.vars_.propertyObj.circleDotObj = circleDotObj;
        b_instance.pos(createPos.x, createPos.y);

        b_instance.vars_.propertyObj.canCreateChild = true;
        b_instance.vars_.propertyObj.createIndex = createIndex;
        b_instance.vars_.propertyObj.nowStep = 2;
        b_instance.vars_.propertyObj.ridus = 60 + 6 * createIndex;
        //方向
        b_instance.vars_.propertyObj.directType = roundAngle;
        b_instance.vars_.propertyObj.createOneBullet1_boss5 = this.createOneBullet1_boss5;
        b_instance.vars_.propertyObj.functionThis = this;

        b_instance.scaleX = Math.pow(0.8, createIndex);
        b_instance.scaleY = b_instance.scaleX;
        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        createParent.addChild(b_instance);
        // Laya.timer.frameLoop(3, this, (b_instance) => {
        //     debugger
        // },[b_instance]);
    }
    attackJudge_boss4() {
        if (this.bCommStatus === "b1") {
            if (Date.now() - this.btime1_boss4 <= this.continuedTime1_boss4) {
                //云 bone
                this.createCloud_boss4();
                if (Date.now() - this.bShotTime1_boss4 <= this.bInterval1_boss4) {
                    this.bShotTime1_boss4 = Date.now();
                    //创建普攻1
                    this.attackComm_boss4();
                }
            } else {
                this.cancelCloud_boss4();
                this.bCommStatus = "b2";
                this.btime2_boss4 = Date.now();
                this.bGasTime2_boss4 = Date.now();
                this.bShotIndex2 = 0;
                //开始聚气
                this.handerGas();
            }
        } else if (Date.now() - this.bGasTime2_boss4 <= this.continuedTime2_boss4) {
            if (Date.now() - this.bGasTime2_boss4 > this.bStartInterval2_boss4) {
                this.cancelHanderGas();
                //开始普攻2
                if (Date.now() - this.btime2_boss4 >= this.bInterval2_boss4) {
                    this.btime2_boss4 = Date.now();
                    //开始普2
                    this.attackComm2_boss4();
                }
            }
        } else {
            this.bShotIndex1 = 0;
            this.bShotLeft1 = false;
            this.bCommStatus = "b1";
            this.btime1_boss4 = Date.now();
            this.bShotTime1_boss4 = Date.now();
        }
    }
    /**
     * boss4的技能攻击 
     */
    attackSkill_boss4() {
        if (!this.isBSkill1) {
            return;
        }
        const bulletObj = this.bulletObj;
        const pointObj = new Laya.Point(this.enmeySprite.x - PlayingSceneControl.instance.roleObj.x, this.enmeySprite.y - PlayingSceneControl.instance.roleObj.y);
        pointObj.normalize();
        // this.enmeySprite.x -= this.defaultSpeedY * pointObj.x;
        // this.enmeySprite.y -= this.defaultSpeedY * pointObj.y;
        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        if (this.skillNum1_boss4 % 2) {
            b_instance.pos(this.enmeySprite.x + 469, this.enmeySprite.y + 298);
        } else {
            b_instance.pos(this.enmeySprite.x + 0, this.enmeySprite.y + 298);
        }
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        //boss子弹leix
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill;
        //方向
        b_instance.vars_.propertyObj.directType = { x: pointObj.x, y: pointObj.y };

        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        (b_instance.getChildByName("img") as Laya.Image).visible = false;
        //新建一个快照先~~~
        SkeletonTempletManage.getInstance().play(Data2.templetType.other, "bzhui", "bingzhui", true, { x: 23, y: 107 }, b_instance, null, "sk");
        PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        // if (++this.skillNum1_boss4 == 2) {
        //     this.isBSkill2 = true;
        // }
        // if (this.skillNum1_boss4 >= 4) {
        //     this.isBSkill1 = false;
        // }
    }
    /**
     * boss4技能2
     */
    attackSkill2_boss4() {
        const bulletObj = this.bulletObj;
        let i: number = 0;
        //6个每只眼睛3个
        for (i; i < 6; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);

            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill2;
            if (i < 3) {
                b_instance.pos(this.enmeySprite.x + 161, this.enmeySprite.y + 126);
                //方向
                b_instance.vars_.propertyObj.directType = 45 + i * 4;
            } else {
                b_instance.pos(this.enmeySprite.x + 293, this.enmeySprite.y + 126);
                b_instance.vars_.propertyObj.directType = 90 + 45 + (i - 3) * 4;
            }
            (b_instance.getChildByName("img") as Laya.Image).skin = "face/飞弹3_boss4.png";
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
    }
    /**
     * boss4普1
     */
    attackComm_boss4() {
        const bulletObj = this.bulletObj;
        const totalNum = 7;
        const posXy = { x: 0, y: 388 };
        if (this.bShotLeft1) {
            if (this.bShotIndex1 < 0) {
                this.bShotIndex1 = 0;
                this.bShotLeft1 = false;
            }
        } else {
            if (this.bShotIndex1 >= totalNum) {
                this.bShotLeft1 = true;
                this.bShotIndex1 = totalNum - 1;
            }
        }
        posXy.x = ((437 - 14) / totalNum) * this.bShotIndex1;
        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        b_instance.pos(this.enmeySprite.x + posXy.x, this.enmeySprite.y + posXy.y);
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        //boss子弹leix
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
        //方向
        b_instance.vars_.propertyObj.directType = 90;
        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        (b_instance.getChildByName("img") as Laya.Image).skin = "face/飞弹1_boss4.png";
        PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        if (this.bShotLeft1) {
            this.bShotIndex1--;
        } else {
            this.bShotIndex1++;
        }

    }
    /**
     * boss4普2
     */
    attackComm2_boss4() {
        const bulletObj = this.bulletObj;
        const centerPos = { x: 1.5, y: 302 };
        const centerPos2 = { x: 459, y: 302 };
        const totalNum = 36;
        if (this.bShotIndex2 >= totalNum) {
            this.bShotIndex2 = 0;
        }
        let i: number = 0;
        for (i; i < 6; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            let b_angle: number;
            if (i >= 3) {
                b_angle = (360 / totalNum) * this.bShotIndex2 + (i - 3) * 120;
            } else {
                b_angle = (360 / totalNum) * this.bShotIndex2 + i * 120;
            }
            if (b_angle > 360) {
                b_angle = b_angle - 360;
            }
            const offSetXy = tools.speedXYByAngle(b_angle, 10);
            if (i >= 3) {
                b_instance.pos(this.enmeySprite.x + offSetXy.x + centerPos.x, this.enmeySprite.y + offSetXy.y + centerPos.y);
            } else {
                b_instance.pos(this.enmeySprite.x + offSetXy.x + centerPos2.x, this.enmeySprite.y + offSetXy.y + centerPos2.y);
            }
            b_instance.rotation = b_angle - 90;
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            //boss子弹leix
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common2;
            //方向
            b_instance.vars_.propertyObj.directType = b_angle;
            // b_instance.vars_.propertyObj.markDirectType = 0;


            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            (b_instance.getChildByName("img") as Laya.Image).skin = "face/飞弹2_boss4.png";
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
        // if (this.bShotLeft2) {
        //     this.bShotIndex2--;
        // } else {
        this.bShotIndex2++;
        // }
    }
    /**
     * boss4 普1下面的云 
     */
    createCloud_boss4() {
        const sk_cloud: Laya.Skeleton = this.enmeySprite.getChildByName("sk_cloud") as Laya.Skeleton;
        if (!sk_cloud) {
            SkeletonTempletManage.getInstance().play(Data2.templetType.other, "wuqi", "boos4texiao", true, { x: 248, y: 402 }, this.enmeySprite, null, "sk_cloud");
        } else {
            sk_cloud.visible = true;
        }
    }
    cancelCloud_boss4() {
        const sk_cloud: Laya.Skeleton = this.enmeySprite.getChildByName("sk_cloud") as Laya.Skeleton;
        sk_cloud.visible = false;
    }
    /**
     * boss4 开始聚气
     */
    handerGas() {
        const sk_left: Laya.Skeleton = this.enmeySprite.getChildByName("sk_left") as Laya.Skeleton
        const sk_right: Laya.Skeleton = this.enmeySprite.getChildByName("sk_right") as Laya.Skeleton;
        if (!sk_left) {
            SkeletonTempletManage.getInstance().play(Data2.templetType.other, "jq", "boos4texiao", true, { x: 38.9, y: 322 }, this.enmeySprite, null, "sk_left");
            SkeletonTempletManage.getInstance().play(Data2.templetType.other, "jq", "boos4texiao", true, { x: 500, y: 322 }, this.enmeySprite, null, "sk_right");
        } else {
            sk_right.visible = true;
            sk_left.visible = true;
        }
    }
    /**
     * boss4 取消聚气
     */
    cancelHanderGas() {
        const sk_left: Laya.Skeleton = this.enmeySprite.getChildByName("sk_left") as Laya.Skeleton;
        const sk_right: Laya.Skeleton = this.enmeySprite.getChildByName("sk_right") as Laya.Skeleton;
        sk_left && (sk_left.visible = false);
        sk_right && (sk_right.visible = false);

    }
    /**
     * 创建普通子弹1
     */
    attackComm_boss3() {
        const bulletObj = this.bulletObj;
        const randomAngle = tools.random(this.cb1AngleRange[0], this.cb1AngleRange[1]);
        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        b_instance.pos(this.enmeySprite.x + 127, this.enmeySprite.y + 301);
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        //boss子弹leix
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
        //方向
        b_instance.vars_.propertyObj.directType = randomAngle;
        (b_instance.getChildByName("img") as Laya.Image).skin = "face/泡沫子弹_大.png";
        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        if (++this.cbShotIndex1_boss3 >= 7) {
            this.cbStatus1_boss3 = "stop";
            this.cbTime1_boss3 = Date.now();
        }
    }
    /**
     * boss3的普通子弹2
     */
    attackComm2_boss3() {
        const bulletObj = this.bulletObj;
        let i: number = 0;
        for (i; i < this.shotNumsCb2_boss3; i++) {
            const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
            b_instance.pos(this.enmeySprite.x + 127, this.enmeySprite.y + 301);
            if (!b_instance.vars_) {
                b_instance.vars_ = {};
            }
            b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
            b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
            //方向
            b_instance.vars_.propertyObj.directType = (360 / this.shotNumsCb2_boss3) * i - this.shotNumInWave_boss3 * 0.8;
            (b_instance.getChildByName("img") as Laya.Image).skin = "face/子弹类型2.png";
            b_instance.rotation = b_instance.vars_.propertyObj.directType - 90;
            //发射子弹的boss的nick
            b_instance.vars_.propertyObj.fromNick = this.nick;
            PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        }
        if (++this.shotNumInWave_boss3 >= 9) {
            this.shotNumInWave_boss3 = 0;
            if (++this.shotWave2_boss3 >= 2) {
                this.shotWave2_boss3 = 0;
            }
            this.cbStatus2_boss3 = "stop";
        }
    }
    attackSkill_boss3() {
        const bulletObj = this.bulletObj;
        const b_instance = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        b_instance.pos(this.enmeySprite.x + 127, this.enmeySprite.y + 301);
        if (!b_instance.vars_) {
            b_instance.vars_ = {};
        }
        b_instance.vars_.propertyObj = Tool.copydata(bulletObj);
        b_instance.vars_.propertyObj.bossBulletType = Data2.bossBulletType.skill;
        //方向
        b_instance.vars_.propertyObj.directType = 90;
        (b_instance.getChildByName("img") as Laya.Image).skin = "face/螃蟹子弹.png";
        b_instance.rotation = 0;
        //发射子弹的boss的nick
        b_instance.vars_.propertyObj.fromNick = this.nick;
        b_instance.vars_.propertyObj.setBossFollowVar = this.setBossFollowVar;
        b_instance.vars_.propertyObj.functionThis = this;
        PlayingSceneControl.instance.bulletParent_enemy.addChild(b_instance);
        if (++this.skillShotndex_boss3 >= 3) {
            this.isWaring_boss3 = true;
        }
    }
    setBossFollowVar() {
        this.bossStatus = "followUping";
        this.bossFollowUpTime = Date.now();
    }
    /**
     * boss3 即时跟随玩家
     */
    followUpBoss3() {
        const pointObj = new Laya.Point(this.enmeySprite.x - PlayingSceneControl.instance.roleObj.x, this.enmeySprite.y - PlayingSceneControl.instance.roleObj.y);
        pointObj.normalize();
        this.enmeySprite.x -= this.defaultSpeedY * pointObj.x;
        this.enmeySprite.y -= this.defaultSpeedY * pointObj.y;
        console.error("每次移动~~~this.defaultSpeedY * pointObj.x", this.defaultSpeedY * pointObj.x, "this.defaultSpeedY * pointObj.y", this.defaultSpeedY * pointObj.y);
        this.judgeFollowSuccess();
    }
    /**
     * boss3是否追踪成功
     */
    judgeFollowSuccess() {
        const bossPointObj = new Laya.Point(this.enmeySprite.x + 531 / 2, this.enmeySprite.y + 470 / 2);
        const distance = bossPointObj.distance(PlayingSceneControl.instance.roleObj.x, PlayingSceneControl.instance.roleObj.y);
        if (distance < (50 + (470 / 2))) {
            //结束游戏
        }
    }
    /**
     * boss3追踪结束 回到开始位置
     */
    followUpBackBoss3() {
        const startBossPos = { x: tools.random(200, 400), y: ((Laya.stage.height / 3) - this.enmeySprite.height / 2) };
        const needTime = () => {
            const bossPoint = new Laya.Point(this.enmeySprite.x, this.enmeySprite.y);
            const distance = bossPoint.distance(startBossPos.x, startBossPos.y);
            return distance / 100;
        };
        Laya.Tween.to(this.enmeySprite, { x: startBossPos.x, y: startBossPos.y }, needTime(), null, Laya.Handler.create(this, this.bossBackFinish));
    }
    bossBackFinish() {
        this.bossStatus = "endFollowUp";
    }
    /**
     * 死亡动画
     */
    playDeadSK() {

    }
    /**
     * 清理timer
     */
    clearTimes() {
        Laya.Tween.clearAll(this.enmeySprite);
        Laya.timer.clearAll(this);
    }
}







