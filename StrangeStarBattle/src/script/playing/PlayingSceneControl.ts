import tools from "./../Tools/Tool"
import PlayingVar from "../manage/Playing_var"
import EquipUpdate from "../main/EquipUpdate"
import Buff from "../role/Buff"
import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import BattleParse from "./BattleParse"
import manage from "../manage/BitmapFontMananage"
import MainWeaponData from "../manage/MainWeaponData"
import BagDataControl from "../manage/BagDataControl"
import EnemyObject from "../role/EnemyObject"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import secondWeaponMuzzlePos = Data2.secondWeaponMuzzlePos;
import secondWeaponPos = Data2.secondWeaponPos;
import DataType = Data2.DataType;
import enemyToPerfab = Data2.enemyToPerfab;
import FixedDataTables = Data.FixedDataTables;
import random = tools.random;
import LYSprite = Laya.Sprite;
import SecondWeaponData from "../manage/SecondWeaponData";
import BuffBulletInitialization from "../role/BuffBulletInitialization"
import toast from "../manage/toast";
import HttpModel from "../Connect/HttpClass"
import HttpModel2 from "../Connect/HttpEnum"
import SkeletonTempletManage from "../manage/SkeletonTempletManage";
import FireBossBullet1 from "../role/FireBossBullet1";
import OpenWx from "../manage/OpenWx";
import BulletMain from "../Bullet/BulletMain"
import Bullet from "../Bullet/BulletInterface"

import BulletType = Bullet.BulletType;
import UpBlackEffect from "../Effect/UpBlackEffect";
import role from "../role/role";
import AdaptScene from "../manage/AdaptScene";
import EndlessManage from "../manage/EndlessManage";
import LYImage = Laya.Image;
import EndlessParseSkill from "../manage/EndlessParseSkill";
import EndlessParseBoss from "../manage/EndlessParseBoss";
export default class PlayingControl extends Laya.Script {
    /** @prop {name:bullet_red,tips:"红色的子弹预制体",type:Prefab} */
    bullet_red: Laya.Prefab;
    /** @prop {name:Bullet_skill3,tips:"黄色的子弹预制体",type:Prefab} */
    Bullet_skill3: Laya.Prefab;
    /** @prop {name:Bullet_skill4,tips:"黄色的子弹预制体",type:Prefab} */
    Bullet_skill4: Laya.Prefab;
    /** @prop {name:Bullet_skill5,tips:"黄色的子弹预制体",type:Prefab} */
    Bullet_skill5: Laya.Prefab;
    /** @prop {name:Enemy_red,tips:"红色的子弹预制体",type:Prefab} */
    Enemy_red: Laya.Prefab;
    /** @prop {name:Enemy_blue,tips:"蓝色的子弹预制体",type:Prefab} */
    Enemy_blue: Laya.Prefab;
    /** @prop {name:Enemy_yellow,tips:"黄色的子弹预制体",type:Prefab} */
    Enemy_yellow: Laya.Prefab;
    /** @prop {name:enemy_special1,tips:"特殊怪物1",type:Prefab} */
    enemy_special1: Laya.Prefab;
    /** @prop {name:enemy_special2,tips:"特殊怪物2",type:Prefab} */
    enemy_special2: Laya.Prefab;
    /** @prop {name:warning,tips:"boss来袭",type:Prefab} */
    warning: Laya.Prefab;
    /** @prop {name:Boss1,tips:"boss1",type:Prefab} */
    Boss1: Laya.Prefab;
    /** @prop {name:Boss2,tips:"boss2",type:Prefab} */
    Boss2: Laya.Prefab;
    /** @prop {name:Boss3,tips:"boss3",type:Prefab} */
    Boss3: Laya.Prefab;
    /** @prop {name:Boss4,tips:"boss4",type:Prefab} */
    Boss4: Laya.Prefab;
    /** @prop {name:Boss5,tips:"boss5",type:Prefab} */
    Boss5: Laya.Prefab;
    /** @prop {name:Boss_nanguawangzi,tips:"boss5",type:Prefab} */
    Boss_nanguawangzi: Laya.Prefab;
    /** @prop {name:Boss_maowanghou,tips:"boss5",type:Prefab} */
    Boss_maowanghou: Laya.Prefab;
    /** @prop {name:Boss_dashuren,tips:"boss5",type:Prefab} */
    Boss_dashuren: Laya.Prefab;
    /** @prop {name:Boss_shitoujuren,tips:"boss5",type:Prefab} */
    Boss_shitoujuren: Laya.Prefab;
    /** @prop {name:Boss_bingqilinzuhe,tips:"BuffProgress",type:Prefab} */
    Boss_bingqilinzuhe: Laya.Prefab;
    /** @prop {name:Boss_bingtouxiang,tips:"BuffProgress",type:Prefab} */
    Boss_bingtouxiang: Laya.Prefab;
    /** @prop {name:Boss_jibaobao,tips:"BuffProgress",type:Prefab} */
    Boss_jibaobao: Laya.Prefab;
    /** @prop {name:Boss_zhangyunvhuang,tips:"BuffProgress",type:Prefab} */
    Boss_zhangyunvhuang: Laya.Prefab;
    /** @prop {name:BuffProgress,tips:"BuffProgress",type:Prefab} */
    BuffProgress: Laya.Prefab;
    /** @prop {name:Bullet_muzzle3,tips:"子弹发射的炮口",type:Prefab} */
    Bullet_muzzle3: Laya.Prefab;
    /** @prop {name:Bullet_muzzle4,tips:"子弹发射的炮口",type:Prefab} */
    Bullet_muzzle4: Laya.Prefab;
    /** @prop {name:Bullet_muzzle5,tips:"子弹发射的炮口",type:Prefab} */
    Bullet_muzzle5: Laya.Prefab;
    /** @prop {name:Bullet_skill3_enemy,tips:"Bullet_skill3_enemy",type:Prefab} */
    Bullet_skill3_enemy: Laya.Prefab;
    /** @prop {name:Bullet_skill5_enemy,tips:"Bullet_skill5_enemy",type:Prefab} */
    Bullet_skill5_enemy: Laya.Prefab;
    /** @prop {name:Bullet_skill4_enemy,tips:"Bullet_skill4_enemy",type:Prefab} */
    Bullet_skill4_enemy: Laya.Prefab;
    /** @prop {name:Bullet_boss,tips:"Bullet_boss",type:Prefab} */
    Bullet_boss: Laya.Prefab;

    /** @prop {name:Boss_hp,tips:"Boss_hp",type:Prefab} */
    Boss_hp: Laya.Prefab;
    /** @prop {name:baozha,tips:"baozha",type:Prefab} */
    baozha: Laya.Prefab;
    //子弹的打击
    /** @prop {name:zidan,tips:"zidan",type:Prefab} */
    zidan: Laya.Prefab;
    //敌人死亡的效果
    /** @prop {name:xg_baozha,tips:"xg_baozha",type:Prefab} */
    xg_baozha: Laya.Prefab;
    // //boss死亡的效果
    // /** @prop {name:boss_baozha,tips:"boss_baozha",type:Prefab} */
    // boss_baozha: Laya.Prefab;
    /** @prop {name:goldDrop,tips:"goldDrop",type:Prefab} */
    goldDrop: Laya.Prefab;
    /** @prop {name:EnemySK,tips:"EnemySK",type:Prefab} */
    EnemySK: Laya.Prefab;
    /** @prop {name:UpdateItem,tips:"UpdateItem",type:Prefab} */
    UpdateItem: Laya.Prefab;
    //private start_btn: LYSprite;
    public roleObj: LYSprite;
    //role有可能处在被受控制的状态
    public roleStatus: Data2.roleStatus;
    //被控制当时的时间戳
    public roleStatusTime: number;
    //secondRole
    public secondRoleObj: LYSprite;
    //主飞机
    public mainPlane: LYImage;
    //主飞机的w h,判断 碰撞区域使用
    public role_w: number = 120;
    public role_h: number = 110;
    //主飞机sk
    private mainPlane_sk: Laya.Skeleton;
    //主飞机 plane
    private mainPlane_pic: LYImage;
    public leftSecondWeapon: LYImage;
    public rightSecondWeapon: LYImage;
    //是否是攻击状态
    private _fighting: boolean = false;
    public bulletSpeed: number;  //主武器子弹的速度
    private bulletSpeedSecond: number; //副武器子弹的射速
    private enemyCreateTime = 200;
    private lastShotTime: number;
    private lastShotTimeSecond: number;
    public bulletParent: LYSprite;
    public bulletParent_enemy: LYSprite;
    public bulletParentUp_enmey: LYSprite;
    public EnemySpite: LYSprite;
    //1红2 蓝 3 黄
    public static bulletType: number = 1;
    private changeBulletTypeBtn: any = {};
    private arrowSprite: LYSprite;
    private dragArea: Laya.Rectangle;
    private selectModelBtn: LYSprite;
    private mainLayer: LYSprite;
    public static roleDragCan = true;
    public playing_layer: LYSprite;
    //PlayingControl的实例
    public static instance: PlayingControl;
    private moneySprite: LYSprite;
    private game;
    private bg_img1: LYImage;
    private bg_img2: LYImage;
    private bg_img3: LYImage;
    private cloud_01: LYImage;
    private cloud_02: LYImage;
    // 速度
    private readonly _moveSpeed: number = 3;
    private self: Laya.Scene;

