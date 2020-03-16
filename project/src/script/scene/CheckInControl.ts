import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import toast from "../manage/toast"
import Playing_var from "../manage/Playing_var"
import PlayingControl from "../playing/PlayingSceneControl"
import GoldFly from "../Tools/GoldFly"
import BagDataControl from "../manage/BagDataControl"
import HttpModel from "../Connect/HttpClass"
import HttpModel2 from "../Connect/HttpEnum"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import DialogEffect from "../manage/DialogEffect";
import musicToUrl = MusicEnum.musicToUrl;

import Prefab = Laya.Prefab;
import Button = Laya.Button;
import Image = Laya.Image;
import FontClip = Laya.FontClip;
import WeiXinAD from "../manage/WeiXinAD";
export interface itemPos {
    initx: number,
    inity: number,
    initw: number,
    inith: number,
}
export default class CheckInControl extends Laya.Script {

    /** @prop {name:checkItem, tips:"prefab", type:Prefab}*/
    public checkItem: Prefab;
    /** @prop {name:getDiamond, tips:"prefab", type:Prefab}*/
    public getDiamond: Prefab;
    constructor() { super(); }
    private self: Laya.Dialog;
    private oneRewardBtn: Button;
    private twoRewardBtn: Button;
    private posXY: any = {};
    private signConfig: any;
    private itemConfig: any;
    private alreadyCheckImgArr: Array<Image> = [];
    private goldIconArr: Array<Image> = [];
    private itemParent: Laya.Sprite;
    //private通用的弹出特效
    private dialogE: DialogEffect;
    private canClose: boolean;
    onEnable(): void {
        this.self = this.owner as Laya.Dialog;
        Laya.Browser.window.checkInDialog = this.self;
        this.initVar();
        this.initListen();
        this.initItems();
        Laya.Browser.window.dialog = this.self;
        Music.getInstance().playSound(musicToUrl.ui_popup);
        this.dialogE = new DialogEffect(this.self);
        this.canClose = true;
    }

