import HashMap from "../Tools/HashMap"
import Data from "../Data/DataTables"
import JsonEnum from "../Data/JsonEnum"
import PlayingVar from "../manage/Playing_var"
import PlayingControl from "../playing/PlayingSceneControl"
import HttpModel from "../Connect/HttpEnum"
import userDataRequestBack = HttpModel.userDataRequestBack;
import FixedDataTables = Data.FixedDataTables;
import DataType = JsonEnum.DataType;
import LYFontClip = Laya.FontClip;
export default class BagDataControl {
    private static _instance;
    private bagList: any;
    /**
     * 背包(暂时主要是副武器) 
     */
    private game;
    constructor() {
        this.game = Laya.Browser.window.game;
        //this.initBagData();
        // Laya.Browser.window.bagList = this.bagList;
    }
    public static getInstance(): BagDataControl {
        if (!BagDataControl._instance) {
            BagDataControl._instance = new BagDataControl();
        }
        return BagDataControl._instance;
    }
    public initBagData(data: userDataRequestBack): void {
        if (!this.bagList) {
            this.bagList = new HashMap();
            Laya.Browser.window.bagList = this.bagList;
            //都是临时的  正式会从服务器取值
            // const key: string = JSON.stringify(202);
            // const value: any = { fire: 1, power: 1, num: 3 };
            // this.bagList.add(key, value);
            // this.bagList.add("201", { fire: 1, power: 1, num: 3 });
            // this.bagList.add("203", { fire: 1, power: 1, num: 3 });
            let i: string;
            //金币 体力数据初始化
            if (data.bagSecondaryWeapon) {
                for (i in data.bagSecondaryWeapon) {
                    this.bagList.add(/*"208"||*/i, { fire: data.bagSecondaryWeapon[i].fireLvl, power: data.bagSecondaryWeapon[i].powerLvl, num: data.bagSecondaryWeapon[i].num });
                }
            }
            this.updateBagCommon(data);
        }
        // const itemData = FixedDataTables.getInstance().getData(DataType.item);
        // this.bagList.add("102", { num: Number(itemData[102].first) });
        // this.bagList.add("103", { num: Number(itemData[103].first) });
        // this.bagList.add("101", { num: Number(itemData[101].first) });
        // this.game.gold = Number(itemData[101].first);
    }
    updateBagCommon(data: any) {
        if (data.bagCommon) {
            let i: string;
            for (i in data.bagCommon) {
                this.bagList.add(i, { num: data.bagCommon[i].num })
            }
            if (data.bagCommon[101]) {
                this.game.gold = data.bagCommon[101].num;
            }
        }
    }
    getBagDataById(id: string): any {

        return this.bagList.get(typeof (id) === "string" ? id : JSON.stringify(id));
    }
    /**
     * 
     * @param e 
     * 更新背包新  根据最新后端在小模块中返回的数据来返回
     */
    updateBagDate_new(e: any) {
        const bagArr = [];

        if (e.bagCommon) {
            const bagCommon = JSON.parse(e.bagCommon);
            let i: string;
            for (i in bagCommon) {
                bagArr.push(bagCommon[i]);
            }
            this.setAnimationConsumePower(bagCommon[103]);
            PlayingControl.instance.setMoneyData();
        }
        if (e.bagSecondaryWeapon) {
            const bagSecondaryWeapon = JSON.parse(e.bagSecondaryWeapon);
            let j;
            for (j in bagSecondaryWeapon) {
                bagArr.push(bagSecondaryWeapon[j]);
            }
        }
        if (e.achieve) {
            //更新成就数据
            PlayingVar.getInstance().updateAchieve(JSON.parse(e.achieve));
        }
        this.setBagData(bagArr);
    }
    setBagData(data: any) {
        const moneyArr: Array<string> = ["101", "103", "102"];
        var needUpdateMoney: boolean = false;
        if (Array.isArray(data)) {
            let i = 0;
            for (i; i < data.length; i++) {
                let id = data[i].id.toString();
                if (!this.bagList.has(id)) {
                    this.bagList.add(id, { fire: 1, power: 1, num: data[i].num || 1 })
                } else {
                    const dataOne = this.bagList.get(id);
                    let j;
                    for (j in data[i]) {
                        if (j == "id") {
                            if (moneyArr.indexOf(data[i][j].toString()) >= 0) {
                                needUpdateMoney = true;
                            }
                            continue;
                        }
                        if (j === "fireLvl" || j === "powerLvl") {
                            const jsonTo = { fireLvl: "fire", powerLvl: "power" };
                            dataOne[jsonTo[j]] = data[i][j];
                        } else {
                            dataOne[j] = data[i][j];
                        }
                    }
                }
            }
        } else {
            if (!data.id) {
                console.error("修改Bag信息失败~！");
                return;
            }
            let id: string = data.id.toString();
            if (!this.bagList.has(id)) {
                this.bagList.add(id, { fire: 1, power: 1, num: 1 })
            } else {
                const dataOne = this.bagList.get(id);
                if (dataOne) {
                    let i;
                    for (i in data) {
                        if (i == "id") {
                            if (moneyArr.indexOf(data[i].toString()) >= 0) {
                                needUpdateMoney = true;
                            }
                            continue;
                        }
                        if (i === "fireLvl" || i === "powerLvl") {
                            const jsonTo = { fireLvl: "fire", powerLvl: "power" };
                            dataOne[jsonTo[i]] = data[i];
                        } else {
                            dataOne[i] = data[i];
                        }
                    }
                }
            }

        }
        if (needUpdateMoney) {
            PlayingControl.instance.setMoneyData();
        }
    }
    deleteBagData(id: any): void {
        if (Array.isArray(id)) {

        } else {
            if (this.hasId(id)) {
                this.bagList.remove(id);
            }
        }
    }
    hasId(id: any): boolean {
        return this.bagList.has(id);
    }
    setAnimationConsumePower(data: any) {
        const lastNum = this.getBagDataById("103").num;
        if ((data === void 0) || (data && Number(data.num) === lastNum)) {
            return;
        }
        const plusValue = Number(data.num) - lastNum;
        if (plusValue >= 0) {
            return;
        }
        const plussValueStr = plusValue > 0 ? "+" + plusValue : JSON.stringify(plusValue);

        const powerImg = new Laya.Image("commonPic/体力图标.png");
        const mainPowerImg: Laya.Image = PlayingControl.instance.owner["img_mainPower"];
        powerImg.pos(mainPowerImg.x + mainPowerImg.parent["x"], mainPowerImg.y + mainPowerImg.parent["y"]);
        powerImg.zOrder = 2000;
        Laya.stage.addChild(powerImg);
        const roleObj = PlayingControl.instance.roleObj;
        Laya.Tween.to(powerImg, { x: roleObj.x + 100, y: roleObj.y }, 1000, null, Laya.Handler.create(this, this.createConsumePower, [powerImg, plussValueStr]))
    }
    createConsumePower(imgObj: Laya.Image, plussValueStr: string) {
        Laya.Tween.clearAll(imgObj);
        imgObj.destroy();
        const diamondPreab = PlayingControl.instance.getDiamond;
        let aniDiamond: Laya.Sprite = Laya.Pool.getItemByCreateFun("getDiamond", diamondPreab.create, diamondPreab);
        aniDiamond.texture = Laya.loader.getRes("commonPic/体力图标.png");
        aniDiamond.alpha = 1;
        aniDiamond.scale(1, 1);
        // 数量显示
        const numberDiamonds = aniDiamond.getChildByName('numberDiamonds') as LYFontClip;
        numberDiamonds.visible = false;
        const reduceObj = aniDiamond.getChildByName("reduceNumber") as LYFontClip;
        reduceObj.visible = true;
        reduceObj.value = plussValueStr;
        console.error("消耗的体力值为: ", plussValueStr);
        const roleObj = PlayingControl.instance.roleObj;
        aniDiamond.pos(roleObj.x, roleObj.y - 100);
        aniDiamond.zOrder = 2000;
        Laya.stage.addChild(aniDiamond);
        const timeline = new Laya.TimeLine();
        timeline.addLabel("move", 0).to(aniDiamond, { y: aniDiamond.y - 80 }, 1000, null, 0).addLabel("changeAlpha", 900).to(aniDiamond, { alpha: 0 }, 500, null, 0);
        timeline.play("move", true);
        timeline.on(Laya.Event.COMPLETE, this, this.moveEnd, [aniDiamond, timeline]);
        //timeline.on(Laya.Event.LABEL, this, this.onLabel);
    }
    moveEnd(aniObj: Laya.Sprite,timeObj:Laya.TimeLine) {
        timeObj.destroy();
        Laya.timer.frameOnce(3, this, () => {
            aniObj.destroy();
        });
    }
}