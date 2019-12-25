import manage from "../manage/BitmapFontMananage"
import manage2 from "../manage/LoadManager"
import data from "../Data/DataTables"
import data2 from "../Data/JsonEnum"
import PlayingVar from "../manage/Playing_var"
import HttpModel from "../Connect/HttpClass"
import HttpModel2 from "../Connect/HttpEnum"
import BagDataControl from "../manage/BagDataControl"
import LoadManager = manage2.LoadManager;
import FixedDataTables = data.FixedDataTables;
import LYhandle = Laya.Handler;
import HttpClass = HttpModel.HttpClass;
import { tools } from "../Tools/Tool";
import AdaptScene from "../manage/AdaptScene";
interface uuidBack {
    uuId: string;
    ret: number;
}
export default class LoadSceneControl extends Laya.Script {
    private img_touchStartGame: Laya.Image;
    private canEnterMainScene: boolean;
    private loadingLabel: Laya.FontClip;
    private progressBar_up: Laya.Image;
    private sk_loading: Laya.Skeleton;
    private sk: Laya.Skeleton;

    constructor() {
        super();
    }
    onAwake() {
        AdaptScene.getInstance().setSceneAdaptHeight();

    }
    onEnable(): void {
        Laya.Browser.window.loadingScene = this.owner;
        this.adaptBate();
        this.canEnterMainScene = false;
        this.img_touchStartGame = this.owner["img_touchStartGame"];
        this.loadingLabel = this.owner["loadingLabel"];
        this.sk_loading = this.owner["sk_loading"];
        this.progressBar_up = this.owner["progressBar_up"];
        this.sk = this.owner["sk"];
        Laya.Browser.window.skBg = this.sk;
        const nameToUrl: { [key: string]: string; } = {
            main_resources: "bitmapFont/main_resources.fnt",
            customs_pass: "bitmapFont/customs_pass.fnt",
            升级按钮: "bitmapFont/升级按钮.fnt",
            复活字体: "bitmapFont/复活字体.fnt",
            胜利关卡字体: "bitmapFont/胜利关卡字体.fnt",
        };

        const keys: Array<string> = Object.keys(nameToUrl);
        const keyLength: number = keys.length;
        let i: string;
        let index: number = 0;
        for (i in nameToUrl) {
            const tempObj = new manage.BitmapManage(nameToUrl[i], i, Laya.Handler.create(this, () => {
                console.log("index", index);
                if (++index >= keyLength) {
                    Laya.timer.frameOnce(50, this, () => {
                        this.loadJsonZip();
                        console.log("zip加载完成");
                    });
                }

            }));
        }
        Laya.Browser.window.sk = this.owner.getChildAt(0);
        Laya.Browser.window.loadingLabel = this.owner["loadingLabel"];
        // this.sk_loading = new Laya.Skeleton();
        // this.sk_loading.load("dragaonbones_loading/jiazai.sk", Laya.Handler.create(this, this.createSKLoading));
        this.setLoadingScene();
        
    }
    adaptBate() {
        const view_sk: Laya.View = this.owner["view_sk"] as Laya.View;
        const view_bar: Laya.View = this.owner["view_bar"] as Laya.View;
        const img_title: Laya.Image = this.owner["img_title"] as Laya.Image;
        const stage_h = Laya.stage.height;
        view_sk.y = stage_h / 2;
        img_title.y = (1 / 7.25) * stage_h;
        view_bar.y = 0.75 * stage_h;
        Laya.Browser.window.view_sk = view_sk;
        Laya.Browser.window.view_bar = view_bar;
        Laya.Browser.window.img_title = img_title;
    }
    createSKLoading() {

        // this.sk_loading.play("newAnimation2", true);
        // this.sk_loading.visible = false;
        // this.sk_loading.zOrder = 3;
        // this.owner.addChild(this.sk_loading);
    }
    loadJsonZip(): void {
        FixedDataTables.loadFixedTables(LYhandle.create(this, (e) => {
            Laya.loader.resetProgress();
            var loader = new Laya.SceneLoader();
            loader.on(/*laya.events.Event.PROGRESS*/"progress", this, this.progressing);
            loader.once(/*laya.events.Event.COMPLETE*/"complete", this, this.completePre);
            loader.load("test/FacePlaying.scene");
        }));
    }

