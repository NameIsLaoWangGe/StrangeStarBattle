import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import BagDataControl from "../manage/BagDataControl"
import Toast from "../manage/toast"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import DialogEffect from "../manage/DialogEffect";
import musicToUrl = MusicEnum.musicToUrl;
import HttpModel from "../Connect/HttpClass";
import HttpModel2 from "../Connect/HttpEnum"
import HttpModel3 from "../Connect/HttpError"
import PlayingVar from "../manage/Playing_var";
import toast from "../manage/toast";
export default class Exchange extends Laya.Script {
    constructor() { super(); }
    /**
     * 金币 钻石兑换等
     */
    private self: Laya.Dialog;
    public openType: any;
    private icon_stone: Laya.Image;
    private icon_gold: Laya.Image;
    //兑换
    private btn_exchange: Laya.Button;
    //增加btn
    private btn_add: Laya.Button;
    //减少
    private btn_reduce: Laya.Button
    private fc_consume: Laya.FontClip;
    private label_get: Laya.Label;
    private btn_close: Laya.Button;
    private nowExchangeNum: number;
    private nowTargetNum: Number;
    //拥有的货币的数量
    private label_myHave: Laya.Label;
    //兑换比例
    private label_exchangeBate: Laya.Label;

    private game: any;
    private consumeByOne: number;
    onEnable(): void {
        this.self = this.owner as Laya.Dialog;
        this.game = Laya.Browser.window.game;
        this.self.onOpened = this.opened;
        this.initVar();
        this.initListener();
        this.dilogEffect = new DialogEffect(this.self);
    }
    setOpenType(e: number) {
        this.openType = e || 0;
        const infoImg = this.self["img_goldInfo"] as Laya.Image;
        const title = this.self["img_title"] as Laya.Image;
        if (this.openType) {
            this.consumeByOne = Data.FixedDataTables.getInstance().getDataByKey(Data2.DataType.buy_gold, this.game.nowLevel, "gold");
            this.icon_gold.skin = "commonPic/金币图标.png";
            this.label_exchangeBate.text = "1钻石=" + this.consumeByOne + "金币";
            infoImg.skin = "exchange/信息布局.png";
            title.skin = "exchange/兑换金币.png";
        } else {
            this.icon_gold.skin = "face/体力图标.png";
            this.consumeByOne = Data.FixedDataTables.getInstance().getDataByKey(Data2.DataType.buy_power, 1, "power") / Data.FixedDataTables.getInstance().getDataByKey(Data2.DataType.buy_power, 1, "diamond");
            this.label_exchangeBate.text = "1钻石=" + this.consumeByOne + "体力";
            infoImg.skin = "exchange/信息布局_体力.png";
            title.skin = "exchange/兑换体力.png";
        }
        this.setShow();
    }
    initVar(): void {
        this.icon_stone = this.self["icon_stone"];
        this.icon_gold = this.self["iconGold"];
        this.btn_exchange = this.self["btn_exchange"];
        this.btn_add = this.self["btn_add"];
        this.btn_reduce = this.self["btn_reduce"];
        this.fc_consume = this.self["fc_consume"];
        this.label_get = this.self["label_get"];
        this.btn_close = this.self["btn_close"];
        this.label_myHave = this.self["label_myHave"];
        this.label_exchangeBate = this.self["label_exchangeBate"];
    }
    initListener() {
        this.btn_exchange.on(Laya.Event.CLICK, this, this.exchangeGold);
        this.btn_add.on(Laya.Event.CLICK, this, this.addExchangeNum);
        this.btn_reduce.on(Laya.Event.CLICK, this, this.reduceExchangeNum);
        this.btn_close.on(Laya.Event.CLICK, this, this.closeDialog);
        this.self["btn_max"].on(Laya.Event.CLICK, this, this.maxExchangeNum)
    }
    private dilogEffect: DialogEffect;
    closeDialog() {
        Music.getInstance().playSound(musicToUrl.button_normal);
        this.dilogEffect.removeAnimation(Laya.Handler.create(this, () => {
            this.self.close();
            this.dilogEffect = null;
        }));
    }
    /**
     * 增加兑换数量
     */
    addExchangeNum() {
        (this.nowExchangeNum === void 0) && (this.nowExchangeNum = 0);
        let totalNum: number = BagDataControl.getInstance().getBagDataById("102").num;
        const jiZhun: number = Math.floor(totalNum / 10);
        let isNotEnouch: boolean = false;
        if (this.openType !== 2) {
            if (totalNum <= jiZhun) {
                if (this.nowExchangeNum < totalNum) {
                    this.nowExchangeNum = totalNum;
                } else {
                    isNotEnouch = true;
                }
            } else {
                if ((this.nowExchangeNum + jiZhun) <= totalNum) {
                    this.nowExchangeNum += jiZhun;
                } else {
                    if (this.nowExchangeNum < totalNum) {
                        this.nowExchangeNum = totalNum;
                    } else {
                        isNotEnouch = true;
                    }
                }
            }
        }

        if (isNotEnouch) {
            Toast.noBindScript("没有更多钻石了哦~", this.self);
        } else {
            this.setShow();
        }
    }
    /**
     * 设置兑换数量的显示
     */
    setShow() {
        (this.nowExchangeNum === void 0) && (this.nowExchangeNum = 0);
        this.btn_exchange.gray = this.nowExchangeNum === 0;
        this.fc_consume.value = "" + this.nowExchangeNum;
        this.label_get.text = "" + (this.nowExchangeNum * this.consumeByOne);
        this.label_myHave.text = BagDataControl.getInstance().getBagDataById("102").num;
    }
    /**
 * 减少兑换数量
 */
    reduceExchangeNum() {
        (this.nowExchangeNum === void 0) && (this.nowExchangeNum = 0);
        let totalNum: number = BagDataControl.getInstance().getBagDataById("102").num;
        const jiZhun: number = Math.floor(totalNum / 10);
        if (this.nowExchangeNum <= 0) {
            Toast.noBindScript("不能更少了哦~");
        } else {
            if (this.nowExchangeNum - jiZhun >= 0) {
                this.nowExchangeNum -= jiZhun;
                this.setShow();
            } else {
                this.nowExchangeNum = 0
                this.setShow();
            }
        }
    }
    /**
     * 达到最大兑换
     */
    maxExchangeNum() {
        const totalNum: number = BagDataControl.getInstance().getBagDataById("102").num;
        this.nowExchangeNum = totalNum;
        this.setShow();
    }
    /**
     * 兑换
     */
    exchangeGold() {
        Music.getInstance().playSound(musicToUrl.coin_charge);
        // Toast.noBindScript("兑换功能暂不开启!", this.self, { y: 399 });
        let markUrl: string;
        const args = { uuId: PlayingVar.getInstance().uuId, DIAMOND: Number(this.label_myHave.text) - this.nowExchangeNum };
        console.error("发送的钻石参数~~~:", Number(this.label_myHave.text) - this.nowExchangeNum);
        if (this.openType) {
            markUrl = HttpModel2.URLSERVER + HttpModel2.httpUrls.ExchangeGold;
        } else {
            markUrl = HttpModel2.URLSERVER + HttpModel2.httpUrls.ExchangeEnergy;
        }
        new HttpModel.HttpClass(Laya.Handler.create(this, this.exchangeResult), markUrl, JSON.stringify(args));
    }
    exchangeResult(e: any) {
        console.error("兑换的回调:", e);
        if (e.ret) {
            new HttpModel3.HttpError(e.ret, this.owner);
        } else {
            //更新数据  
            BagDataControl.getInstance().updateBagDate_new(e);
            Toast.noBindScript("兑换成功!", this.self, { y: 399 });
            //更新兑换界面
            this.nowExchangeNum = 0;
            this.setShow();
        }
    }
    opened(e: number) {
        const markSelf = this["_components"][0];
        markSelf["setOpenType"](e);
    }
    changeShow(e: number) {
        // switch (key) {
        //     case value:

        //         break;

        //     default:
        //         break;
        // }
    }
}