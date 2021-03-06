import Data from "../Data/DataTables"
import Datas from "../Data/JsonEnum"
import BagDataControl from "../manage/BagDataControl";
import DataType = Datas.DataType;
export default class RewardTenControl extends Laya.Script {
    /** @prop {name:rewardItem, tips:"item", type:Prefab}*/
    public rewardItem: Laya.Prefab;
    constructor() { super(); }
    private readonly initPosXY = { x: 137, y: 315 };
    private readonly initwh = { w: 318 - 137, h: 474 - 315 };
    private self: Laya.Dialog;
    private itemParent: Laya.Sprite;
    //新获得的num
    private fc_newNum: Laya.FontClip;
    private configInstance: Data.FixedDataTables;
    onEnable(): void {
        this.self = this.owner as Laya.Dialog;
        this.initVars();
        this.initListener();
        // this.self.onOpened = this.opened;
    }
    initVars() {
        this.itemParent = this.self["itemParent"];
        this.fc_newNum = this.self["fc_newNum"];
        // Laya.Browser.window.fc_newNum = this.fc_newNum;
        this.configInstance = Data.FixedDataTables.getInstance();
    }

    opened(e: any) {
        this.initRewardItem(e);
        BagDataControl.getInstance().updateBagDate_new(e);
    }

    initRewardItem(data: any) {
        const equipReward = JSON.parse(data.bagSecondaryWeapon);

        //解析rewardEquip
        const rewardArr = parseRewardEquip(equipReward);
        if (rewardArr.length !== 10) {
            // debugger;
        }
        // this.getNowObtainReward();
        const powerReward = JSON.parse(data.bagCommon);
        //之前未创建过
        let i: number = 0;
        let newIndex: number = 0;
        for (i; i < rewardArr.length; i++) {
            const pic = this.configInstance.getDataByKey(DataType.secondaryWeapon, rewardArr[i], "pic");
            const rewardItem: Laya.Sprite = Laya.Pool.getItemByCreateFun("rewardItem", this.rewardItem.create, this.rewardItem);
            //rewardItem
            if (i === 9) {
                rewardItem.pos(219, 315 + this.initwh.h * (Math.floor(i / 3)));
            } else {
                rewardItem.pos(137 + this.initwh.w * (i % 3), 315 + this.initwh.h * (Math.floor(i / 3)));
            }
            // if (pic.indexOf("_") === -1) {
            (rewardItem.getChildAt(2) as Laya.Image).skin = "shop/" + pic + "_shop.png";
            // } else {
            // (rewardItem.getChildAt(2) as Laya.Image).skin = "shop/激光炮_shop.png";
            // }
            const isNew: boolean = !BagDataControl.getInstance().hasId(rewardArr[i].toString());
            (rewardItem.getChildAt(3) as Laya.Sprite).visible = isNew;
            (rewardItem.getChildAt(0) as Laya.Sprite).visible = isNew;
            (rewardItem.getChildAt(4) as Laya.Image).visible = false;
            this.itemParent.addChild(rewardItem);
            if (isNew) {
                newIndex++;
            }
        }
        const rewardDiamondItem: Laya.Sprite = Laya.Pool.getItemByCreateFun("rewardItem", this.rewardItem.create, this.rewardItem);
        (rewardDiamondItem.getChildAt(3) as Laya.Sprite).visible = false;
        this.itemParent.addChild(rewardDiamondItem);
        const index = i - 1;
        const posXy = { x: 0, y: 0 }
        if (index === 9) {
            posXy.x = 219;
            posXy.y = 315 + this.initwh.h * (Math.floor(index / 3));
        } else {
            posXy.x = 137 + this.initwh.w * (i % 3);
            posXy.y = 315 + this.initwh.h * (Math.floor(i / 3));

        }
        (rewardDiamondItem.getChildAt(2) as Laya.Image).skin = "commonPic/钻石大图标.png";
        const nowDiamondNum = BagDataControl.getInstance().getBagDataById("102").num;
        const addNum = powerReward[102].num - nowDiamondNum;
        (rewardDiamondItem.getChildAt(4) as Laya.Label).changeText("x" + addNum);

        rewardDiamondItem.pos(posXy.x, posXy.y);
        const rewardPowerItem: Laya.Sprite = Laya.Pool.getItemByCreateFun("rewardItem", this.rewardItem.create, this.rewardItem);
        const index2 = i + 1;
        const posXy2 = { x: 0, y: 0 };
        if (index2 === 9) {
            posXy2.x = 219;
            posXy2.y = 315 + this.initwh.h * (Math.floor(index2 / 3));
        } else if (index2 < 9) {
            posXy2.x = 137 + this.initwh.w * (index2 % 3);
            posXy2.y = 315 + this.initwh.h * (Math.floor(index2 / 3));
        }
        else {
            posXy2.x = 410;
            posXy2.y = 792;
        }
        rewardPowerItem.pos(posXy2.x, posXy2.y);
        const numSprite = rewardPowerItem.getChildAt(4) as Laya.Label;
        numSprite.visible = true;
        numSprite.changeText("x10");
        (rewardPowerItem.getChildAt(3) as Laya.Sprite).visible = false;
        (rewardPowerItem.getChildAt(0) as Laya.Sprite).visible = false;
        const powerIcon = rewardPowerItem.getChildAt(2) as Laya.Image;

        powerIcon.skin = "shop/商城体力图标.png";
        Laya.Browser.window.powerIcon = powerIcon;
        powerIcon.scaleX = 1;
        powerIcon.scaleY = 1;
        this.fc_newNum.value = "" + newIndex;
        this.itemParent.addChild(rewardPowerItem);
        function parseRewardEquip(equipReward) {
            let markArr = [];
            let j;
            for (j in equipReward) {
                let k: number = 0;
                // console.error("BagDataControl.getInstance().getBagDataById(equipReward[j].Value.id)", BagDataControl.getInstance().getBagDataById(equipReward[j].Value.id));
                const bagNowIdObj: any = BagDataControl.getInstance().getBagDataById(j);
                let bagNowNum = bagNowIdObj ? bagNowIdObj.num : 0;
                let getNum = equipReward[j].num - bagNowNum;
                for (k; k < getNum/*equipReward[j].Value.num*/; k++) {
                    markArr.push(equipReward[j].id);
                }
            }
            return markArr;
        }
    }

    initListener() {
        (this.self["sprite_close"] as Laya.Sprite).on(Laya.Event.CLICK, this, () => {
            this.itemParent.removeChildren();
            this.self.close();
        });
    }
}