    completePre() {
        Laya.loader.resetProgress();
        var loader = new Laya.SceneLoader();
        loader.on(/*laya.events.Event.PROGRESS*/"progress", this, this.progressingPre);
        loader.once(/*laya.events.Event.COMPLETE*/"complete", this, this.complete);
        loader.load(["test/CheckIn_dialog.scene"]);
    }
    complete(e: Laya.Scene) {
        // this.sendHttp();
        // return;
        const url: string = HttpModel2.URLSERVER + HttpModel2.httpUrls.uuid;
        let randonUserId: any;
        if (Laya.Browser.onMiniGame) {
            randonUserId = { code: PlayingVar.getInstance().wecode };
        } else {
            randonUserId = { weId: "ww1a30add20"/* + tools.random(1, 100) + tools.random(10, 100)*/ };
        }
        // const data: string = "{weId:'1111213jwwwwaaw1'}";
        const data: string = JSON.stringify(randonUserId);
        new HttpClass(Laya.Handler.create(this, this.requestUUID), url, data);
        //this.setTouchStartGame();
    }
    requestUUID(e: uuidBack) {
        PlayingVar.getInstance().uuId = e.uuId;
        const url: string = HttpModel2.URLSERVER + HttpModel2.httpUrls.GetPlayerData;
        const data: string = JSON.stringify({ uuId: PlayingVar.getInstance().uuId });
        new HttpClass(Laya.Handler.create(this, this.requestUserData), url, data);
    }
    requestUserData(e: any) {
        const data = JSON.parse(e.PlayerData);
        const playerAchieve = JSON.parse(e.PlayerAchieve);
        PlayingVar.getInstance().updateGameVar(data, playerAchieve);
        BagDataControl.getInstance().initBagData(data);
        this.setTouchStartGame();
    }
    private alreadyChange: boolean;
    progressingPre(p: number) {
        console.error("p----------", p);
        let progressNum: number = 100 * 0.94 + 100 * 0.06 * p;
        this.loadingLabel.value = Math.floor(progressNum) + "%";
        this.progressBar_up.mask.graphics.clear();
        this.progressBar_up.mask.graphics.drawRect(0, 0, progressNum * 604, 57, "#ff0000");
    }
    progressing(p: number) {
        let progressNum: number = p * 100 * 0.94;
        this.loadingLabel.value = Math.floor(progressNum) + "%";
        this.progressBar_up.mask.graphics.clear();
        this.progressBar_up.mask.graphics.drawRect(0, 0, p * 604, 57, "#ff0000");
    }
    onStageClick() {
        if (this.canEnterMainScene) {
            Laya.timer.clear(this, this.hideAndShow);
            Laya.Scene.open("test/FacePlaying.scene", true);
        }
    }
    setTouchStartGame() {
        this.progressBar_up.visible = false;
        this.owner["progressBar"].visible = false;

        this.loadingLabel.visible = false;
        this.canEnterMainScene = true;
        this.sk_loading.visible = false;
        this.img_touchStartGame.visible = true;
        Laya.Tween.to(this.img_touchStartGame, {}, 800, )
        //Laya.timer.frameLoop(30, this, this.hideAndShow);
        this.hideAndShow();
    }
    hideAndShow() {
        // this.img_touchStartGame.visible = !this.img_touchStartGame.visible;
        const alphaValue: number = this.img_touchStartGame.alpha ? 0 : 1;
        Laya.Tween.to(this.img_touchStartGame, { alpha: alphaValue }, 800, null, Laya.Handler.create(this, this.hideAndShow), null, true, true);
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

    sendHttp() {
        var xhr: Laya.HttpRequest = new Laya.HttpRequest();
        xhr.http.timeout = 10000;//设置超时时间；
        xhr.once(Laya.Event.COMPLETE, this, this.completeHandler);
        xhr.once(Laya.Event.ERROR, this, this.errorHandler);
        xhr.on(Laya.Event.PROGRESS, this, this.processHandler);
        xhr.send("https://192.168.1.181:5001/api/UserMgr/Login", "{weId:'zhaojihui'}", "post", "json", ["Content-Type", "application/json"]);
        console.log("aaaa");
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
}

