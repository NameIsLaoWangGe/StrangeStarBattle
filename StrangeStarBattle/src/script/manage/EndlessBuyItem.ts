import LYSprite = Laya.Sprite;
import LYImage = Laya.Image;
import LYList = Laya.List;
import LYFontClip = Laya.FontClip;
import AdaptScene from "./AdaptScene";
import Data from "../Data/DataTables";
import Data2 from "../Data/JsonEnum"
import FixedDataTables = Data.FixedDataTables;
import DataType = Data2.DataType;
import { tools } from "../Tools/Tool";
import BagDataControl from "./BagDataControl";
import PlayingVar from "./Playing_var";
import toast from "./toast";
import PlayingControl from "../playing/PlayingSceneControl";
import HttpModel from "../Connect/HttpEnum";
import HttpModel2 from "../Connect/HttpClass"
export default class EndlessBuyItem extends Laya.Script {
    private bg: LYSprite;
    private markList: LYList;
    private self: LYSprite;

    constructor() { super() }
    onEnable() {
        this.self = this.owner as LYSprite;
        this.self.getChildByName("bg").on(Laya.Event.CLICK, this, this.stopThrough);
        this.markList = this.self.getChildByName("render") as LYList;
        this.markList.renderHandler = new Laya.Handler(this, this.updateItem);
        this.self.getChildByName("goBtn").on(Laya.Event.CLICK, this, this.startGame);
        this.initData();
    }
    stopThrough(e: Laya.Event) {
        e.stopPropagation();
    }
    initData() {
        var arr = [];
        const ids = [104, 105];
        const dataObj = FixedDataTables.getInstance();
        let i = 0;
        for (i; i < ids.length; i++) {
            let dataJson = {};
            const oneJson = dataObj.getData(DataType.item, ids[i]);
            const consumeArr = oneJson.price.split("|");
            const consumeNum = Number(consumeArr[1]);
            dataJson["itemId"] = ids[i];
            dataJson["icon"] = oneJson["icon"];
            dataJson["consume"] = consumeNum;
            dataJson["fc_consume"] = tools.converteNum(consumeNum);
            const dataItemJson = BagDataControl.getInstance().getBagDataById(JSON.stringify(ids[i]));
            if (dataItemJson) {
                dataJson["fc_itemNum"] = dataItemJson.num;
            } else {
                dataJson["fc_itemNum"] = 0;
            }
            arr.push(dataJson)
        }
        this.markList.array = arr;
    }
    updateItem(cell: Laya.Box, index: number) {
        (cell.getChildByName("icon") as Laya.Image).skin = "endLess/" + cell.dataSource.icon + ".png";
        (cell.getChildByName("fc_consume") as Laya.FontClip).value = cell.dataSource.fc_consume;
        (cell.getChildByName("fc_itemNum") as LYFontClip).value = cell.dataSource.fc_itemNum;
        const buyBtn = (cell.getChildByName("btnBuy")) as Laya.Button;
        buyBtn.on(Laya.Event.CLICK, this, this.buyItem, [cell.dataSource.itemId, cell.dataSource.consume]);
    }
    startGame() {
        this.self.visible = false;
        PlayingVar.getInstance().gameModel = "endless";
        PlayingControl.instance.judgeLoadFinish();
    }
    buyItem(itemId: number, consume: number) {
        const diamondNum = BagDataControl.getInstance().getBagDataById(JSON.stringify(102));
        if (!diamondNum || diamondNum.num < consume) {
            toast.noBindScript("钻石不足！");
            return;
        }
        //showLoading
        Laya.Scene.showLoadingPage();
        const data = BagDataControl.getInstance().getBagDataById(JSON.stringify(itemId));
        const startNum = data ? BagDataControl.getInstance().getBagDataById(JSON.stringify(itemId)).num : 0;

        const urls: string = (HttpModel.URLSERVER + HttpModel.httpUrls.ShopItem);
        const args: any = { uuId: PlayingVar.getInstance().uuId, itemID: itemId, itemNum: startNum + 1 };
        const httpClass = new HttpModel2.HttpClass(Laya.Handler.create(this, (e: any) => {
            //收到回调
            //console.error(e);

            BagDataControl.getInstance().updateBagDate_new(e);
            this.updateListData(itemId);
            this.markList.refresh();
            Laya.Scene.hideLoadingPage();
        }), urls, JSON.stringify(args));
    }
    updateListData(itemId: number) {

        const arr = this.markList.array;
        let i: number = 0;
        for (i; i < arr.length; i++) {
            const id = arr[i]["itemId"];
            if (id == itemId) {
                arr[i]["fc_itemNum"] = BagDataControl.getInstance().getBagDataById(JSON.stringify(itemId)).num;
                break;
            }
        }
    }
}