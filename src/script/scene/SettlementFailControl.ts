import Toast from "../manage/toast"
import BattleParse from "../playing/BattleParse"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import BagDataControl from "../manage/BagDataControl"
import HttpModel from "../Connect/HttpClass"
import HttpModel2 from "../Connect/HttpEnum"
import PlayingVar from "../manage/Playing_var"
import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import PlayingControl from "../playing/PlayingSceneControl"
import DataTables = Data.FixedDataTables;
import HttpClass = HttpModel.HttpClass;
import musicToUrl = MusicEnum.musicToUrl;
import AdaptScene from "../manage/AdaptScene";
import DataType = Data2.DataType;
import EndlessManage from "../manage/EndlessManage";
import LYlabel = Laya.Label;
export default class SettlementFailControl extends Laya.Script {
    constructor() {
        super();
    }
    onAwake() {
        const bg_black = this.owner["bg_black"] as Laya.Image;
        AdaptScene.getInstance().setBg(bg_black);
        bg_black.on(Laya.Event.CLICK, this, (event: Laya.Event) => {
            event.stopPropagation();
        });
    }
    private label_haveEnemy: Laya.Label;
    private progress_b: Laya.Image;
    private sk_settlement: Laya.Skeleton;
    private self: Laya.Dialog;
    private btn_revival: Laya.Button;
    private game: any;
    private markTime: number;
    onEnable(): void {
        //停止物理世界
        // Laya.Physics.I.stop();
        this.game = Laya.Browser.window.game;
        const self: Laya.Dialog = this.owner as Laya.Dialog;
        this.self = self;
        const game = Laya.Browser.window.game;

        self["nowLevel"].text = game.nowLevel;
        const btn_revival: Laya.Button = self["btn_revival"];

        const goldLable: LYlabel = this.self["oneGold"];
        let obtainGolds = BattleParse.getInstance().goldsInLevel.toString();
        goldLable.text = "" + parseInt(obtainGolds);
        btn_revival.alpha = 0;
        btn_revival.on(Laya.Event.CLICK, this, this.clickRevival);
        this.btn_revival = btn_revival;
        // Laya.timer.loop(1000, this, this.cownDown, [countDown], true);
        this.setProgressBar();
        this.sk_settlement = self["sk_settlement"];
        this.sk_settlement.y = 579;
        // Laya.Browser.window.sk_settlement = this.sk_settlement;
        this.setSK();
        //this.setAlpha();

        //监听领取奖励
        (this.self["btn_rewardOne"] as Laya.Button).on(Laya.Event.CLICK, this, this.getReward, [0]);
        (this.self["btn_rewardTwo"] as Laya.Button).on(Laya.Event.CLICK, this, this.getReward, [1]);

        this.setEndlessShow();

        this.setFailBgMusic();
    }
    /**
     * 失败界面的音效和背景音乐设置
     */
    setFailBgMusic() {
        Music.getInstance().playMusic(musicToUrl.lose_bg);
        Music.getInstance().playSound(musicToUrl.lose_noise);
    }
    /**
     * 无尽模式界面的若干设置
     */
    setEndlessShow() {
        const distanceLabelArr = ["label_distance", "label_0"];
        if (PlayingVar.getInstance().gameModel === "endless") {
            this.self["nowLevel"].text = EndlessManage.getInstance().scoreNum;
            this.self["label_distance"].value = EndlessManage.getInstance().distanceNum + "km";
        }
        distanceLabelArr.forEach((item, index) => {
            (this.self[item] as LYlabel).visible = PlayingVar.getInstance().gameModel === "endless";
        });
    }
    onUpdate() {
        if (this.owner["nowLevel"]) {
            this.owner["nowLevel"].y = this.sk_settlement.y + 100.5;
        }
        if (this.ani1Playing) {
            if (!this.self["ani1"].isPlaying) {
                this.ani1Playing = null;
                this.progressShow();
            }
        }
    }
    progressShow() {
        const progressHide = ["label_enmeyDec", "progress_sm"];
        progressHide.forEach((item) => {
            this.self[item].visible = PlayingVar.getInstance().gameModel !== "endless";
        });

    }
    setSK() {
        Laya.timer.frameOnce(3, this, this.playSK);
    }
    private receiveType: number;
    getReward(e?: number) {
        Music.getInstance().playSound(musicToUrl.bullet_normal);
        if (PlayingVar.getInstance().gameModel === "endless") {
            this.getRewardInEndless();
            return;
        }

        const goldNow: number = BagDataControl.getInstance().getBagDataById("101").num;
        const addLuckyConfig: any = DataTables.getInstance().getData(Data2.DataType.misc);
        let addLuckyNum: number;
        if (this.game.overLevel) {
            addLuckyNum = addLuckyConfig[3].value;
        } else {
            addLuckyNum = addLuckyConfig[4].value;
        }
        const args: any = {};
        args.uuId = PlayingVar.getInstance().uuId;
        if (e) {
            args.bagCommon = { 101: { id: 101, num: goldNow + 2 * BattleParse.getInstance().goldsInLevel } };
        } else {
            args.bagCommon = { 101: { id: 101, num: goldNow + BattleParse.getInstance().goldsInLevel } };
        }
        // const nowEnergy: number = BagDataControl.getInstance().getBagDataById("103").num;
        // const energyCost = Data.FixedDataTables.getInstance().getDataByKey(DataType.battle, this.game.nowLevel, "cost");
        // args.bagCommon[103] = { id: 103, num: nowEnergy - energyCost };
        this.game.overLevel && (this.game.nowLevel++);
        args.barrier = { curBarrier: this.game.nowLevel, luckyValue: /*Number(addLuckyNum) +*/ PlayingVar.getInstance().luckyValue };
        const killEnemyS_now = BattleParse.getInstance().killEnemyS;
        args["achieve"] = { killTopNum: PlayingVar.getInstance().getKillMaxNum(killEnemyS_now) };
        BagDataControl.getInstance().updateBagCommon({ bagCommon: args.bagCommon });
        // PlayingVar.getInstance().luckyValue = args.barrier.luckyValue;
        // const luckyBate = args.barrier.luckyValue / 100;
        // this.progressInstance.value = luckyBate > 1 ? 1 : luckyBate;
        console.error("PlayingVar.getInstance().luckyValue", PlayingVar.getInstance().luckyValue);
        this.receiveType = e;
        const httpReqObj = new HttpClass(Laya.Handler.create(this, this.openTipsAndBack), HttpModel2.URLSERVER + HttpModel2.httpUrls.PassedBarrier, JSON.stringify(args));
    }

