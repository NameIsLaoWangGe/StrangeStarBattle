import MainWeaponData from "./MainWeaponData";
import PlayingControl from "../playing/PlayingSceneControl";
import GameConfig from "../../GameConfig";
import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import FixedDataTables = Data.FixedDataTables;
import BagDataControl from "./BagDataControl";
import PlayingVar from "./Playing_var";
import Enemy from "../playing/Enemy";
import role from "../role/role";
import HttpModel from "../Connect/HttpEnum";
import HttpModel2 from "../Connect/HttpClass"
import SkeletonTempletManage from "./SkeletonTempletManage";
import toast from "./toast";
import EndlessParseSkill from "./EndlessParseSkill";
import EndlessParseBoss from "./EndlessParseBoss";
import EnemyObject from "../role/EnemyObject"
export default class EndlessManage {
    private static _instance: EndlessManage;
    private readonly RESPATH = "prefab/Endless_buyItem";
    private readonly RESPATH_ITEM = "prefab/EndLessItem";
    //当前飞机的等级
    public mainLevel: number;
    //开始的时间cuo
    private startTime: number;
    //购买的界面
    private buyPopObj: Laya.Sprite;
    //飞机
    private planeLevelObj: Laya.Label;
    //分数
    private scoreObj: Laya.FontClip;
    private _scoreNum: number;
    //距离
    private distanceObj: Laya.FontClip;
    public distanceNum: number;
    private calUseSpeed: number;
    private weaponJson: any;
    //boss战
    public isBossFighting: boolean;
    constructor() {
        this.calUseSpeed = FixedDataTables.getInstance().getDataByKey(Data2.DataType.misc, 12, "value");
        this.weaponJson = FixedDataTables.getInstance().getData(Data2.DataType.weapon);
    };
    static getInstance(): EndlessManage {
        if (!this._instance) {
            this._instance = new EndlessManage();
        }
        return EndlessManage._instance;
    }
    initEndless() {
        this.startTime = Date.now();
        this.isBossFighting = false;
        this.mainLevel = 1;
        this.scoreNum = 0;
        this.distanceNum = 0;
        this.planeLevelObj = PlayingControl.instance.owner["label_planeLevel"];
        this.scoreObj = PlayingControl.instance.owner["label_score"];
        this.distanceObj = PlayingControl.instance.owner["label_distance"];
        this.distanceObj.value = "0Km";
        if (this.isLookedAD) {
            this.setLookedAdScore();
            this.isLookedAD = null;
        }
        this.scoreObj.value = "" + this.scoreNum;
        this.setSceneElement("enter");
        this.loadSk();
        // this.initItemIcon();
        this.reqReducePower();
        this.updateMainWeaponData();
        this.preLoadResInBoss();
    }
    updateMainWeaponData() {
        const level = this.mainLevel;
        MainWeaponData.getInstance().updateMainWeapon(level, level, level);
    }
    /**
     * 部分无尽模式才能用到的骨骼~
     */
    loadSk() {
        const skArr = ["shengji"];
        let i = 0;
        for (i; i < skArr.length; i++) {
            SkeletonTempletManage.getInstance().play(Data2.templetType.other, skArr[i], skArr[i], true, null, null);
        }
    }
    /**
     * 界面的元素 进游戏和结算回主界面
     */
    setSceneElement(status?: string) {
        if (status && status === "exit") {
            PlayingControl.instance.secondRoleObj.visible = true;
        } else {
            PlayingControl.instance.secondRoleObj.visible = false;
        }
        const arr = PlayingControl.instance.playing_layer._children;
        arr.forEach((item, index) => {
            if (item.name === "HpLevel") {
                item.visible = status !== "exit";
                const labelArray = ["label_score", "label_distance", "pauseBtn"];
                let i = 0;
                for (i; i < labelArray.length; i++) {
                    item.getChildByName(labelArray[i]).visible = status !== "exit";
                    // if (labelArray[i] == "lvscores_sprite") {
                    //     Laya.Browser.window.lvscores_sprite = item.getChildByName(labelArray[i]);
                    // }
                }
            } else {
                item.visible = status === "exit";
            }
        });

    }
    /**
     * 初始化 道具item
     */
    private itemJsonObj: any;
    initItemIcon() {
        if (this.itemJsonObj) {
            for (let i in this.itemJsonObj) {
                if (this.itemJsonObj) {
                    this.itemJsonObj[i].visible = true;
                }
            }
        } else {
            Laya.loader.load(this.RESPATH_ITEM + ".prefab", Laya.Handler.create(this, this.createItemInEndless));
        }
    }
    createItemInEndless(e: Laya.Prefab) {
        this.itemJsonObj = { 104: null, 105: null };
        let index: number = 0;
        let i;
        for (i in this.itemJsonObj) {
            const data = FixedDataTables.getInstance().getData(Data2.DataType.item, i);
            this.itemJsonObj[i] = e.create();
            const obj: Laya.Sprite = this.itemJsonObj[i];
            if (i === "104") {
                obj["damage"] = data.damage;
            } else {
                obj["etime"] = data.etime;
            }
            obj.pos(-5.5, 0.65 * Laya.stage.height + 125 * index);
            Laya.stage.addChild(obj);
            obj["itemId"] = i;
            obj.on(Laya.Event.CLICK, this, this.useItem);
            index++;
        }
        this.updateItemData();
    }
    updateItemData() {
        let i;
        const itemJsonObj = this.itemJsonObj;
        for (i in itemJsonObj) {
            const data = FixedDataTables.getInstance().getData(Data2.DataType.item, i);
            const obj: Laya.Sprite = this.itemJsonObj[i];
            (obj.getChildByName("icon") as Laya.Image).skin = "endLess/" + data.icon + ".png";
            const numData = BagDataControl.getInstance().getBagDataById(i);
            (obj.getChildByName("fc_num") as Laya.FontClip).value = numData ? numData.num : 0;
        }
    }
    /**
     * 计算距离
     */
    private readonly CALTIMEINTERVAL = 100;
    getDistance() {
        if (PlayingVar.getInstance().gameModel === "level" || PlayingControl.instance.isGamePause || PlayingVar.getInstance().gameStatus !== "playing") {
            return;
        }
        if (!this.isBossFighting && Date.now() - this.startTime >= this.CALTIMEINTERVAL) {
            let distance = (Date.now() - this.startTime) * this.calUseSpeed / 1000;
            this.distanceNum += distance;
            this.distanceNum = Number(this.distanceNum.toFixed(1));
            this.startTime = Date.now();
            this.distanceObj.value = "" + this.distanceNum + ".km";
            this.startBossFighting();
        }
        this.setCoolDown();
        if (PlayingVar.getInstance().gameModel === "endless") {
            PlayingControl.instance.owner["lvscores_sprite"].visible = true;
        }
    }

