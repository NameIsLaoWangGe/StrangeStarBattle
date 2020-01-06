import Toast from "../manage/toast"
import BattleParse from "../playing/BattleParse"
import BagDataControl from "../manage/BagDataControl"
import HttpModel from "../Connect/HttpClass"
import HttpModel2 from "../Connect/HttpEnum"
import PlayingVar from "../manage/Playing_var"
import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import PlayingControl from "../playing/PlayingSceneControl"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import DataTables = Data.FixedDataTables;
import HttpClass = HttpModel.HttpClass;
import AdaptScene from "../manage/AdaptScene";
export default class Settlement extends Laya.Script {
    private game: any;
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
    private progressInstance: Laya.ProgressBar;
    private self: Laya.Dialog
    private sk_settlement: Laya.Skeleton;

    onEnable() {
        this.initVar();
        this.successAndFail();
        this.controlSuccessMusic();
    }
    private oneGold: Laya.Label;
    private doubleGold: Laya.Label;
    initVar() {
        this.game = Laya.Browser.window.game;
        // if (this.game.overLevel) {
        //     this.game.nowLevel++;
        // }

        this.self = this.owner as Laya.Dialog;
        const self = this.self;
        this.progressInstance = self["progress_bar"];
        Laya.Browser.window.progressInstance = this.progressInstance;
        this.oneGold = self["oneGold"];
        this.doubleGold = self["doubleGold"];
        (self["btn_rewardOne"] as Laya.Button).on(Laya.Event.CLICK, this, this.rewardClick, [0]);
        (self["btn_rewardTwo"] as Laya.Button).on(Laya.Event.CLICK, this, this.rewardClick, [1]);
        this.sk_settlement = self["sk_settlement"];
        this.sk_settlement.on(Laya.Event.STOPPED, this, this.stopedSK);
        // Laya.Browser.window.sk_settlement = this.sk_settlement;

    }
    /**
     * 控制胜利界面的音乐 
     */
    controlSuccessMusic() {
        Music.getInstance().playSound(musicToUrl.win_bg);
        Music.getInstance().playSound(musicToUrl.win_noise);
    }
    successAndFail() {
        const nowLabel: Laya.Label = this.self["nowLevel"];
        nowLabel.text = JSON.stringify(this.game.nowLevel);
        //胜利
        let obtainGolds = BattleParse.getInstance().goldsInLevel.toString();
        this.oneGold.text = "" + parseInt(obtainGolds);
        Laya.timer.frameOnce(3, this, () => {
            this.sk_settlement.play(this.dragonNames[0], false);
        });
        //渐隐两个sprite
        let i: number = 0;
        for (i; i < 2; i++) {
            const markSprite = this.self["sprite_" + i] as Laya.Sprite;
            Laya.Tween.from(markSprite, { alpha: 0 }, 1400);
        }
        this.showLuckyValue();
    }
    showLuckyValue() {
        const addLuckyConfig: any = DataTables.getInstance().getData(Data2.DataType.misc);
        let addLuckyNum: number;
        if (this.game.overLevel) {
            addLuckyNum = addLuckyConfig[3].value;
        } else {
            addLuckyNum = addLuckyConfig[4].value;
        }
        const luckyValue = Number(addLuckyNum) + PlayingVar.getInstance().luckyValue;
        const luckyBate = luckyValue / 100;
        const markObj = this.progressInstance.mask;
        markObj.graphics.clear(true);
        const calWidth = (luckyBate > 1 ? 1 : luckyBate) * 647;
        markObj.graphics.drawRect(0, 0, calWidth, 38, "#ffffff");
    }
    private receiveType: number;
    rewardClick(e: number) {
        Music.getInstance().playSound(musicToUrl.bullet_normal);
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
        const energyCost = Data.FixedDataTables.getInstance().getDataByKey(Data2.DataType.battle, this.game.nowLevel, "cost");
        const nowEnergy: number = BagDataControl.getInstance().getBagDataById("103").num;
        args.bagCommon[103] = { id: 103, num: (nowEnergy - energyCost) > 0 ? (nowEnergy - energyCost) : 0 };
        // const nowEnergy: number = BagDataControl.getInstance().getBagDataById("103").num;
        // const energyCost = Data.FixedDataTables.getInstance().getDataByKey(Data2.DataType.battle, this.game.nowLevel, "cost");
        // args.bagCommon[103] = { id: 103, num: nowEnergy - energyCost };

        this.game.overLevel && (this.game.nowLevel++);
        args.barrier = { curBarrier: this.game.nowLevel, luckyValue: Number(addLuckyNum) + PlayingVar.getInstance().luckyValue };
        const killEnemyS_now = BattleParse.getInstance().killEnemyS;
        args["achieve"] = { killTopNum: PlayingVar.getInstance().getKillMaxNum(killEnemyS_now) };
        BagDataControl.getInstance().updateBagCommon({ bagCommon: args.bagCommon });
        PlayingVar.getInstance().luckyValue = args.barrier.luckyValue;
        const luckyBate = args.barrier.luckyValue / 100;
        const markObj = this.progressInstance.mask;
        markObj.graphics.clear(true);
        const calWidth = (luckyBate > 1 ? 1 : luckyBate) * 647;
        markObj.graphics.drawRect(0, 0, calWidth, 38, "#ffffff");
        // this.progressInstance.value = luckyBate > 1 ? 1 : luckyBate;
        console.error("PlayingVar.getInstance().luckyValue", PlayingVar.getInstance().luckyValue);
        this.receiveType = e;
        const httpReqObj = new HttpClass(Laya.Handler.create(this, this.openTipsAndBack), HttpModel2.URLSERVER + HttpModel2.httpUrls.PassedBarrier, JSON.stringify(args));

    }
    openTipsAndBack(data: any) {
        var tip: string;
        if (this.receiveType) {
            tip = "暂无广告双倍奖励已经领取!";
        } else {
            tip = "奖励已经领取";
        }
        const secondW = JSON.parse(data.bagSecondaryWeapon);
        BagDataControl.getInstance().updateBagDate_new(data);
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
    // private readonly dragonNames = ["zhutichibang_01", "shanguang_02", "zhongxinguangquan_02", "beijingguang_02", "chibang_02"];
    private readonly dragonNames = { 0: "zhutichibang_01", 1: "shanguang_02", 3: "beijingguang_02" };
    stopedSK() {
        //再创建三个循环动画

        let i: string;
        for (i in this.dragonNames) {
            if (i === "0") {
                continue;
            }
            const skObj: Laya.Skeleton = this.self["sk" + i] as Laya.Skeleton;
            skObj.visible = true;
            skObj.play(this.dragonNames[i], true);
        }
    }
}