    initVar(): void {
        this.itemParent = this.self["parentItem"];
        this.oneRewardBtn = this.self["btn_oneReward"];
        this.twoRewardBtn = this.self["btn_twoReward"];
        this.posXY.initx1 = 151;
        this.posXY.inity1 = 108;
        this.posXY.initw1 = 155;
        this.posXY.initx2 = 73.5;
        this.posXY.inity2 = 320;
        this.posXY.initw2 = 154.5;
        this.signConfig = Data.FixedDataTables.getInstance().getData(Data2.DataType.sign);
        this.itemConfig = Data.FixedDataTables.getInstance().getData(Data2.DataType.item);
    }
    initListen(): void {
        this.oneRewardBtn.on(Laya.Event.CLICK, this, this.rewardGold, [1]);
        this.twoRewardBtn.on(Laya.Event.CLICK, this, this.lookAd, [2]);
        this.self["btn_close"].on(Laya.Event.CLICK, this, () => {
            // this.self.close();
            this.dialogE.removeAnimation(Laya.Handler.create(this, this.closeDialog));
        });
    }
    /**
     * 看广告
     */
    lookAd() {
        const checkInData = Playing_var.getInstance().checkInData;
        if (checkInData.already) {
            toast.noBindScript("已经签到过了", this.self);
            return;
        }
        if (WeiXinAD.getInstance().adStatus) {
            WeiXinAD.getInstance().addVideoAD(Laya.Handler.create(this, this.lookAdFinish));
        } else {
            this.rewardGold(2);
        }
    }
    lookAdFinish(e: number) {
        if (e) {
            this.rewardGold(2);
        } else {
            toast.noBindScript("广告观看失败！");
        }
    }
    closeDialog() {
        Music.getInstance().playSound(MusicEnum.musicToUrl.button_normal);
        if (this.canClose) {
            // this.self.close();
            this.dialogE = null;
            this.self.close();
        }

    }
    private numsArr: Array<Array<string>> = [];
    initItems(): void {
        const checkInData = Playing_var.getInstance().checkInData;
        for (var i = 0; i < 7; i++) {
            const itemObj: Laya.Sprite = Laya.Pool.getItemByCreateFun("checkItem", this.checkItem.create, this.checkItem);
            if (i >= 3) {
                itemObj.pos(this.posXY.initx2 + (i % 4) * this.posXY.initw2, this.posXY.inity2);
            } else {
                itemObj.pos(this.posXY.initx1 + (i % 3) * this.posXY.initw1, this.posXY.inity1);
            }
            const oneData: Data2.sign = this.signConfig[i + 1] as Data2.sign;
            const idAndNum: Array<string> = oneData.reward.split("|");
            (itemObj.getChildByName("goldIcon") as Image).skin = "commonPic/" + this.itemConfig[idAndNum[0]].icon + ".png";
            const alreadyIcon: Image = itemObj.getChildByName("alreadyIcon") as Image;
            (itemObj.getChildByName("dayIcon") as FontClip).value = "" + (i + 1);
            (itemObj.getChildByName("goldNum") as Laya.Label).text = "" + idAndNum[1];
            if (i <= checkInData.day - 1) {
                alreadyIcon.visible = true;
            } else {
                alreadyIcon.visible = false;
            }
            this.alreadyCheckImgArr.push(alreadyIcon);
            this.goldIconArr.push(itemObj.getChildByName("goldIcon") as Image);
            this.numsArr.push(idAndNum);
            this.itemParent.addChild(itemObj);
        }
        Laya.Browser.window.goldIconArr = this.goldIconArr;
    }
    rewardGold(e: number): void {
        Music.getInstance().playSound(musicToUrl.button_buy);
        const checkInData = Playing_var.getInstance().checkInData;
        if (checkInData.already) {
            toast.noBindScript("已经签到过了", this.self);
        } else {
            this.canClose = false;
            const args = { uuId: Playing_var.getInstance().uuId, rate: e };
            const httpClassObj = new HttpModel.HttpClass(Laya.Handler.create(this, (data: any) => {
                if (false && data.ret === -10) {
                    const bagCommon = { "101": { "id": 101, "num": 1000 }, "102": { "id": 102, "num": 1018 }, "103": { "id": 103, "num": 1000 } };
                    const signIn = { "signDate": "2019-08-09T17:00:01.5852218+08:00", "signIn": true, "signTimes": 1 };
                    checkInData.already = true;
                    checkInData.day = signIn.signTimes;
                    BagDataControl.getInstance().updateBagCommon({ bagCommon: bagCommon });
                    const posArr: Array<Laya.Point> = this.getXYStart();
                    new GoldFly(posArr[0], posArr[1], null, this.self, this.moveFinish, e, this);
                } else {
                    const signIn = JSON.parse(data.signIn);
                    const bagCommon = JSON.parse(data.bagCommon);
                    checkInData.already = true;
                    checkInData.day = signIn.signTimes;

                    const getNum = bagCommon[102].num - BagDataControl.getInstance().getBagDataById("102").num;
                    BagDataControl.getInstance().updateBagCommon({ bagCommon: bagCommon });
                    const posArr: Array<Laya.Point> = this.getXYStart();
                    new GoldFly(posArr[0], posArr[1], null, this.self, this.moveFinish, e, this, getNum);
                }
                console.error(data);
            }), HttpModel2.URLSERVER + HttpModel2.httpUrls.SignUp, JSON.stringify(args));

        }
    }
    moveFinish(e: any) {
        console.log("已经移动完成");
        //更新红点
        PlayingControl.instance.setRedDotStatus();
        const day: number = Playing_var.getInstance().checkInData.day;
        const bate: number = e === 1 ? 1 : 2;
        // BagDataControl.getInstance().setBagData({ id: "101", num: BagDataControl.getInstance().getBagDataById("101").num + bate * Number(this.numsArr[day - 1][1]) });
        PlayingControl.instance.setMoneyData();
        this.alreadyCheckImgArr[day - 1].visible = true;
        // this.self.close();
        this.dialogE.removeAnimation(Laya.Handler.create(this, () => {
            // this.self.close();

            this.dialogE = null;
            toast.noBindScript("签到成功!");
            this.self.close();
            // Laya.Scene.gc();
        }));
        this.canClose = true;
    }
    getXYStart(): Array<Laya.Point> {
        const day: number = Playing_var.getInstance().checkInData.day;
        const iconImage: Image = this.goldIconArr[day];
        const point = new Laya.Point(iconImage.x, iconImage.y);
        let pointBack: Laya.Point;
        let pointArr: Array<Laya.Point> = [];
        pointBack = (this.goldIconArr[day].parent as Laya.Image).localToGlobal(point, false, this.self);
        const moveBtn: Laya.Button = PlayingControl.instance.owner["img_mainDiamond"] as Laya.Button;
        let pointP = new Laya.Point(moveBtn.x, moveBtn.y);
        pointP = (this.self).globalToLocal(pointP);
        pointArr.push(pointBack, pointP);
        return pointArr;
    }
    onDisable() {
        const urls = ["checkIn/二级底板.png"];
        PlayingControl.instance.clearResUrl(urls, true);
    }
}