    /**
     * 计算分数
     */
    getScore(enemyType: number, enmeyLevel: number) {
        if (PlayingVar.getInstance().gameModel === "level" || PlayingVar.getInstance().gameStatus === "settlement") {
            return;
        }
        const scoresJson = { 1: 1, 2: 10, 3: 3 };
        let plusExp = enmeyLevel * scoresJson[enemyType];
        const instance = EndlessParseSkill.getInstance();
        //触发升级狂魔技能
        if (instance.isUpgraded(16)) {
            plusExp *= (1 + instance.getSkillNum(16) * 0.01);
            plusExp = Math.floor(plusExp);
        }
        this.scoreNum += plusExp;
        this.scoreObj.value = "" + this.scoreNum;
        this.updateMainLevel();
    }
    /**
     * 计算当前的等级
     */
    updateMainLevel() {
        const needScore = this.weaponJson[this.mainLevel]["score"];
        if (this.mainLevel <= 100 && this.scoreNum >= needScore) {
            this.mainLevel++;
            this.setUpdateEffect();
            this.updateMainWeaponData();
            if (!this.isLookedAD) {
                this.upgradeOpenSelectSkill();
            }
        }
        const nextNeedScore = this.weaponJson[this.mainLevel]["score"];
        this.changeScoresProgressBar(nextNeedScore);
    }
    /**
     * 改变分数进度条
     */
    changeScoresProgressBar(needScore: number) {
        PlayingControl.instance.owner["lv_now"].value = this.mainLevel;
        const lv_scores = PlayingControl.instance.owner["lv_scores"] as Laya.Label;
        const lastLevelNeedScore = this.mainLevel === 1 ? 0 : this.weaponJson[this.mainLevel - 1]["score"];
        lv_scores.text = "" + (this.scoreNum - lastLevelNeedScore) + "/" + (needScore - lastLevelNeedScore);
        const mark_graphics: Laya.Graphics = PlayingControl.instance.owner["scoreMask"].graphics;
        mark_graphics.clear();
        let markWidth = 177 * ((this.scoreNum - lastLevelNeedScore) / (needScore - lastLevelNeedScore));
        if (this.mainLevel >= 100) {
            PlayingControl.instance.owner["lv_max"].visible = true;
            lv_scores.visible = false;
            markWidth = 177;
        }
        mark_graphics.drawRect(0, 0, markWidth, 30, "#ff0000");
    }
    /**
     * 设置飞机升级的特效~
     */
    setUpdateEffect() {
        var roleObj = PlayingControl.instance.roleObj;
        const shengjiObj = roleObj.getChildByName("shengji") as Laya.Skeleton;
        if (shengjiObj) {
            shengjiObj.visible = true;
            shengjiObj.play(0, false);
        } else {
            const templet = SkeletonTempletManage.getInstance().templets["shengji"];
            if (templet) {
                const skObj: Laya.Skeleton = Laya.Pool.getItemByCreateFun("shengji", () => {
                    const sk = templet.buildArmature(0);
                    return sk;
                }, this);
                skObj.name = "shengji";
                skObj.pos(roleObj.width / 2, roleObj.height / 2);
                skObj.play(0, false);
                roleObj.addChild(skObj);
                skObj.on(Laya.Event.STOPPED, this, (temp) => { temp.visible = false }, [skObj]);
            } else {
                console.error("升级特效的资源未进行预加载~~~");
            }
        }
    }
    /**
     * 设置飞机皮肤byLevel
     */

