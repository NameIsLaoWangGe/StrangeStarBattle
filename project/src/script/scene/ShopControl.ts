import toast from "../manage/toast"
import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import DataType = Data2.DataType;
import FixedDataTables = Data.FixedDataTables;
import BagDataControl from "../manage/BagDataControl";
import DialogEffect from "../manage/DialogEffect";
import PlayingVar from "../manage/Playing_var"
import HttpModel from "../Connect/HttpClass"
import HttpModel2 from "../Connect/HttpEnum"
import HttpModel3 from "../Connect/HttpError"
import RewardDialogControl from "./RewardDialogControl";
import RewardTenControl from "./RewardTenControl";
import AdaptScene from "../manage/AdaptScene";
import PlayingControl from "../playing/PlayingSceneControl";
export default class ShopControl extends Laya.Script {
    constructor() {
        super();
    }
    private weaponList: Laya.List;
    private config_shop: any;
    private consumeGold: Array<string>;
    private consumeGold_ten: Array<string>;
    private myGold: number;
    private dialogE: DialogEffect;

    //屏蔽点击
    private canTouch: boolean;
    onEnable(): void {

        Music.getInstance().playSound(musicToUrl.ui_popup);
        const self: Laya.Dialog = this.owner as Laya.Dialog;
        this.canTouch = true;
        this.myGold = BagDataControl.getInstance().getBagDataById("101").num;
        this.weaponList = self["weapon_list"] as Laya.List;
        this.weaponList.vScrollBarSkin = "";
        this.weaponList.selectEnable = false;
        this.weaponList.renderHandler = new Laya.Handler(this, this.updateItemWeaponData);
        let config_secondaryWeapon: any = FixedDataTables.getInstance().getData(DataType.secondaryWeapon);
        let keys: Array<string> = Object.keys(config_secondaryWeapon);
        let data: Array<string> = [];
        for (var m: number = 0; m < keys.length; m++) {
            let lockCondition = config_secondaryWeapon[keys[m]].unlock;
            //关卡解锁不放到这里~~~
            if (JSON.parse(lockCondition.split("|")[0]) === 1) {
                continue;
            }
            data.push(config_secondaryWeapon[keys[m]]);
        }
        const diamondData = FixedDataTables.getInstance().getData(DataType.item)["102"];
        data.push(diamondData)
        this.weaponList.array = data;

        //购买监听
        this.config_shop = FixedDataTables.getInstance().getData(DataType.shop);
        this.consumeGold = this.config_shop[1].one.split("#")[0].split("|");
        this.consumeGold_ten = this.config_shop[1].ten.split("#")[0].split("|");
        (self["btn_buyOne"] as Laya.Button).on(Laya.Event.CLICK, this, this.requestData/*this.buyOne*/, [1]);
        (self["btn_buyTen"] as Laya.Button).on(Laya.Event.CLICK, this, this.requestData/*this.buyTen*/, [2]);
        (self["btn_close"] as Laya.Button).on(Laya.Event.CLICK, this, () => {
            Music.getInstance().playSound(musicToUrl.button_normal);
            // self.close();
            this.dialogE.removeAnimation(Laya.Handler.create(this, this.closeDialog));
        });

        //初始化购买需要的金币数
        (self["fc_cosumeOne"] as Laya.FontClip).value = "" + this.consumeGold[1];
        (self["fc_consumeTen"] as Laya.FontClip).value = "" + this.consumeGold_ten[1];

        this.dialogE = new DialogEffect(self)
    }
    /**
     * 
     * @param 
     * 请求中奖数据
     */
    requestData(reqType: number) {
        if (!this.canTouch) {
            return;
        }
        Laya.Scene.showLoadingPage();
        this.canTouch = false;

        const args = { uuId: PlayingVar.getInstance().uuId };
        let reqUrl = reqType == 1 ? (HttpModel2.URLSERVER + HttpModel2.httpUrls.ShopOnce) : (HttpModel2.URLSERVER + HttpModel2.httpUrls.ShopTen);
        new HttpModel.HttpClass(Laya.Handler.create(this, (e) => {
            // console.error(e);
            Laya.Scene.hideLoadingPage();
            Music.getInstance().playSound(reqType === 1 ? musicToUrl.lottery_single : musicToUrl.lottery_ten);
            if (reqType === 1) {
                this.buyOne(e);
            } else {
                this.buyTen(e)
                console.error("10连抽~~~~~~~");
            }
        }), reqUrl, JSON.stringify(args))
    }
    private markE: any;
    buyOne(e: any): void {
        if (e.ret) {
            if (e.ret == -7) {
                //打开购买体力
                // toast.noBindScript("体力不足,请前往购买!", this.owner);
                const dec = "消耗的物品数量不足,是否前往获得？";
                Laya.Scene.open("test/popDialog.scene", false, { "txt": dec, type: 0 });
            } else {
                new HttpModel3.HttpError(e.ret, this.owner);
            }
        } else {
            this.markE = e;
            this.markTime = 0;
            this.nowTurn = 0;
            this.stopIndex = e.bagSecondaryWeapon ? Number(Object.keys(JSON.parse(e.bagSecondaryWeapon))) - 206 + 1 : 6;
            console.error("抽卡需要停止的位置~", this.stopIndex);
            this.nowIndex = 0;
            this.speed = 60;
            this.runLight = true;
            // BagDataControl.getInstance().updateBagDate_new(e);
            // Laya.Scene.open("test/obtainGoods.scene", false, e, Laya.Handler.create(this, (o: Laya.Dialog) => {
            //     const dialogControl: RewardDialogControl = o.getComponent(Laya.Script);
            //     dialogControl.onOpened(e);
            //     this.canTouch = true;

            // }));
        }
    }
    openObtainGoodsScene() {
        const e = this.markE;
        Laya.Scene.open("test/obtainGoods.scene", false, e, Laya.Handler.create(this, (o: Laya.Dialog) => {
            const dialogControl: RewardDialogControl = o.getComponent(Laya.Script);
            dialogControl.onOpened(e);
            this.canTouch = true;
        }));
    }
    buyTen(e: Laya.Event): void {
        Laya.Scene.open("test/obtainGoodsTen.scene", false, e, Laya.Handler.create(this, (o: Laya.Dialog) => {
            const dialogControl: RewardTenControl = o.getComponent(Laya.Script);
            dialogControl.opened(e);
            this.canTouch = true;
        }));
    }