    getRewardInEndless(e?: number) {
        const args: any = {};
        args.uuId = PlayingVar.getInstance().uuId;
        const goldNow: number = BagDataControl.getInstance().getBagDataById("101").num;
        if (e) {
            args.bagCommon = { 101: { id: 101, num: goldNow + 2 * BattleParse.getInstance().goldsInLevel } };
        } else {
            args.bagCommon = { 101: { id: 101, num: goldNow + BattleParse.getInstance().goldsInLevel } };
        }
        const itemIds = ["104", "105"];
        let i = 0;
        for (i; i < itemIds.length; i++) {
            const itemConfig = BagDataControl.getInstance().getBagDataById(itemIds[i]);
            if (itemConfig && itemConfig.num) {
                args.bagCommon[itemIds[i]] = { id: itemIds[i], num: itemConfig.num }
            } else {
                args.bagCommon[itemIds[i]] = { id: itemIds[i], num: 0 };
            }
        }
        const scoreNum_now = EndlessManage.getInstance().scoreNum;
        const killEnemyS_now = BattleParse.getInstance().killEnemyS;
        args["achieve"] = { endlessTopScore: PlayingVar.getInstance().getScoresMaxNum(scoreNum_now), killTopNum: PlayingVar.getInstance().getScoresMaxNum(killEnemyS_now) };
        const httpReqObj = new HttpClass(Laya.Handler.create(this, this.openTipsAndBack), HttpModel2.URLSERVER + HttpModel2.httpUrls.EndlessStop, JSON.stringify(args));
    }
    openTipsAndBack(data: any) {
        var tip: string;
        if (this.receiveType) {
            tip = "暂无广告双倍奖励已经领取!";
        } else {
            tip = "奖励已经领取";
        }
        if (PlayingVar.getInstance().gameModel === "endless") {
            if (data.ret === 0) {
                BagDataControl.getInstance().updateBagDate_new(data);
                Toast.noBindScript(tip, this.owner);
                if (PlayingControl.instance.EnemySpite.numChildren) {
                    PlayingControl.instance.EnemySpite.removeChildren(0, PlayingControl.instance.EnemySpite.numChildren - 1);
                }
                Laya.timer.once(500, this, () => {
                    BattleParse.deleteInstance();
                    // Laya.Resource.destroyUnusedResources();
                    this.self.close();
                    EndlessManage.getInstance().endlessSettlement();
                    Laya.Scene.open("test/FacePlaying.scene", true);
                });
            }
            return;
        }

        data.bagSecondaryWeapon && data.bagSecondaryWeapon !== "{}" && BagDataControl.getInstance().updateBagDate_new(data);
        Toast.noBindScript(tip, this.owner);
        if (PlayingControl.instance.EnemySpite.numChildren) {
            PlayingControl.instance.EnemySpite.removeChildren(0, PlayingControl.instance.EnemySpite.numChildren - 1);
        }

        Laya.timer.once(500, this, () => {
            BattleParse.deleteInstance();
            // Laya.Resource.destroyUnusedResources();
            this.self.close();
            Laya.Scene.open("test/FacePlaying.scene", true);
        });
    }
    /**
     * 设置 部分对象的渐隐
     */
    setAlpha() {
        Laya.Tween.from(this.self["bg_black"], { alpha: 0 }, 1400);
        Laya.Tween.from(this.self["progressParent"], { alpha: 0 }, 1400);

    }
    private stopListenerObj: Laya.EventDispatcher;
    playSK() {
        Laya.timer.once(10900, this, this.playAni);
        if (PlayingVar.getInstance().gameModel === "endless") {
            this.sk_settlement.play("wujin_shibaifuhuo", false);
        } else {
            this.sk_settlement.play("shibaifuhuo", false);
        }

        this.stopListenerObj = this.sk_settlement.on(Laya.Event.STOPPED, this, this.playStoped);
    }
    /**
     * 监听播放骨骼动画停止
     */
    playStoped() {
        // this.cownDown();
        // this.btn_revival.offAll();
        // this.playAni();
    }
    setProgressBar(): void {
        this.label_haveEnemy = (this.owner["label_haveEnemy"] as Laya.Label);
        this.progress_b = (this.owner["progress_b"] as Laya.Image);

        const totalNums: number = BattleParse.getInstance().getTotalNums();
        const killEnemyS: number = BattleParse.getInstance().killEnemyS;
        this.label_haveEnemy.text = killEnemyS + "/" + totalNums;
        this.progress_b.mask.graphics.clear();
        this.progress_b.mask.graphics.drawRect(0, 0, (killEnemyS / totalNums) * 647, 50, "#ff0000");
        (this.self["label_enmeyDec"] as Laya.Label).text = "剩余怪物数量：" + (totalNums - killEnemyS);
    }
    clickRevival(e: Laya.Event): void {
        if (PlayingVar.getInstance().gameModel === "endless") {
            Toast.noBindScript("暂无广告,无法复活!", this.owner)
            return;
        }
        //观看广告中
        //this.btn_revival.alpha = 1;
        Toast.noBindScript("广告观看完成!", this.owner);
        Laya.timer.once(500, this, () => {
            // Laya.timer.clearAll(this);
            // Laya.Tween.clearAll(this);
            // (this.owner as Laya.Dialog).closeEffect = null;
            // (this.owner as Laya.Dialog).close();
            // Laya.Scene.open("test/Settlement_dialog.scene");
            this.cownDown();
        });

    }
    /**
     * 现在骨骼动画停止播放界面animation
     */
    private ani1Playing: boolean;
    playAni() {
        Laya.Tween.to(this.sk_settlement, { x: this.sk_settlement.x, y: 379 }, 400);
        const progressHide = ["label_distance", "label_0"];
        progressHide.forEach((item) => {
            Laya.Tween.to(this.self[item], { x: this.self[item].x, y: 25 }, 400);
        });
        this.btn_revival.offAll();
        const ani1 = (this.self["ani1"] as Laya.FrameAnimation);
        ani1.play(0, false);
        this.ani1Playing = ani1.isPlaying;
        console.error("状态~！！！！！！！", ani1.isPlaying);
    }
    cownDown() {
        // Laya.timer.clearAll(this);
        // Laya.Tween.clearAll(this);
        // this.stopListenerObj.offAll();
        // (this.owner as Laya.Dialog).closeEffect = null;
        // (this.owner as Laya.Dialog).close();
        // //打开结算界面
        // Laya.Scene.open("test/Settlement_dialog.scene");
        BattleParse.deleteInstance();
        // Laya.Resource.destroyUnusedResources();
        this.self.close();
        Laya.Scene.open("test/FacePlaying.scene", true);
    }
}