    setPlaneShow() {

    }
    /**
     * 
     * @param itemId 
     * 使用道具
     */
    useItem(e: Laya.Event) {
        const itemObj = e.target;
        if (itemObj["cool"]) {
            //技能冷却中
            return;
        }
        const itemId = itemObj["itemId"];
        const numData = BagDataControl.getInstance().getBagDataById(itemId);
        if (!numData || numData.num === 0) {
            return;
        }
        this.setItemCool(itemObj);
        const argJson = { bagCommon: {} };
        argJson.bagCommon[itemId] = { num: numData.num - 1 };
        BagDataControl.getInstance().updateBagCommon(argJson);
        this.updateItemData();
        switch (Number(itemId)) {
            case 104:

                this.damageAllEnemy(itemId);
                break;
            case 105:
                this.roleAddShield(itemId);
                break;
            default:
                break;
        }
    }
    setItemCool(itemObj: Laya.Sprite) {
        const imgObj = itemObj.getChildByName("cool_img") as Laya.Image;
        imgObj.scaleY = 1;
        itemObj["startTime"] = Date.now();
        imgObj.visible = true;
        itemObj["cool"] = true;
    }
    /**
     * 冷却得倒计时
     */

    setCoolDown() {
        const items = this.itemJsonObj;
        if (!items) {
            return;
        }
        let i;
        for (i in items) {
            const item = items[i];
            if (item["cool"]) {
                if (Date.now() - item["startTime"] >= 100) {
                    item["startTime"] = Date.now();
                    const imgObj = item.getChildByName("cool_img") as Laya.Image;
                    imgObj.scaleY = imgObj.scaleY - 0.02;
                    if (imgObj.scaleY <= 0) {
                        item["cool"] = null;
                        imgObj.visible = false;
                    }
                }
            }
        }
    }
    damageAllEnemy(itemId: number) {
        this.setAllDamageEffect();
        const damageArr = this.itemJsonObj[itemId]["damage"].split("|");

        const enemys = PlayingControl.instance.EnemySpite._children;
        let i = 0;
        for (i; i < enemys.length; i++) {
            if (!enemys[i].visible) {
                continue;
            }
            const markScript: Enemy = enemys[i]["markScript"] as Enemy;
            const hurt = Number(damageArr[0]) + markScript.propertyObj.startHp * Number(damageArr[1]);
            markScript.setEnemyHp(hurt, null, null);
        }
    }
    roleAddShield(itemId: number) {
        role.instance.startRoleSheild(this.itemJsonObj[itemId]["etime"]);
    }
    /**
     * 设置q全屏的伤害特效
     */
    setAllDamageEffect() {
        const sk: Laya.Skeleton = Laya.Pool.getItemByCreateFun("qpbz", this.createAllDamageEffect, this);
        sk.on(Laya.Event.STOPPED, this, (e) => {
            Laya.Pool.recover("qpbz", e);
        }, [sk]);
        sk.play(0, false);
        sk.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        Laya.stage.addChild(sk);
    }
    createAllDamageEffect() {
        const templet: Laya.Templet = SkeletonTempletManage.getInstance().templets["qpbz"];
        const sk = templet.buildArmature(0);
        return sk;
    }
    /**
     * 战前准备
     */
    createBuyItemPop() {
        if (this.buyPopObj) {
            this.buyPopObj.visible = true;
            return;
        }
        if (Laya.loader.getRes(this.RESPATH + ".json")) {
            this.loadResCompelete(Laya.loader.getRes(this.RESPATH + ".json"));
        } else {
            Laya.Scene.showLoadingPage();
            Laya.loader.load(this.RESPATH + ".prefab", Laya.Handler.create(this, this.loadResCompelete));
        }
    }
    loadResCompelete(e: Laya.Prefab) {
        this.buyPopObj = e.create();
        this.buyPopObj.y = (Laya.stage.height - GameConfig.height) / 2;
        const bg: Laya.Sprite = (this.buyPopObj.getChildByName("bg") as Laya.Sprite);
        bg.height = Laya.stage.height;
        bg.y = -(Laya.stage.height - GameConfig.height) / 2;
        Laya.stage.addChild(this.buyPopObj);

        Laya.Scene.hideLoadingPage();
    }
    /**
     * 结算后需要的部分处理
     */
    endlessSettlement() {
        if (this.itemJsonObj) {
            //隐藏道具图标
            let i;
            for (i in this.itemJsonObj) {
                if (this.itemJsonObj[i]) {
                    this.itemJsonObj[i].visible = false;
                }
            }
        }
    }
    get scoreNum() {
        return this._scoreNum;
    }
    set scoreNum(value) {
        if (value !== void 0) {
            this._scoreNum = value;
        }
    }
    /**
     * 每次进入无尽都会扣除体力
     */
    reqReducePower() {
        const url: string = HttpModel.URLSERVER + HttpModel.httpUrls.EndlessStart;
        const nowEnergy: number = BagDataControl.getInstance().getBagDataById("103").num;
        const args = { uuId: PlayingVar.getInstance().uuId, bagCommon: { 103: { id: 103, num: nowEnergy - 20 } } };
        new HttpModel2.HttpClass(Laya.Handler.create(this, this.reqReducePowerFinish), url, JSON.stringify(args));
    }
    reqReducePowerFinish(e) {
        if (e.ret === 0) {
            BagDataControl.getInstance().updateBagDate_new(e);
        }
    }