    updateItemWeaponData(cell: Laya.Box, index: Number) {
        const data = cell.dataSource;
        const cellButton: Laya.Button = cell.getChildAt(0) as Laya.Button;
        cellButton.skin = "shop/商品框.png";
        (cell.getChildByName("weaponName") as Laya.Label).text = data.name;
        if (!data.pic) {
            (cell.getChildByName("img_icon") as Laya.Image).skin = "commonPic/" + "钻石大图标" + ".png";
        } else {
            (cell.getChildByName("img_icon") as Laya.Image).skin = "shop/" + data.pic + "_shop.png";
        }

    }
    private markTime: number;
    private readonly turnNum: number = 10;
    private nowTurn: number;
    private stopIndex: number;  //最终位置
    private nowIndex: number;   //现在位置
    private readonly turnSlowNum: number = 9;
    private speed: number = 60;
    private readonly minSpeed: number = 200;
    private runLight: boolean;
    //跑马灯
    onUpdate() {
        if (this.runLight) {
            if (this.markTime !== (void 0) && (Date.now() - this.markTime >= this.speed)) {
                this.markTime = Date.now();
                const cells: Array<Laya.Box> = this.weaponList.cells;
                let i: number = 0;
                for (i; i < 6; i++) {
                    const selectImg: Laya.Image = cells[i].getChildAt(1) as Laya.Image;
                    selectImg.visible = (i === this.nowIndex);
                }
                this.nowIndex++;

                if (this.nowTurn >= (this.turnSlowNum - 1)) {
                    this.speed += 10;
                    if (this.speed <= this.minSpeed) {
                        this.speed = this.minSpeed;
                    }
                }
                if (this.nowTurn === this.turnNum - 1 && this.nowIndex === this.stopIndex) {
                    //停止 弹结果
                    this.runLight = false;
                    Laya.timer.once(100, this, this.openObtainGoodsScene);
                }
                if (this.nowIndex >= 6) {
                    this.nowIndex = 0
                    this.nowTurn === (void 0) && (this.nowTurn = 0);
                    this.nowTurn++;
                }
            }
        }
    }
    closeDialog() {
        Laya.timer.clearAll(this);
        (this.owner as Laya.Dialog).close();
        this.dialogE = null;
    }
    onDestroy() {
        const urls: string[] = ["commonPic/黑色遮罩.png", "shop/界面底板.png", "shop/信息条.png", "shop/商店标题.png", "shop/界面二级底板.png"];
        PlayingControl.instance.clearResUrl(urls, true);
        console.log("销毁商城~!");
    }
}