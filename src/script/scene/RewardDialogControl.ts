import Data from "../Data/DataTables"
import Datas from "../Data/JsonEnum"
import DataType = Datas.DataType;
import BagDataControl from "../manage/BagDataControl";
import toast from "../manage/toast";
export default class RewardDialogControl extends Laya.Script {
    constructor() { super(); }
    private self: Laya.Dialog;
    private label_name: Laya.Label;
    private num0: Laya.Sprite;
    private num1: Laya.Sprite;
    private item0: Laya.Sprite;
    private item1: Laya.Sprite;
    private configInstance: Data.FixedDataTables;
    onEnable(): void {
        this.self = this.owner as Laya.Dialog;
        this.configInstance = Data.FixedDataTables.getInstance();
        // this.self.onOpened = this.onOpened;
        this.initVars();
        this.initListener();

    }
    initListener() {
        this.self["img_close"].on(Laya.Event.CLICK, this, () => {
            this.self.close();
        });
    }
    initVars() {
        this.label_name = this.self["label_name"];
        this.item0 = this.self["item0"];
        this.item1 = this.self["item1"];
        this.num1 = this.self["num1"];

    }

    onOpened(e: any) {
        // (this as Laya.Dialog).getComponent(Laya.Script).
        const rewardObj = JSON.parse(e.bagSecondaryWeapon);
        const rewardPower = JSON.parse(e.bagCommon);
        let pic = this.configInstance.getDataByKey(DataType.secondaryWeapon, Number(Object.keys(rewardObj)[0]), "pic");

        const iconImage0: Laya.Image = this.item0.getChildAt(2) as Laya.Image;
        // if (pic.indexOf("_") === -1) {
        iconImage0.skin = "shop/" + pic + "_shop.png";
        // } else {
        // iconImage0.skin = "shop/激光炮_shop.png";
        // }
        iconImage0.scaleX = 0.8;
        iconImage0.scaleY = 0.8;

        //是否是新获得
        const isNew: boolean = !BagDataControl.getInstance().hasId(Object.keys(rewardObj)[0]);
        (this.item0.getChildAt(3) as Laya.Sprite).visible = isNew;
        (this.item0.getChildAt(0) as Laya.Sprite).visible = isNew;
        (this.item0.getChildAt(4) as Laya.Label).visible = false;

        (this.item1.getChildAt(4) as Laya.Sprite).visible = true;
        (this.item1.getChildAt(3) as Laya.Sprite).visible = false;
        (this.item1.getChildAt(0) as Laya.Sprite).visible = false;
        const iconImage1 = this.item1.getChildAt(2) as Laya.Image;
        iconImage1.skin = "shop/商城体力图标.png";
        iconImage1.scaleX = 1;
        iconImage1.scaleY = 1;
        this.label_name.text = this.configInstance.getDataByKey(DataType.secondaryWeapon, Number(Object.keys(rewardObj)[0]), "name");
    }
    onDisable(): void {
    }
}