    /**
     * 以下是新的无尽新添加 上面老的可能要动态的进行部分删减
     */
    /**
     * 是否满足进入条件
     */
    isSatisfy() {
        const gameVar = Laya.Browser.window.game;
        if (gameVar.nowLevel <= 10) {
            return false;
        }
        return true;
    }
    /**
     *  创建第一次看广告选择弹窗
     */
    createUpgradeShortcutByAD() {
        const dec = "天降鸿运,您获得了一次立即升级的机会是否立即升级？";
        Laya.Scene.open("test/popDialog.scene", false, { "txt": dec, type: 2 });
    }
    /**
     * 技能选择界面
     */
    private isLookedAD: boolean;
    createSelectSkill() {
        this.mainLevel == (void 0) && (this.isLookedAD = true);
        //调用打开的界面
        Laya.Scene.open("test/skillsToChoose.scene");
    }
    /**
     * 选择技能成功后的回调
     */
    selectSkillBack(id?: number) {
        console.error("id-----", id);
        const gameStatus = PlayingVar.getInstance().gameStatus;
        if (gameStatus === "main") {
            PlayingVar.getInstance().gameModel = "endless";
            PlayingControl.instance.judgeLoadFinish();
        } else {
            //取消暂停
            Laya.timer.once(500, this, () => {
                PlayingControl.instance.resumeGame();
            });
        }
        id && EndlessParseSkill.getInstance().addNewSkill(id);
    }
    setLookedAdScore() {
        const needScore = this.weaponJson[1]["score"];
        this.scoreNum = needScore;
        this.updateMainLevel();
    }
    /**
     * 展示所获得技能的界面    需要暂停
     */
    showSkills() {
        //调用打开技能界面
        PlayingControl.instance.pauseGame();
        Laya.Scene.open("test/suspendInterface.scene", false);

    }
    /**
     * 立刻结算
     */
    immediatelySettlement() {
        role.instance.setRoleDead();
    }
    /**
     * 检测boss战
     */
    startBossFighting() {
        const isSatisfy = EndlessParseBoss.getInstance().toSatisfy(this.distanceNum);
        if (isSatisfy) {
            this.isBossFighting = true;
            this.createBossObject();
        }

    }
    /**
     * boss战结束
     */
    endBossFighting() {
        PlayingControl.instance.pauseGame();
        //销毁剩余的敌人
        PlayingControl.instance.EnemySpite.removeChildren();
        this.isBossFighting = false;
        Laya.timer.once(700, this, () => {
            this.createSelectSkill();
        });
    }
    upgradeOpenSelectSkill() {
        PlayingControl.instance.pauseGame();
        Laya.timer.once(700, this, () => {
            this.createSelectSkill();
        });
    }
    /**
     * 创建boss
     */
    createBossObject() {
        const enemyId = EndlessParseBoss.getInstance().nowBossId;
        const enemyObj = new EnemyObject(enemyId);
        PlayingControl.instance.EnemySpite.addChild(enemyObj.enmeySprite);
        this.preLoadResInBoss();
        // this.EnemySpite.addChild(enemyObj.enmeySprite);
    }
    /**
     * 预加载boss战刷出来的小怪
     */
    preLoadResInBoss() {
        const ids = EndlessParseBoss.getInstance().getTempletDateInBoss();
        const templets = SkeletonTempletManage.getInstance().templets;
        let i: string;
        for (i in ids) {
            const pic = FixedDataTables.getInstance().getDataByKey(Data2.DataType.monster, i, "pic");
            if (!templets[pic]) {
                SkeletonTempletManage.getInstance().play(Data2.templetType.enemy, null, pic, true, null, null);
            }
        }
    }
    /**
     * 时间补偿
     */
    setCompensateTime() {
        this.startTime = Date.now();
    }
    /**
     * exit endlessmodel
     */
    exitEndless() {
        EndlessParseSkill.getInstance().deleteSkill();
        EndlessManage._instance = null;
    }
}