    private readonly _weaponDistance: number = 100;
    private buffProgressParent: LYSprite;

    //杀死敌人掉落的金币的图标
    public dropGoldParent: LYSprite;
    //飞机的学条mask
    public hpBar: LYSprite;
    //飞机的橙色血条mask
    public hpBar2: LYSprite;
    //飞机当前的血量
    private _roleHp: number;
    //进度条上的小飞机
    private img_progressPlane: LYImage;
    //总血量
    public roleTotal: number;
    //松开 减慢的速率
    public readonly gameSlowBate: number = 0.1;
    private touchUpEffct: UpBlackEffect;

    public effectParent: Laya.Sprite;
    //血量值
    public label_hpNum: Laya.Label;
    //游戏暂停
    public isGamePause: boolean;
    //暂停的时间间隔
    public pauseInterval: number;
    private startPauseTime: number;
    constructor() {
        super();
        Laya.MouseManager.multiTouchEnabled = false;
        PlayingControl.instance = this;
        this.game = Laya.Browser.window.game;
        //初始化背包数据(副武器和钻石体力~)
        BagDataControl.getInstance();
        this.bulletSpeed = (0.15 - (MainWeaponData.getInstance().speed - 9) * 0.0009) * 1000;
        const secondSpeed = SecondWeaponData.getInstance().getSpeed();
        if (secondSpeed) {
            this.bulletSpeedSecond = secondSpeed * 1000/*(0.5 - (SecondWeaponData.getInstance().getSpeed() - 9) * 0.001) * 1000*/;
        } else {
            this.bulletSpeedSecond = 0;
        }
    }
    onAwake() {
        AdaptScene.getInstance().setSceneAdaptHeight();
        AdaptScene.getInstance().setBG_top(this.owner["hurted_img"]);
    }
    onEnable(): void {
        // Laya.Scene.gc();
        Laya.Browser.window.markScene = this;
        // this.sendHttp();
        this.initSomeVarObj();
        this.playMusicAndSound(0, MusicEnum.musicToUrl.bg_menu);
        PlayingVar.getInstance().gameStatus = "main";
        this.lastShotTime = Date.now();
        this.lastShotTimeSecond = Date.now();
        this.roleObj.on(Laya.Event.DRAG_MOVE, this, this.listernerDrag);
        //多点触控开启
        //Laya.MouseManager.multiTouchEnabled = true;

        for (let i = 0; i < this.selectModelBtn._children.length; i++) {
            let markBtns = this.selectModelBtn.getChildAt(i);
            if (i === 1) {
                markBtns.on(Laya.Event.MOUSE_UP, this, this.touchStartEndless);
            } else {
                markBtns.on(Laya.Event.CLICK, this, this.touchStartGameBtn);
            }
            markBtns.on(Laya.Event.MOUSE_UP, this, this.touchStartGameBtn);
            markBtns.on(Laya.Event.MOUSE_DOWN, this, this.touchStartGameBtn);
        }
        //money位置的调整
        this.initMoneyPos();
        this.setMoneyData();
        //商店
        (this.owner["shopBtn"] as Laya.Button).on(Laya.Event.CLICK, this, this.openShop);
        Laya.Browser.window.shopBtn = (this.owner["shopBtn"] as Laya.Button);
        //排行
        (this.self["rankingBtn"] as Laya.Button).on(Laya.Event.CLICK, this, this.showRanking);
        Laya.Browser.window.rankingBtn = (this.self["rankingBtn"] as Laya.Button);
        //分享
        (this.self["shareBtn"] as Laya.Button).on(Laya.Event.CLICK, this, this.startShare);
        //暂停
        (this.self["pauseBtn"] as Laya.Button).on(Laya.Event.CLICK, this, this.pauseListerer);
        //签到
        (this.self["checkInBtn"] as Laya.Button).on(Laya.Event.CLICK, this, () => {
            Laya.Scene.open("test/CheckIn_dialog.scene", false);
        });

        Laya.timer.once(800, this, this.openCheckIn);
        // this.openCheckIn();
        //副武器初始化
        this.setEquipType();
        //初始化间隔时间变量
        this.setTimeIntervalByOne();

        this.initProgressBarAndNum();
        //背景图现在每关都可能不一样
        this.changeBgByLevel();
        //兑换 监听
        const btnArr = ["btn_exchangePower", "btn_exchangeGold", "btn_exchangeDiamond"];
        let i: number = 0;
        for (i; i < btnArr.length; i++) {
            this.self[btnArr[i]].on(Laya.Event.CLICK, this, this.exchangeGoldAndStone, [i]);
        }
        //主武器和副武器 是否可升级 如果升级的话 有升级特效
        this.ckeckCanUpdate();
        //预解析部分关卡用到的龙骨的数据
        this.parseTemplate();
        //预加载部分可能战斗场景需要用到的资源~
        this.preLoadResInPlaying();
        // //初始化 role的血量等
        // this.initRoleHp();
        // Laya.Browser.window.haveEnemySprite = this.self["haveEnemySprite"];
        // this.wxUserDateUpdate();
        this.openRanking();

        // this.setLoadingScene();
        Laya.stage.on(Laya.Event.RESIZE, this, this.onResize);
    }
    onResize(arg: any) {
        console.log("onResize----:", arg, "stage.height", Laya.stage.height);
    }
    /**
     * 设置loading界面
     */
    setLoadingScene() {
        Laya.Scene.open("test/ReqLoading.scene", false, null, Laya.Handler.create(this, (loading: Laya.Scene) => {
            AdaptScene.getInstance().setBg(loading["blackSprite"]);
            loading.close();
            loading.zOrder = 3500;
            Laya.Scene.setLoadingPage(loading);
        }));
    }
    /**
     * 更新微信排行榜的数据
     */
    wxUserDateUpdate() {
        if (Laya.Browser.onMiniGame) {
            let args = { type: 2, data: Laya.Browser.window.game.nowLevel };
            OpenWx.getInstance().postMsg(args.type, args.data);
        }
    }
    /**
     * 初始化role血量
     */
    initRoleHp() {
        this.roleHp = MainWeaponData.getInstance().getRoleHp() || 20;
        this.roleTotal = this.roleHp || 20;
        console.error("飞机总的血量~~~~", this.roleTotal);
        this.label_hpNum.text = this.roleHp + "/" + this.roleTotal;
    }
    /**
     * 预解析部分关卡用到的龙骨的数据
     */
    private preResIndex: number;
    private preResNum: number;
    private preResLoaded: boolean;
    parseTemplate() {
        // SkeletonTempletManage.getInstance().play("buff", "buff", false, null, null);
        const templets = SkeletonTempletManage.getInstance().templets;
        const templetArr0 = ["buff", "diancipao", "xuhongyinqing", "liuxingpao", "mogupao", "feirenfengbao", "daodanpao", "qpbz", "fanghudun"];
        const templetArr1 = EndlessParseSkill.getInstance().getSkillEffectIds();
        const templetArr = templetArr0.concat(templetArr1);
        let i: number = 0;
        for (i; i < templetArr.length; i++) {
            if (!templets || !templets[templetArr[i]]) {
                this.preResNum++;
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, templetArr[i], templetArr[i], true, null, null, Laya.Handler.create(this, this.loadTempletFinish));

            }
        }
        //boss爆炸
        if (!templets || !templets["boss_baozha"]) {
            SkeletonTempletManage.getInstance().play(Data2.templetType.other, "boss_baozha", "boss_baozha", true, null, null);
        }
        const bossSkillEffect = ["xuanfeng", "boss2_pao", "baozi", "zd", "boos4texiao", "bingzhui", "boss5texiao"];
        i = 0;
        for (i; i < bossSkillEffect.length; i++) {
            if (!templets || !templets[bossSkillEffect[i]]) {
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, bossSkillEffect[i], bossSkillEffect[i], true, null, null);
            }
        }
        return;
        switch (Laya.Browser.window.game.nowLevel) {
            case 4:
                //5级得时候触
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, "xuanfeng", "xuanfeng", false, null, null);
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, "pao", "boss2_pao", false, null, null);
                break;
            case 16:
                //10级别
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, "baozha", "baozi", false, null, null);
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, "zd", "zd", false, null, null);
                Laya.Pool.clearBySign("boss2_pao");
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, "pao", "boss2_pao", false, null, null);

                break;
            case 28:
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, "wuqi", "boos4texiao", false, null, null);
                break;
            case 30:
                //20级别
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, "bzhui", "bingzhui", false, null, null);
                break;
            case 60:
                //25 级别 火怪 boss5
                SkeletonTempletManage.getInstance().play(Data2.templetType.other, "huozhu", "boss5texiao", false, null, null, Laya.Handler.create(this, this.testSk));
                break;
            default:
                break;
        }

        // this.testSk();
    }
    loadTempletFinish() {
        if (++this.preResIndex === this.preResNum) {
            this.preResLoaded = true;
            console.error("加载完成11111111111111-------------------");
        }
    }
    private preResIndex_e: number;
    private preResNum_e: number;
    private preResLoaded_e: boolean;
    loadTempletFinish_enemy() {
        if (++this.preResIndex_e === this.preResNum_e) {
            this.preResLoaded_e = true;
            // Laya.timer.once(4000, this, () => {

            // })
            console.error("加载完成222222222222222------------------");
        }
    }
    /**
     * 预加载部分战斗中里面需要用到的资源
     */
    preLoadResInPlaying(loadNext?: boolean) {
        /**
         * 预加载敌人sk模板数据
         */
        const ids = BattleParse.getInstance().getTempletDateInLevel(loadNext);
        const templets = SkeletonTempletManage.getInstance().templets;
        let i: string;
        var idsNum = Object.keys(ids).length;
        let names = {};
        for (i in ids) {
            const pic = FixedDataTables.getInstance().getDataByKey(Data2.DataType.monster, i, "pic");
            if (!templets[pic]) {
                this.preResNum_e++;
                SkeletonTempletManage.getInstance().play(Data2.templetType.enemy, null, pic, true, null, null, Laya.Handler.create(this, this.loadTempletFinish_enemy));
            }
            names[pic] = true;
        }
        //销毁不需要的templet纹理   无尽模式的templet存在可优化~
        if (!loadNext) {
            for (i in templets) {
                if (templets[i].templetType && templets[i].templetType === Data2.templetType.enemy) {
                    if (!names[i]) {
                        templets[i].destroy();
                        delete templets[i];
                    }
                }
            }
        }

        Laya.Browser.window.templets = SkeletonTempletManage.getInstance().templets;
    }
    /**
     * 测试sk的时候使用  
     */
    testSk() {
        //创建放着防止被回收
        //SkeletonTempletManage.getInstance().play("huoqiu", "boss5texiao", true, { x: -80, y: 450 }, Laya.stage, null, "sk");
    }
    changeBgByLevel() {
        const gameLevel = Laya.Browser.window.game.nowLevel;
        const bgPathName = FixedDataTables.getInstance().getDataByKey(Data2.DataType.battle, gameLevel, "bg");
        const pngPath = "face/" + bgPathName + ".jpg";
        this.bg_img1.skin = pngPath;
        this.bg_img2.skin = pngPath;
        this.bg_img3.skin = pngPath;
    }
    /**
     * 测试
     */
    sendHttp() {
        const args = { uuId: PlayingVar.getInstance().uuId, itemID: 104, itemNum: 1 };
        new HttpModel.HttpClass(Laya.Handler.create(this, (e) => {
            console.error(e);
        }), HttpModel2.URLSERVER + HttpModel2.httpUrls.ShopItem, JSON.stringify(args), )
    }
    completeHandler(e: any) {
        console.error(e);
    }
    errorHandler(e: any) {
        console.error("错误:", e);
    }
    processHandler(e: any) {
        console.error("进程:", e)
    }
    /**
     * 
     * @param type muic 还是sound
     * @param soundType 播放的地址
     */
    playMusicAndSound(type: number, soundType: musicToUrl) {
        if (type) {
            //sound
            Music.getInstance().playSound(soundType);
        } else {
            //musci
            Music.getInstance().playMusic(soundType);
        }
    }
    public dropBuffParent: LYSprite;
    private buffBulletInit: BuffBulletInitialization;
    initSomeVarObj(): void {
        this.self = this.owner as Laya.Scene;
        this.dropBuffParent = this.self["dropBuffParent"];

        this.bg_img1 = this.owner["bg_01"];
        this.bg_img2 = this.owner["bg_02"];
        this.bg_img3 = this.owner["bg_03"];
        this.cloud_01 = this.owner["cloud_01"];
        this.cloud_02 = this.owner["cloud_02"];
        this.bulletParent = this.self.getChildByName("bulletParent") as LYSprite;
        //血量值
        this.label_hpNum = this.self["label_hpNum"];
        //boss子弹的父节点
        this.bulletParent_enemy = this.self["bulletParent_enemy"] as LYSprite;
        this.bulletParentUp_enmey = this.self["bulletParentUp_enmey"] as LYSprite;
        this.buffProgressParent = this.self["buffProgress"];
        this.EnemySpite = this.self.getChildByName("EnemySpite") as LYSprite;

        this.roleObj = this.self.getChildByName("role_name") as LYSprite;
        Laya.Browser.window.roleObj = this.roleObj;

        this.roleStatus = null;
        this.secondRoleObj = this.self["secondWeapon"];
        Laya.Browser.window.secondRoleObj = this.secondRoleObj;
        this.secondRoleObj.visible = this.game.secondWeapon.selected ? true : false;
        this.mainPlane = this.roleObj.getChildAt(0) as LYImage;

        //飞机sk
        this.mainPlane_sk = this.mainPlane.getChildAt(0) as Laya.Skeleton;
        this.mainPlane_pic = this.self["pic_plane"];
        this.leftSecondWeapon = this.owner["leftSecondWeapon"] as LYImage;
        this.rightSecondWeapon = this.owner["rightSecondWeapon"] as LYImage;
        // this.changeBulletTypeBtn.blue = this.owner.getChildByName("btn_blue") as LYSprite;
        // this.changeBulletTypeBtn.yellow = this.owner.getChildByName("btn_yellow") as LYSprite;
        // this.changeBulletTypeBtn.red = this.owner.getChildByName("btn_red") as LYSprite;
        this.arrowSprite = this.owner.getChildByName("arrow") as LYSprite;
        this.selectModelBtn = this.owner.getChildByName("selectModelBtn") as LYSprite;
        this.mainLayer = this.owner.getChildByName("main_layer") as LYSprite;
        this.playing_layer = this.owner.getChildByName("playing_layer") as LYSprite;
        this.moneySprite = this.owner.getChildByName("moneySprite") as LYSprite;

        this.dropGoldParent = this.owner["goldDrop"] as LYSprite;
        this.hpBar = this.owner["hpBar"] as LYSprite;
        this.hpBar2 = this.owner["hpBar2"] as LYSprite;
        this.redDot_checkInBtn = this.owner["redDot_checkInBtn"] as LYSprite;
        this.img_progressPlane = this.owner["img_progressPlane"] as LYImage;
        this.effectParent = this.owner["effectParent"] as LYSprite;
        //buff子弹创建类初始化
        this.buffBulletInit = new BuffBulletInitialization();


        // Laya.Browser.window.hpBar = this.hpBar;
        this.touchUpEffct = UpBlackEffect.getInstance();
        this.preResIndex = 0;
        this.preResNum = 0;
        this.preResLoaded = false;
        this.preResIndex_e = 0;
        this.preResNum_e = 0;
        this.preResLoaded_e = false;
    }
    /**
     * role拖动的监听
     * @param e 
     */
    listernerDrag() {
        let point = new Laya.Point(this.roleObj.x - this.secondRoleObj.x, this.roleObj.y - this.secondRoleObj.y);//算出长宽差值
        point.normalize();//归一化成比例便于控制缩放
        let weaponPoint = new Laya.Point(this.secondRoleObj.x, this.secondRoleObj.y);
        let distance = weaponPoint.distance(this.roleObj.x, this.roleObj.y);
        if (distance > this._weaponDistance) {
            this.secondRoleObj.x = this.roleObj.x - point.x * this._weaponDistance;
            this.secondRoleObj.y = this.roleObj.y - point.y * this._weaponDistance;
        }
        this.weaponRegression();
        this.mainPlane_sk.visible && this.mainPlane_sk.play("fly", true);
    }
    weaponRegression(): void {
        Laya.Tween.clearAll(this.secondRoleObj);
        Laya.Tween.to(this.secondRoleObj, { x: this.roleObj.x, y: this.roleObj.y }, 100, null, Laya.Handler.create(this, function () {
        }, []), 0, null, true);
    }
    /**
     * 初始化进度条以及进度条两边的数字
     */
    private progressBar: Laya.ProgressBar;
    private progressLeftLabel: Laya.Label;
    private progressRightLabel: Laya.Label;
    private haveEnemy: Laya.FontClip;

    initProgressBarAndNum(): void {
        const self = this.owner as Laya.Scene;
        this.progressBar = self["progressBarEnemyNum"];
        this.progressLeftLabel = self["progressLeftLabel"];
        this.progressRightLabel = self["progressRightLabel"];
        this.haveEnemy = self["haveEnemy"];
        let game: any = Laya.Browser.window.game;
        this.progressBar.value = 0;
        this.progressLeftLabel.text = JSON.stringify(game.nowLevel);
        this.progressRightLabel.text = JSON.stringify(game.nowLevel + 1);
        this.setProgressBar();
    }
    setProgressBar(): void {
        const killEnemyS: number = BattleParse.getInstance().killEnemyS;
        const totalNums: number = BattleParse.getInstance().getTotalNums();
        const bate: number = killEnemyS / totalNums;
        this.progressBar.value = bate;
        this.haveEnemy.value = "" + (totalNums - killEnemyS);
        if (bate <= 0.1) {
            this.img_progressPlane.y = 343;
        } else if (bate >= 0.97) {
            this.img_progressPlane.y = 90;
        } else {
            this.img_progressPlane.y = 343 - (343 - 90) * (bate - 0.1);
        }
    }
    private canClickBtn: boolean = true;
    openShop(): void {
        if (!this.canClickBtn) {
            return;
        }
        this.setCanTouchVar();
        this.playMusicAndSound(1, musicToUrl.button_normal);
        // toast.noBindScript("稍后开启！");
        // return;
        Laya.Scene.open("test/ShopDialog.scene", false);
    }
    setCanTouchVar() {
        this.canClickBtn = false;
        Laya.timer.once(800, this, () => {
            this.canClickBtn = true;
        });
    }
    showRanking() {
        if (!this.canClickBtn) {
            return;
        }
        this.setCanTouchVar();
        this.playMusicAndSound(1, musicToUrl.button_normal);
        if (Laya.Browser.onMiniGame) {
            Laya.Scene.open("test/Ranking.scene", false);

        } else {
            toast.noBindScript("仅支持微信客户端!");
        }
    }
    startShare() {
        OpenWx.getInstance().setShare();
    }
    openRanking() {
        if (Laya.Browser.onMiniGame) {
            Laya.loader.load(["res/atlas/ranking.atlas"], Laya.Handler.create(this, () => {
                Laya.MiniAdpter.sendAtlasToOpenDataContext("res/atlas/ranking.atlas");
                Laya.timer.once(1000, this, () => {
                    Laya.Scene.open("test/Ranking.scene", false, null, Laya.Handler.create(this, (scene: Laya.Dialog) => {
                        scene.close();
                    }));
                    this.wxUserDateUpdate();
                });

            }));
        }
    }

    openCheckIn(): void {
        if (!PlayingVar.getInstance().firstTouchPlay && !PlayingVar.getInstance().checkInData.already) {
            Laya.Scene.open("test/CheckIn_dialog.scene", false);
        }
        this.setRedDotStatus();
    }
    /**
     * 设置红点状态
     */
    private redDot_checkInBtn: LYSprite;
    setRedDotStatus() {
        this.redDot_checkInBtn.visible = !PlayingVar.getInstance().checkInData.already;
    }
    openSetting(): void {
        this.playMusicAndSound(1, musicToUrl.button_normal);
        Laya.Scene.open("test/Set.scene", false);
    }
    /**
     * 初始化钱币的位置
     */
    private bodyPower: Laya.FontClip;
    private gold: Laya.FontClip;
    private diamond: Laya.FontClip;
    initMoneyPos() {
        this.bodyPower = this.self["fc_power"];
        this.gold = this.self["fc_gold"];
        this.diamond = this.self["fc_diamond"];
    }
    exchangeGoldAndStone(e: number) {
        this.playMusicAndSound(1, musicToUrl.button_normal);
        if (e === 2) {
            //打开福利~
            toast.noBindScript("暂未开放!");
        } else {
            Laya.Scene.open("test/ExchangeDialog.scene", false, e);
        }

    }
    /**
    * @param type 设置武器的类型
    */
    setEquipType(type?: any): void {
        //let secondEquipUrl = PlayingVar.getInstance().roleSecondaryEquipType ? "face/副武器2.png" : "face/副武器1.png";
        const pic: string = Data.FixedDataTables.getInstance().getDataByKey(Data2.DataType.secondaryWeapon, type || this.game.secondWeapon.selected, "pic");
        this.leftSecondWeapon.skin = "face/" + pic + ".png";
        this.rightSecondWeapon.skin = "face/" + pic + ".png";
        this.secondRoleObj.visible = this.game.secondWeapon.selected ? true : false;
        SecondWeaponData.getInstance().updateWeaponComfig();
        this.setMainWeaponType();
    }
    /**
     * 副武器改变  主武器也会改变
     */
    setMainWeaponType(type?: any): void {
        const markId = type || this.game.secondWeapon.selected;
        const pic: string = Data.FixedDataTables.getInstance().getDataByKey(Data2.DataType.secondaryWeapon, markId, "fly");
        if (!this.mainPlane_sk.templet) {
            Laya.timer.frameLoop(1, this, this.setPlaneSk, [pic]);
        } else {
            this.setPlaneSk(pic);
        }
        this.mainPlane_pic.visible = false;
        return;
        const skArr = [201, 202, 203]
        if (skArr.indexOf(Number(markId)) > -1) {
            if (!this.mainPlane_sk.templet) {
                Laya.timer.frameLoop(1, this, this.setPlaneSk, [pic]);
            } else {
                this.setPlaneSk(pic);
            }
            this.mainPlane_sk.visible = true;
            this.mainPlane_pic.visible = false;
        } else {
            this.mainPlane_pic.skin = "face/" + pic + ".png";
            this.mainPlane_sk.visible = false;
            this.mainPlane_pic.visible = true;
        }

    }
    setPlaneSk(skName: string) {
        if (this.mainPlane_sk.templet) {
            this.mainPlane_sk.url = "dragonbones/" + skName + ".sk";
            Laya.timer.clear(this, this.setPlaneSk);
        }
    }
    /**
     * 初始化钱币的数值
     */
    setMoneyData(): void {
        const power = BagDataControl.getInstance().getBagDataById("103").num;
        const gold = BagDataControl.getInstance().getBagDataById("101").num;
        const diamond = BagDataControl.getInstance().getBagDataById("102").num;
        this.bodyPower.value = tools.converteNum(power);
        this.gold.value = tools.converteNum(gold);
        this.diamond.value = tools.converteNum(diamond);
    }
    touchStartEndless(e: Laya.Event) {
        e.stopPropagation();
        if (!this.canClickBtn) {
            return;
        }
        this.setCanTouchVar();

        if (EquipUpdate.instance().listVisile()) {
            EquipUpdate.instance().hideAllList();
            return;
        }
        this.playMusicAndSound(0, musicToUrl.bg_fight);
        if (!this.judgeEnergyEnough("endless")) {
            toast.noBindScript("体力不足！");
            return;
        }
        // if (!EndlessManage.getInstance().isSatisfy()) {
        //     toast.noBindScript("关卡模式通关第十关开启！");
        //     return;
        // }
        // EndlessManage.getInstance().createBuyItemPop();
        EndlessManage.getInstance().createUpgradeShortcutByAD();
    }
    /**
     * 等待部分加载完成
     */
    private waitingStartTime: number;
    private isWaiting: boolean;
    waitingLoad() {
        if (this.isWaiting) {
            if ((Date.now() - this.waitingStartTime >= 5000) || (this.preResLoaded && this.preResLoaded_e)) {
                Laya.Dialog.hideLoadingPage();
                if (PlayingVar.getInstance().gameModel === "endless") {
                    // EndlessManage.getInstance().createBuyItemPop();
                    this.enterEndless();
                } else {
                    this.startEnterPlaying();
                }
                this.isWaiting = null;
                Laya.Dialog.hideLoadingPage();
            }
        }
    }

    judgeLoadFinish() {
        if (!this.preResLoaded || !this.preResLoaded_e) {
            this.waitingStartTime = Date.now();
            Laya.Dialog.showLoadingPage();
            this.isWaiting = true;
        } else {
            if (PlayingVar.getInstance().gameModel === "endless") {
                this.enterEndless();
            } else {
                this.startEnterPlaying();
            }
        }
    }
    enterEndless() {

        //预加载
        this.preLoadResInPlaying(true);

        // this.sendKillEnergy();
        (this.self["endSence"] as Laya.Animation).play(0, false);
        this.playing_layer.visible = true;
        //初始化 无尽模式管理类
        EndlessManage.getInstance().initEndless();
        if (PlayingVar.getInstance().firstTouchPlay) {
            Laya.Physics.I.start();
        } else {
            PlayingVar.getInstance().firstTouchPlay = true;
        }
        //血量初始化
        this.initRoleHp();
        PlayingVar.getInstance().gameStatus = "playing";
    }
    touchStartGameBtn(e: Laya.Event): void {

        e.stopPropagation();
        if (e.type === Laya.Event.CLICK) {
            if (!this.canClickBtn) {
                return;
            }
            this.setCanTouchVar();
            if (this.game.nowLevel > 60) {
                toast.noBindScript("后续关卡暂未开放~");
                return;
            }
            if (EquipUpdate.instance().listVisile()) {
                EquipUpdate.instance().hideAllList();
                return;
            }
            if (!this.judgeEnergyEnough()) {
                toast.noBindScript("体力不足！");
                return;
            }
            this.playMusicAndSound(1, musicToUrl.button_normal);
            PlayingVar.getInstance().gameModel = "level";
            this.judgeLoadFinish();

        }
    }
    startEnterPlaying() {
        (this.self["endSence"] as Laya.Animation).play(0, false);
        this.playing_layer.visible = true;
        if (PlayingVar.getInstance().firstTouchPlay) {
            Laya.Physics.I.start();
        } else {
            PlayingVar.getInstance().firstTouchPlay = true;
        }
        //血量初始化
        this.initRoleHp();
        PlayingVar.getInstance().gameStatus = "playing";

        this.playMusicAndSound(0, musicToUrl.bg_fight);
    }
    onDisable(): void {
        this.buffBulletInit = null;
    }

    private markDragTouchId: any;
    onStageMouseDown(e: Laya.Event) {
        if (e.touches && e.touches.length >= 2) {
            if (e.touchId !== this.markDragTouchId) {
                PlayingControl.roleDragCan = false;
                return;
            }
        } else {
            this.markDragTouchId = e.touchId;
        }
        //Laya.stage.mouseX
        //鼠标按下就开始发射子弹
        if (PlayingVar.getInstance().gameStatus !== "playing" && PlayingVar.getInstance().gameStatus !== "preSettlement") {
            return;
        }
        if (this.isGamePause) {
            return;
        }
        this._fighting = true;
        this.touchUpEffct.setHide();
        //增加区域
        if (!this.dragArea) {
            //拖动区域的限制
            this.dragArea = new Laya.Rectangle(0, 0, Laya.stage.width - this.roleObj.width, Laya.stage.height - 150 / 2);
        }
        this.roleObj.startDrag(this.dragArea, false, 0);
        // (this.mainPlane.getChildAt(0) as Laya.Skeleton).play("fly", true);

    }

    onStageMouseUp(e: Laya.Event) {
        //鼠标松开,子弹停止
        if (this.markDragTouchId && this.markDragTouchId != e.touchId) {
            PlayingControl.roleDragCan = true;
            return;
        }
        this.mainPlane_sk.templet && this.mainPlane_sk.play("stand", true);
        //射击声音 停止
        if (this._fighting) {
            Music.getInstance().stopOneSound(musicToUrl.bullet_normal);
            this.touchUpEffct.setShow();
        }
        this._fighting = false;
    }
    onStageClick(e: Laya.Event): void {
        if (PlayingVar.getInstance().gameStatus === "main") {
            if (Laya.stage.mouseY < EquipUpdate.instance().getPosition().y) {
                EquipUpdate.instance().hideAllList();
            }
        }
        //射击声音
        if (this._fighting) {
            Music.getInstance().playSound(musicToUrl.bullet_normal, 0);
        }
    }

    onUpdate() {
        this.updateEnerenergy();
        if (!this.isGamePause && this._fighting) {
            if ((Date.now() - this.lastShotTime) >= (this.bulletSpeed)) {
                this.lastShotTime = Date.now();
                this.createBullet();
            }
            this.buffBulletInit.onUpdate();
            //const judgeBuffEnhance = this.judgeBuffEnhance();
            if (PlayingVar.getInstance().gameModel === "level" && this.bulletSpeedSecond && (Date.now() - this.lastShotTimeSecond) >= this.bulletSpeedSecond) {
                this.lastShotTimeSecond = Date.now();
                this.createBulletSecond_muzzle();
            }
            this.setRoleControl();
        }

        //创建敌人和鼠标按下和松开没有关系
        if (!this.isGamePause && PlayingVar.getInstance().gameStatus === "playing") {
            this.createEnemy();
            this.lastDestroyAllEnemy = this.EnemySpite._children.length ? false : true;
            this.countDown_buff();
        } else if (PlayingVar.getInstance().gameStatus === "main") {
            this.secondRoleObj.x = this.roleObj.x;
            this.secondRoleObj.y = this.roleObj.y;
        }
        //结算
        if (PlayingVar.getInstance().gameStatus === "settlement") {
            this.secondRoleObj.x = this.roleObj.x;
            this.secondRoleObj.y = this.roleObj.y;
        }
        this.setBgUpdate();
        this.setCloudUpdate();
        EndlessManage.getInstance().getDistance();
        this.waitingLoad();
    }
    set fighting(value: boolean) {
        this._fighting = value;
    }
    get fighting() {
        return this._fighting;
    }
    setCloudUpdate() {
        if (this.isGamePause) {
            return;
        }
        this.cloud_01.y += this._moveSpeed;
        this.cloud_02.y += this._moveSpeed;
        if (this.cloud_01.y > 0) {
            this.cloud_02.y = this.cloud_01.y - Laya.stage.height;
        }
        if (this.cloud_02.y > 0) {
            this.cloud_01.y = this.cloud_02.y - Laya.stage.height;
        }
    }
    setBgUpdate(): void {
        if (this.isGamePause || PlayingVar.getInstance().gameStatus === "settlement" || EndlessManage.getInstance().isBossFighting) {
            return;
        }
        this.bg_img1.y += 1;
        this.bg_img2.y += 1;
        this.bg_img3.y += 1;
        if (this.bg_img2.y > 0) {
            if (this.bg_img1.y > this.bg_img2.y && this.bg_img3.y > this.bg_img2.y) {
                if (this.bg_img1 > this.bg_img3) {
                    this.bg_img1.y = this.bg_img2.y - this.bg_img2.height;
                } else {
                    this.bg_img3.y = this.bg_img2.y - this.bg_img2.height;
                }
            }
        }
        if (this.bg_img1.y > 0) {
            if (this.bg_img2.y > this.bg_img1.y && this.bg_img3.y > this.bg_img1.y) {
                if (this.bg_img2.y > this.bg_img3.y) {
                    this.bg_img2.y = this.bg_img1.y - this.bg_img1.height;
                } else {
                    this.bg_img3.y = this.bg_img1.y - this.bg_img1.height;
                }
            }
        }
        if (this.bg_img3.y > 0) {
            if (this.bg_img1.y > this.bg_img3.y && this.bg_img2.y > this.bg_img3.y) {
                if (this.bg_img2.y > this.bg_img1.y) {
                    this.bg_img2.y = this.bg_img3.y - this.bg_img3.height;
                } else {
                    this.bg_img1.y = this.bg_img3.y - this.bg_img3.height;
                }
            }
        }
    }
    //上一个的开始时间记录
    private lastTimeCreateOne: number;
    //上一波的开始时间记录
    private lastTimeCreateAWave: number;
    //上一波已经完全被打完
    private lastDestroyAllEnemy: boolean = false;
    //每波怪的时间间隔
    private timeIntervalByOne: number;
    private stopCreateEnemy: boolean;
    //每个怪的创建的时间间隔
    private timeIntervalByCreate: number;
    private isABigWave: boolean = true;
    createEnemy() {
        const gameModel = PlayingVar.getInstance().gameModel;
        const nowWaveFinish = BattleParse.getInstance().judgeFinishNowWave();
        if (gameModel !== "endless" && this.isABigWave && nowWaveFinish && !BattleParse.getInstance().judgeNextIsBoss()) {
            this.isABigWave = false;
            this.createWaveEffect();
            return;
        }
        let judge1: boolean = !nowWaveFinish && (Date.now() - this.lastTimeCreateOne) >= this.timeIntervalByCreate;
        let judge2: boolean = nowWaveFinish && (Date.now() - this.lastTimeCreateAWave) >= this.timeIntervalByOne;
        let judge3: boolean = nowWaveFinish && this.lastDestroyAllEnemy;
        const canContinueCreate = this.judgeCanContinueCreate(nowWaveFinish);
        if ((!this.lastTimeCreateOne || canContinueCreate) && this.fighting) {
            if (!this.lastTimeCreateAWave) {
                this.lastTimeCreateAWave = Date.now();
            }
            let enemyId = this.calNeedCreateId();

            if (enemyId && !this.stopCreateEnemy) {
                this.lastTimeCreateOne = Date.now();
                this.lastDestroyAllEnemy = false;
                const e_type = FixedDataTables.getInstance().getDataByKey(Data2.DataType.monster, enemyId, "type");
                const enemyObj = new EnemyObject(enemyId);
                this.EnemySpite.addChild(enemyObj.enmeySprite);

            } else {
                this.stopCreateEnemy = true;
                //本关怪物全部创建完了
                if (this.lastDestroyAllEnemy) {

                    //BattleParse.deleteInstance();
                    //本关结算

                    PlayingVar.getInstance().gameStatus = "preSettlement";
                    this.removeBulletInStage();
                    Laya.timer.once(1500, this, this.setSuccess);
                }
            }
        }
    }
    judgeCanContinueCreate(waveFinish: boolean) {
        const gameModel = PlayingVar.getInstance().gameModel;
        if (gameModel === "endless" && EndlessManage.getInstance().isBossFighting) {
            const interval = EndlessParseBoss.getInstance().getintervalByOne();
            const judge = (Date.now() - this.lastTimeCreateOne) >= interval;
            return judge;
        } else {
            let judge1: boolean = !waveFinish && (Date.now() - this.lastTimeCreateOne) >= this.timeIntervalByCreate;
            let judge2: boolean = waveFinish && (Date.now() - this.lastTimeCreateAWave) >= this.timeIntervalByOne;
            let judge3: boolean = waveFinish && this.lastDestroyAllEnemy;
            return judge1 || judge2 || judge3;
        }
    }
    calNeedCreateId() {
        const gameModel = PlayingVar.getInstance().gameModel;
        let id: any;
        if (gameModel === "endless" && EndlessManage.getInstance().isBossFighting) {
            id = EndlessParseBoss.getInstance().getMonsterId();
        } else {
            id = BattleParse.getInstance().getNextMonsterData();
        }
        return id;
    }
    setSuccess() {
        PlayingVar.getInstance().gameStatus = "settlement";
        this.fighting = false;
        Laya.Browser.window.game.overLevel = true;
        this.roleObj.stopDrag();
        this.setRoleSuccess();
        UpBlackEffect.getInstance().setHide();
        setTimeout(() => {
            new manage.BitmapManage("bitmapFont/settlement_number.fnt", "settlement_number", Laya.Handler.create(this, () => {
                Laya.Scene.open("test/Settlement_dialog.scene", false);
            }));
            this.clearObjParent();
            this.clearObjectPool();
            this.clearStageSprite();
        }, 1200 + 800);
    }
    /**
     * role胜利后飞出屏幕外
     */
    setRoleSuccess() {
        Laya.Tween.to(this.roleObj, { y: -120 }, 1000, null, Laya.Handler.create(this, () => {
            Laya.Tween.clearAll(this.roleObj);
        }), 1000);
    }
    setLastTimeCreateAWave(num: number) {
        this.lastTimeCreateAWave = num;
    }

    setRoleControl() {
        if (this.roleStatus && this.roleStatus === Data2.roleStatus.controled && (Date.now() - this.roleStatusTime) >= 1000) {
            this.roleStatus = null;
            this.roleObj.startDrag();
            toast.noBindScript("已经解除控制!");
        }
    }
    setRoleControled() {
        this.roleObj.stopDrag();
        this.roleStatus = Data2.roleStatus.controled;
        this.roleStatusTime = Date.now();
        // (this.mainPlane.getChildAt(0) as Laya.Skeleton).play("stand", true);
    }
    /**
     * 得到时间间隔 每波和每个
     */
    setTimeIntervalByOne(): void {
        var time = FixedDataTables.getInstance().getDataByKey(DataType.battle, this.game.nowLevel, "time");
        this.timeIntervalByOne = 1000 * Number(time);
        this.setLastByCreateTime();
    }
    setLastByCreateTime(nowInWave?: number) {
        var time: string = FixedDataTables.getInstance().getDataByKey(DataType.battle, this.game.nowLevel, "time1");
        const timeArr = time.split(";");
        if (nowInWave && nowInWave === 1) {
            const randomRange = timeArr[1].split("|");
            const randomNum = tools.random(10 * Number(randomRange[0]), 10 * Number(randomRange[1]));
            const realRandomNum = randomNum / 10;
            this.timeIntervalByCreate = 1000 * realRandomNum;
        } else {
            const randomRange = timeArr[0].split("|");
            const randomNum = tools.random(10 * Number(randomRange[0]), 10 * Number(randomRange[1]));
            const realRandomNum = randomNum / 10;
            this.timeIntervalByCreate = 1000 * realRandomNum;
            // this.timeIntervalByCreate = 1000 * Number(timeArr[0]);
        }
    }
    judgeBulletType1() {
        if (this.buffData) {
            let i: string;
            for (i in this.buffData) {
                if (this.buffData[i].type === 1) {
                    return true;
                }
            }
        }
        return false;
    }
    createBullet() {
        const standardPos = { x: this.roleObj.x + 59, y: this.roleObj.y - 3 };
        const buffData = this.buffData;
        var bullet = null;
        if (buffData && this.judgeBulletType1()/*Object.keys(buffData).length*/) {
            let i: string;
            for (i in buffData) {
                const type = buffData[i].type;
                let buffValue: number = 6 || buffData[i].buffValue;

                switch (Number(type)) {
                    case 1:
                        //弹幕
                        buffValue += 4;
                        const parityBulletNum: number = buffValue % 2;
                        let leftIndex: number = 0;
                        let rightIndex: number = 0;
                        let j = 0;
                        let position = { x: 0, y: 0 };

                        for (j; j < buffValue; j++) {
                            // bullet = this.createBulletObj(buffData[i].bullet);
                            if (!parityBulletNum) {
                                if (j % 2) {
                                    position.x = standardPos.x + 7.5 + 11 + 20 * rightIndex;
                                    position.y = standardPos.y;
                                    if (rightIndex % 2) {
                                        position.y -= 70 - 3;
                                    }
                                    rightIndex++;
                                } else {
                                    position.x = standardPos.x - 7.5 - 11 - 20 * leftIndex;
                                    position.y = standardPos.y;
                                    if (leftIndex % 2) {
                                        position.y -= 70 - 3;
                                    }
                                    leftIndex++;
                                }
                            } else {
                                if (j === 0) {
                                    position.x = standardPos.x;
                                    position.y = standardPos.y;
                                    leftIndex++;
                                    rightIndex++;
                                } else if (j % 2) {
                                    position.x = standardPos.x - 20 * leftIndex;
                                    leftIndex++;
                                } else {
                                    position.x = standardPos.x + 20 * rightIndex;
                                    rightIndex++;
                                }
                            }

                            const obj = new BulletMain(BulletType.roleMainBullet, position, buffData[i].bullet);
                            // bullet.pos(position.x, position.y);
                            // bullet["vars_"].propertyObj = { prefabType: Data2.prefabType.bulletRole };
                            // bullet["vars_"].propertyObj.hurtValue = Number(MainWeaponData.getInstance().getShowFire());
                            // this.bulletParent.addChild(bullet);
                        }
                        break;
                    default:
                        break;
                }
            }

        } else {
            this.deaultbulletCreate();
        }
    }
    deaultbulletCreate(bulletPic?: string) {
        const standardPos = { x: this.roleObj.x + 58, y: this.roleObj.y - 32 };
        let bulletNumber: number = this.getBulletNum();
        const isOddNumber = bulletNumber % 2;
        let cycleNum = isOddNumber ? (bulletNumber - 1) / 2 : bulletNumber / 2;
        let index: number = 0;
        if (isOddNumber) {
            let posXy = { x: 0, y: standardPos.y };
            posXy.x = standardPos.x;
            const obj = new BulletMain(BulletType.roleMainBullet, posXy, bulletPic);
        }
        while (--cycleNum >= 0) {
            index++;
            let index2 = 0;
            for (index2; index2 < 2; index2++) {
                let posXy = { x: 0, y: standardPos.y };
                posXy.x = index2 ? (standardPos.x - 15 * index - (2.5 + 5 * (index - 1))) : (standardPos.x + 15 * index + (2.5 + 6 * (index - 1)));
                if (isOddNumber && index % 2 !== 0 || (!isOddNumber && index % 2 == 0)) {
                    posXy.y -= 50 + 10;
                }
                const obj = new BulletMain(BulletType.roleMainBullet, posXy, bulletPic);
            }
        }
        return;
        let i = 0;

        //现在默认弹幕就是4
        for (i; i < bulletNumber; i++) {
            let posXy = { x: 0, y: standardPos.y };
            switch (i) {
                case 0:
                    posXy.x = standardPos.x + 15 + 2.5;
                    break;
                case 1:
                    posXy.x = standardPos.x - 15 - 2.5;
                    break;
                case 2:
                    posXy.x = standardPos.x + 30 + 8.5;
                    posXy.y -= 50 + 10;
                    break;
                case 3:
                    posXy.x = standardPos.x - 30 - 8.5;
                    posXy.y -= 50 + 10;
                    break;
                default:
                    break;
            }
            const obj = new BulletMain(BulletType.roleMainBullet, posXy, bulletPic);
        }
    }
    /**
     * 计算弹幕的条数 (加入无尽模式可能的改变~)
     */
    getBulletNum(): number {
        const gameModel = PlayingVar.getInstance().gameModel;
        if (gameModel === "endless") {
            const skillInstance = EndlessParseSkill.getInstance();
            if (skillInstance.isUpgraded(4)) {
                const value = skillInstance.getSkillNum(4);
                return value + 1;
            } else {
                return 1;
            }
        } else {
            return 4;
        }
    }
    calBulletPos(sameBuletNum: number): any {
        switch (sameBuletNum) {
            case 1:

                break;
            case 2:
                break;
            case 3:
                break;
            default:
                break;
        }
    }
    private createBIndex: number;
    createBulletSecond() {
        /**
         * 203   x-34 y-20    ||  x+143 y-20
         * 201  x-34 y-80    ||   x+143 y-80
         * 202  x-34 y-80    ||   x+143 y-80
         */
        this.createBIndex == void 0 && (this.createBIndex = 0);
        // const bulletPrefabName = SecondWeaponData.getInstance().bulletPrefab;

        // let prefabClass: Laya.Prefab = Laya.loader.getRes("prefab/" + bulletPrefabName + ".json");
        const markSecondType = Number(SecondWeaponData.getInstance().buffType[0]);
        let i = this.createBIndex;
        for (i; i < 2; i++) {
            let positionxy = { x: 0, y: 0 };
            if (i) {
                positionxy.x = this.secondRoleObj.x + secondWeaponPos[markSecondType].x[0];
                positionxy.y = this.secondRoleObj.y + secondWeaponPos[markSecondType].y[0];
            } else {
                positionxy.x = this.secondRoleObj.x + secondWeaponPos[markSecondType].x[1];
                positionxy.y = this.secondRoleObj.y + secondWeaponPos[markSecondType].y[1];
            }
            const obj: BulletMain = new BulletMain(BulletType.roleSecondBullet, positionxy);
            // const arr = Laya.Browser.window.secondArr;
            // if (!Laya.Browser.window.secondArr) {
            //     Laya.Browser.window.secondArr = [];
            // }
            // Laya.Browser.window.secondArr.push(obj.bulletObj);
            break;
        }
        if (++this.createBIndex >= 2) {
            this.createBIndex = 0;
        }
    }
    createBulletSecond_muzzle() {
        /**
         *  - 35, 44   ||143 - 10-5, 44   203副武器位置
         *  - 35, 52  || 143 - 5, 52     201
         *  -32 ,52-8  ||  143,52-8       202
         */
        const buffTypeArr = SecondWeaponData.getInstance().buffType;
        const buffType: number = Number(buffTypeArr[0]);
        const prefabName = Data2.muzzlePrefab[buffType] || "Bullet_muzzle4";
        let prefabClass: Laya.Prefab = Laya.loader.getRes("prefab/" + prefabName + ".json");
        let i = 0;
        for (i; i < 2; i++) {
            const bullet: LYSprite = Laya.Pool.getItemByCreateFun(prefabName, prefabClass.create, prefabClass);
            if (i) {
                // bullet.pos(- 32, 52 + 7);
                bullet.pos(secondWeaponMuzzlePos[buffType].x[0], secondWeaponMuzzlePos[buffType].y[0]);

            } else {
                // bullet.pos(143, 52 + 7);
                bullet.pos(secondWeaponMuzzlePos[buffType].x[1], secondWeaponMuzzlePos[buffType].y[1]);
            }
            this.secondRoleObj.addChild(bullet);
        }
    }

    private buffData: any;
    /**
     * 设置buff的持续时间以及倒计时
     * @param proppertyObj 
     */
    setBuff(proppertyObj: Buff): void {
        if (!this.buffData) {
            this.buffData = {};
        }
        if (this.judgeBuffType5(proppertyObj)) {
            return;
        }
        const buffId = proppertyObj.buffId;
        const sameTypeId = this.getSameTypeBuffId(proppertyObj.type);

        if (!sameTypeId) {
            this.buffData[buffId] = {};
            this.buffData[buffId] = tools.copydata(proppertyObj);
            this.buffData[buffId].buffProgress = Laya.Pool.getItemByCreateFun("buffProgress", this.BuffProgress.create, this.BuffProgress) as LYSprite;
            const buffProgress = this.buffData[buffId].buffProgress;
            const imgObj: LYImage = buffProgress.getChildByName("img_pic") as LYImage;
            imgObj.skin = "buff/" + proppertyObj.icon + ".png";
            const imgObj_mask = buffProgress.getChildByName("img_bg") as LYImage
            imgObj_mask.skin = "buff/" + proppertyObj.icon + "_遮照.png";
            buffProgress.pos(Laya.stage.width - imgObj.width - 2, 416 + (imgObj.height + 5) * this.getBuffTypeNum());

            const maskObj = (buffProgress._children[1].mask as LYSprite);
            maskObj.graphics.clear();
            maskObj.graphics.drawRect(0, 83, 81, 83, "#ff0000");
            // maskObj.graphics.drawPie(55.25, 58, 49, 0, 360, "#ff0000");
            this.buffProgressParent.addChild(buffProgress);
        } else {
            if (sameTypeId !== buffId) {
                this.buffData[buffId] = this.buffData[sameTypeId];
                delete this.buffData[sameTypeId];
            }
        }
        this.buffData[buffId].nowTime = Date.now();
        this.buffData[buffId].nowTime_otherBuff = Date.now();
        //火力增强弹幕
        const markTime: number = Date.now();
        this.buffData[buffId].nowTime_fireBuff = [markTime, markTime, markTime];
        this.buffData[buffId].countSecond = 0;

        this.buffBulletInit.initBuffData(this.buffData);
        //速度buff设置速度~~
        this.setSpeedBySpeedBuff(this.buffData[buffId]);
    }
    /**
     * 判断是否是加血buff以及进行 加血
     */
    judgeBuffType5(proppertyObj: Buff) {
        if (proppertyObj.type === 5) {
            role.instance.setRoleHp(-proppertyObj.buffValue);
            return true;
        }
        return false;
    }
    /**
     * 得到buff类型总数
     */
    getBuffTypeNum() {
        const typeArr = [];
        let i: string;
        for (i in this.buffData) {
            const markType = this.buffData[i].type;
            if (typeArr.indexOf(markType) === -1) {
                typeArr.push(markType);
            }
        }
        return typeArr.length;
    }
    /**
     * 得到buffData中type相同的id
     */
    getSameTypeBuffId(buffType: number): number {
        let i: string;
        for (i in this.buffData) {
            if (this.buffData[i].type === buffType) {
                return Number(i);
            }
        }
        return null;
    }
    /**
     * 在胜利或者失败后清除主界面的sprite
     */
    clearStageSprite(): void {
        this.buffProgressParent.removeChildren(0, this.buffProgressParent.numChildren - 1);

    }
    /**
     * 清理对象
     */
    clearObject(): void {
    }
    /**
     * buff效果的倒计时
     */

    countDown_buff() {
        if (!this.buffData || !Object.keys(this.buffData).length) {
            return;
        }
        let i;
        for (i in this.buffData) {
            const proppertyObj = this.buffData[i];

            if (Date.now() - proppertyObj.nowTime >= 100) {
                proppertyObj.nowTime = Date.now();
                proppertyObj.countSecond++;
                const buffLastTime: number = proppertyObj.buffLastTime
                let buffProgress = proppertyObj.buffProgress as LYSprite;
                const maskObj = (buffProgress._children[1].mask as LYSprite);
                maskObj.graphics.clear();
                maskObj.graphics.drawRect(0, 83 - proppertyObj.countSecond * (83 / (buffLastTime * 10)), 81, 83, "#ff0000");
                if ((proppertyObj.countSecond / 10) >= buffLastTime) {
                    const percentNum: number = (buffLastTime - proppertyObj.countSecond) / buffLastTime;
                    buffProgress.removeSelf();
                    if (this.buffData[i].type === 2) {
                        this.bulletSpeed = (0.15 - (MainWeaponData.getInstance().speed - 9) * 0.001) * 1000;
                        this.bSpeedRateByBuff2 = 1;
                    }
                    delete this.buffData[i];
                }
            }
        }
    }
    createBuff(buffProbabilit: Array<string>, posx, posy, parent?: LYSprite): void {
        if (PlayingVar.getInstance().gameModel === "endless") {
            return;
        }
        if (!buffProbabilit) {
            return;
        }
        const bate: number = Number(buffProbabilit[1]);
        const randomNum = tools.random(1, 100);
        if (randomNum >= 1 && randomNum <= (bate)) {
            const buffObj = new Buff(Number(buffProbabilit[0]), posx, posy);
        }
    }
    /**
     * 判断是否吃到了增强射速的buff
     */
    judgeBuffEnhance() {
        // const buffData = this.buffData;
        // let i: string;
        // for (i in buffData) {
        //     if (buffData[i].type === 2) {
        //         this.bulletSpeed = (0.15 - (buffData[i].buffValue * MainWeaponData.getInstance().speed - 9) * 0.001) * 1000;
        //         return;
        //     }
        // }
        // return false;
    }
    /**
     * buff2 子弹的飞行速度
     */
    public bSpeedRateByBuff2: number = 1;
    setSpeedBySpeedBuff(buff: Buff) {
        if (buff.type === 2) {
            if (buff.speedBate) {
                this.bulletSpeed = (0.15 - (buff.speedBate * MainWeaponData.getInstance().speed - 9) * 0.001) * 1000;
            }
            if (buff.buffValue) {
                this.bSpeedRateByBuff2 = buff.buffValue;
            }
        }
    }
    /**
     * 无尽模式 的技能 设置速度
     */
    setSpeedByEndless(value: any) {
        // this.bulletSpeed
        const temp = (0.15 - (MainWeaponData.getInstance().speed * (1 + value * 0.01) - 9) * 0.00075) * 1000;
        this.bulletSpeed = temp * value;
    }
    /**
     * 得到boss的坐标
     */
    getBossPos(): any {
        const index: number = this.EnemySpite.numChildren - 1;
        if (index >= 0) {
            const bossObj: LYSprite = this.EnemySpite._children[index] as LYSprite;
            return { x: bossObj.x, y: bossObj.y };
        } else {
            return { x: 0, y: 0 };
        }
    }
    /**
     * 判断是否吃到了增加金币数量得buff
     */
    // judgeBuffGold() {
    //     const buffData = this.buffData;
    //     let i: string;
    //     for (i in buffData) {
    //         if (buffData[i].type === 4) {
    //             return Number(buffData[i].buffValue);
    //         }
    //     }
    //     return false;
    // }
    /**
     * 清理对象池对象
     */
    clearObjectPool() {
        Laya.Pool.clearBySign("DropGold");
        // Laya.Pool.clearBySign("monster");

        Laya.Pool.clearBySign("fireBossB1");
    }
    /**
     * 清理父容器中的子对象
     */
    clearObjParent() {
        this.dropGoldParent.destroyChildren();
        const enemySpiteArr = this.EnemySpite._children;
        let i = 0;
        for (i; i < enemySpiteArr.length; i++) {
            enemySpiteArr[i]["vars_"].propertyObj.clearTimes();
        }
        //清除子弹得对象池
        // Laya.Pool.clearBySign("Bullet_boss");
        // this.self["bulletParent_enemy"].destroyChildren();
        // this.self["bulletParentUp_enmey"].destroyChildren();
        if (this.EnemySpite._children.length) {
            if (this.EnemySpite._children[0].vars_.propertyObj.e_type === 2) {
                this.EnemySpite.removeChildren();
            } else {
                this.EnemySpite.removeChildren();
            }
        }
        FireBossBullet1.getItems().forEach((item: FireBossBullet1) => {
            item.destroyChildren();
            item.destroy();
        });
    }
    /**
     * 从显示列表中红移除子弹
     */
    removeBulletInStage() {
        // Laya.Pool.clearBySign("Bullet_boss");
        this.self["bulletParent_enemy"].removeChildren();
        this.self["bulletParentUp_enmey"].removeChildren();
    }
    pauseListerer() {
        EndlessManage.getInstance().showSkills();
    }
    /**
     * 暂停游戏
     */
    pauseGame(type?: number) {
        // const arrayObj = [this.roleObj, this.leftSecondWeapon, this.rightSecondWeapon, PlayingControl.instance.mainPlane];
        // arrayObj.forEach((item, index) => {
        //     item.visible = !!type;
        // });
        // if (type) {
        //     Laya.timer.scale = 1;
        //     // Laya.Physics.I.start();
        //     PlayingVar.getInstance().gameStatus = "playing";
        // } else {
        //     Laya.timer.scale = 0;
        //     // Laya.Physics.I.stop();
        // }
        this.startPauseTime = Date.now();
        // Laya.timer.pause();
        this.isGamePause = true;
        this.roleObj.stopDrag();
        this.EnemySpite._children.forEach((item) => {
            const sk = (item.getChildByName("EnemySK") as Laya.Skeleton);
            sk && sk.playbackRate(0.001);
        });
    }
    /**
     * 暂停后恢复游戏~
     */
    resumeGame() {
        this.isGamePause = false;
        Laya.timer.resume();
        this.pauseInterval = Date.now() - this.startPauseTime;
        EndlessManage.getInstance().setCompensateTime();
        this.EnemySpite._children.forEach((item) => {
            const sk = (item.getChildByName("EnemySK") as Laya.Skeleton);
            sk && sk.playbackRate(1);
        });
    }
    /**
     * 检测是否有可升级的
     */
    private markTemplet: Laya.Templet;
    ckeckCanUpdate() {
        const item0: Laya.Button = (this.self["item0"] as Laya.Button);
        const item1: Laya.Button = (this.self["item1"] as Laya.Button);
        SkeletonTempletManage.getInstance().play(Data2.templetType.other, "jiantou", "jiantou", true, { x: 226, y: 38 }, item0, Laya.Handler.create(this, (e: any) => {
            SkeletonTempletManage.getInstance().play(Data2.templetType.other, "jiantou", "jiantou", true, { x: 226, y: 38 }, item1);
        }));
    }
    delayHpBar2(markWidth: number) {
        Laya.timer.once(1000, this, this.setHpBar2, [markWidth]);
    }
    /**
     * 设置屏幕抖动非物理震动
     */
    private shakeIndex: number;
    private nowDirect: string;
    setScreenShake() {
        this.shakeIndex = 0;
        this.nowDirect = "right";
        (this.bg_img1.parent as LYSprite).x = 0;
        Laya.timer.frameLoop(2, this, this.shakeCallBack);
    }
    shakeCallBack() {
        const shakeObj: LYSprite = this.bg_img1.parent as LYSprite;
        if (this.nowDirect === "right") {
            shakeObj.x += 3;
            if (shakeObj.x === 0) {
                this.nowDirect === "right";
            } else {
                this.nowDirect = "left";
            }

        } else if (this.nowDirect === "left") {
            shakeObj.x -= 3;
            if (shakeObj.x = 0) {
                this.nowDirect = "left";
            } else {
                this.nowDirect = "right";
            }
        }

        if (this.shakeIndex++ >= 5) {
            Laya.timer.clear(this, this.shakeCallBack);
        }
    }
    /**
     * 
     * @param markWidth 
     * role的血量进度条
     */
    setHpBar2(markWidth: number) {
        const mark_graphics = this.hpBar2.mask.graphics;
        mark_graphics.clear();
        mark_graphics.drawRect(0, 0, markWidth, 44, "#ff0000");
    }

    /**
     * 更新体力
     */
    public lastUpdateEnerenergyTime: number;
    private enerenergyInterval: number = 8000;
    private canUpdateEnergy: boolean = true;
    updateEnerenergy() {
        if (this.canUpdateEnergy && (!this.lastUpdateEnerenergyTime || (Date.now() - this.lastUpdateEnerenergyTime >= this.enerenergyInterval))) {
            this.canUpdateEnergy = false;
            const args: any = {};
            args.uuId = PlayingVar.getInstance().uuId;
            args.energy = true;
            const httpReqObj = new HttpModel.HttpClass(Laya.Handler.create(this, (e) => {
                this.parseEnergyData(e);
                this.canUpdateEnergy = true;
            }), HttpModel2.URLSERVER + HttpModel2.httpUrls.TimerUpdateUpdateSome, JSON.stringify(args));
            this.lastUpdateEnerenergyTime = Date.now();
        }
    }
    parseEnergyData(e: any) {
        BagDataControl.getInstance().updateBagDate_new(e);
        const nextTime: number = new Date(e.energyRecoverTime).getTime();
        const nowTime: number = new Date(e.now).getTime();
        this.lastUpdateEnerenergyTime = Date.now();
        this.enerenergyInterval = nextTime - nowTime;
    }
    /**
     * 请求扣除体力
     */
    sendKillEnergy() {
        const args: any = {};
        args.uuId = PlayingVar.getInstance().uuId;
        const nowEnergy: number = BagDataControl.getInstance().getBagDataById("103").num;
        let energyCost;
        if (PlayingVar.getInstance().gameModel === "endless") {
            energyCost = 20;
        } else {
            energyCost = Data.FixedDataTables.getInstance().getDataByKey(DataType.battle, this.game.nowLevel, "cost");
        }
        args.bagCommon = { 103: { id: 103, num: nowEnergy - energyCost } };
        args.barrier = { curBarrier: this.game.nowLevel, luckyValue: PlayingVar.getInstance().luckyValue };
        const httpReqObj = new HttpModel.HttpClass(Laya.Handler.create(this, (e) => {
            this.canUpdateEnergy = true;
            this.enerenergyInterval = 0;
        }), HttpModel2.URLSERVER + HttpModel2.httpUrls.PassedBarrier, JSON.stringify(args));
    }
    /**
     * 判断体力是否足够
     */
    judgeEnergyEnough(model?: string) {
        const nowEnergy: number = BagDataControl.getInstance().getBagDataById("103").num;
        const cost = model ? 20 : FixedDataTables.getInstance().getDataByKey(DataType.battle, this.game.nowLevel, "cost");
        if (nowEnergy - cost < 0) {
            return false;
        }
        return true;
    }
    /**
     * 即将有一大波兵的效果~
     */
    public isWaveEffect: boolean;
    createWaveEffect() {
        const warning: Laya.Prefab = Laya.loader.getRes("prefab/Boss_warning.prefab");
        let bossWarning = warning.create();
        this.isWaveEffect = true;
        Laya.stage.addChild(bossWarning);
    }
    set roleHp(hp: number) {
        this._roleHp = hp >= this.roleTotal ? this.roleTotal : hp;
    }
    get roleHp(): number {
        return this._roleHp;
    }
} 