import PlayingVar from "../manage/Playing_var"
import role from "../role/role"
import MainWeaponData from "../manage/MainWeaponData"
import BagDataControl from "../manage/BagDataControl"
import SecondWeaponData from "../manage/SecondWeaponData"
import data from "../Data/DataTables"
import data2 from "../Data/JsonEnum"
import DataType = data2.DataType;
import FixedDataTables = data.FixedDataTables;
import toast from "../manage/toast"
import PopDialogControl from "../scene/PopDialogControl";
import PlayingControl from "../playing/PlayingSceneControl";
import HttpModel from "../Connect/HttpClass"
import HttpModel2 from "../Connect/HttpEnum"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import { tools } from "../Tools/Tool";
import Music from "../manage/Music";

export default class EquipUpdate extends Laya.Script {
    /** @prop {name:toast,tips:"toast",type:Prefab} */
    toast: Laya.Prefab;
    private static _instance: EquipUpdate;
    private _alreadySelected: boolean;
    private game: any;
    private updatePanel: Laya.Sprite;
    constructor() {
        super();
        EquipUpdate._instance = this;
        this.game = Laya.Browser.window.game;
    }
    private listMain: Laya.List;
    public listVice: Laya.List;
    private tab: Laya.Tab;
    private vicePos: any;
    //副武器表
    private secondaryWeaponConfig: any;
    private bagInstance: BagDataControl;
    onEnable() {
        const self = this.owner.getChildAt(0) as Laya.Tab;
        this.tab = self;
        this.bagInstance = BagDataControl.getInstance();
        this.secondaryWeaponConfig = FixedDataTables.getInstance().getData(DataType.secondaryWeapon);
        self.selectHandler = new Laya.Handler(this, this.onSelect);
        this.updatePanel = this.owner.getChildByName("updatePanel") as Laya.Sprite;
        // this.listMain = this.owner.getChildAt(1) as Laya.List;
        // this.listMain.repeatY = 1;
        this.listVice = this.owner.getChildAt(2) as Laya.List;
    }
    /**
     * 
     * @param b box
     * @param i 0升级火力 1升级速度|威力
     * 
     * 升级武器
     */
    onUpdateBtn(b: any, i: number): void {
        Music.getInstance().playSound(MusicEnum.musicToUrl.button_normal);
        // console.error("--------", b, "---------", i);
        //console.log(i, b);
        const nowGoldNum = BagDataControl.getInstance().getBagDataById(JSON.stringify(101)).num;
        if (this.tab.selectedIndex) {
            // toast.noBindScript("稍后开启");
            // return;

            //升级副武器
            const consumeType = b.consumeType[0];
            const selectSecondData = BagDataControl.getInstance().getBagDataById(this.game.secondWeapon.selected);
            let haveWeaponNum: number = selectSecondData.num - b.consume;
            //consumeType === 2消耗自身 =1消耗金币
            var changeArg = { id: 201 || this.game.secondWeapon.selected };
            if (consumeType === 2) {
                if (selectSecondData && selectSecondData.num && selectSecondData.num >= (b.consume + 1)) {
                    if (i === 0) {
                        BagDataControl.getInstance().setBagData({ id: this.game.secondWeapon.selected.toString(), fire: selectSecondData.fire + 1, num: haveWeaponNum });

                        changeArg["fireLvl"] = SecondWeaponData.getInstance().getItemFireLevel();
                    } else {
                        BagDataControl.getInstance().setBagData({ id: this.game.secondWeapon.selected.toString(), power: selectSecondData.power + 1, num: haveWeaponNum });

                        changeArg["powerLvl"] = SecondWeaponData.getInstance().getItemPowerLevel();
                    }
                    this.dataFillSecondWeapon();
                    this.listVice.refresh();
                    changeArg["num"] = haveWeaponNum;

                } else {
                    //前往获得
                    toast.noBindScript("消耗的服务器的数量不足!");
                }
            } else {
                if (nowGoldNum >= b.consume) {
                    if (i === 0) {
                        BagDataControl.getInstance().setBagData({ id: this.game.secondWeapon.selected.toString(), fire: selectSecondData.fire + 1 });
                        changeArg["fireLvl"] = SecondWeaponData.getInstance().getItemFireLevel();
                    } else {
                        BagDataControl.getInstance().setBagData({ id: this.game.secondWeapon.selected.toString(), power: selectSecondData.power + 1 });
                        changeArg["powerLvl"] = SecondWeaponData.getInstance().getItemPowerLevel();
                    }
                    BagDataControl.getInstance().setBagData({ id: JSON.stringify(101), num: nowGoldNum - b.consume });
                } else {
                    const dec = "消耗的物品数量不足,是否前往获得？";
                    Laya.Scene.open("test/popDialog.scene", false, { "txt": dec, type: 1 });
                }
            }
            this.showUpdatePanel(1);
            toast.noBindScript("升级成功！");
            const urls: string = (HttpModel2.URLSERVER + HttpModel2.httpUrls.UpSecondaryWeapon);
            const args: any = { uuId: PlayingVar.getInstance().uuId, bagSecondaryWeapon: { [201 || this.game.secondWeapon.selected]: changeArg } };
            const httpClass = new HttpModel.HttpClass(Laya.Handler.create(this, (e: any) => {
                //收到回调
                console.error(e);
            }), urls, JSON.stringify(args));

            // if (selectSecondData && selectSecondData.num && selectSecondData.num >= (b.consume + 1)) {
            //     let haveNum: number = selectSecondData.num - b.consume;
            //     if (i === 0) {
            //         BagDataControl.getInstance().setBagData({ id: this.game.secondWeapon.selected.toString(), fire: selectSecondData.fire + 1, num: selectSecondData.num });
            //     } else {
            //         BagDataControl.getInstance().setBagData({ id: this.game.secondWeapon.selected.toString(), power: selectSecondData.power + 1, num: selectSecondData.num });
            //     }
            //     // this.listMain.array = this.dataFillFireAndSpeed();
            //     // this.listMain.refresh();
            //     this.showUpdatePanel(1);
            //     // this.dataFillSecondWeapon();
            //     // this.listVice.refresh();
            //     toast.noBindScript("升级成功！");
            // } else {
            //     Laya.Scene.open("test/popDialog.scene", false, null, Laya.Handler.create(this, (s: Laya.Scene) => {
            //         const dialogObj = s.getComponent(PopDialogControl);
            //         dialogObj.setPopText("消耗的物品数量不足,是否前往获得？");
            //         Laya.Browser.window.markS = s.getComponent(PopDialogControl);
            //     }));

            // }
        } else {
            //升级主武器
            var args: any;
            if (nowGoldNum >= b.consume) {
                switch (i) {
                    case 0:
                        this.game.mainWeapon.hpLevel++;
                        args = { uuId: PlayingVar.getInstance().uuId, mainWeapon: { hpLvl: this.game.mainWeapon.hpLevel } };
                        break;
                    case 1:
                        this.game.mainWeapon.fireLevel++;
                        args = { uuId: PlayingVar.getInstance().uuId, mainWeapon: { fireLvl: this.game.mainWeapon.fireLevel } };

                        break;
                    case 2:
                        this.game.mainWeapon.speedLevel++;
                        args = { uuId: PlayingVar.getInstance().uuId, mainWeapon: { shotSpeed: this.game.mainWeapon.speedLevel } };

                        break;
                    default:
                        break;
                }

                BagDataControl.getInstance().setBagData({ id: JSON.stringify(101), num: nowGoldNum - b.consume });
                //this.game.gold -= b.dataSource.consume;
                MainWeaponData.getInstance().updateMainWeapon();

                // this.listMain.array = this.dataFillFireAndSpeed();
                // this.listMain.refresh();
                //更新界面显示
                this.showUpdatePanel(0);
                const urls: string = (HttpModel2.URLSERVER + HttpModel2.httpUrls.UpWeapon);
                const httpClass = new HttpModel.HttpClass(Laya.Handler.create(this, (e: any) => {
                    //收到回调
                    console.error(e);
                }), urls, JSON.stringify(args));
                toast.noBindScript("升级成功!")
            } else {
                const dec = "消耗的物品数量不足,是否前往获得？";
                Laya.Scene.open("test/popDialog.scene", false, { "txt": dec, type: 1 });
            }
        }
    }
    getPosition(): any {
        if (!this.vicePos) {
            this.vicePos = (this.owner as Laya.Sprite).localToGlobal(new Laya.Point(this.listVice.x, this.listVice.y));
        }
        return this.vicePos;
    }
    propagation(e: Laya.Event) {
        e.stopPropagation();
    }
    createListVice() {
        this.listVice.repeatX = 10;
        this.listVice.repeatY = 1;
        this.listVice.spaceX = 0;
        this.listVice.hScrollBarSkin = "";
        this.listVice.selectEnable = true;
        // this.listVice.selectHandler = new Laya.Handler(this, this.onSelectViceType);
        this.listVice.renderHandler = new Laya.Handler(this, this.updateItemSelectViceType);
        this.listVice.mouseHandler = new Laya.Handler(this, this.onMouseList);
        this.dataFillSecondWeapon();
    }
    private maskViceSelect: number;
    onSelectViceType(index: number): void {
        //lastObj.skin = "equip/装备框_选中.png";
        const cell: Laya.Box = this.listVice.getCell(index);
        if (!cell.dataSource.LevelAndNum) {
            const dec: string = SecondWeaponData.getInstance().unlockCondition(cell.dataSource.id);
            toast.noBindScript(dec);
            return;
        } else {
            this.game.secondWeapon.selected = Number(cell.dataSource.id);
            this.showUpdatePanel(1);
        }
        this.maskViceSelect = this.listVice.selectedIndex;
        //刷新武器的显示~
        PlayingVar.getInstance().roleSecondaryEquipType = this.maskViceSelect;
        PlayingControl.instance.setEquipType(cell.dataSource.id)
        console.log("现在选择的副武器类型为 :", this.maskViceSelect);
    }
    updateItemSelectViceType(cell: Laya.Box, index: number): void {
        const haveNumObj: Laya.Label = cell.getChildByName("label_haveNum") as Laya.Label;
        const img_lock: Laya.Image = cell.getChildByName("img_lock") as Laya.Image;
        const img_di: Laya.Button = cell.getChildByName("btn_di") as Laya.Button;
        const img_icon: Laya.Image = cell.getChildByName("img_icon") as Laya.Image;
        if (this.game.secondWeapon.selected && cell.dataSource.id === this.game.secondWeapon.selected) {
            //是选中的副武器
            img_di.skin = "face/装备框_选中.png";
            if (cell.dataSource.LevelAndNum.num - 1 > 0) {
                haveNumObj.visible = true;
                haveNumObj.text = JSON.stringify(cell.dataSource.LevelAndNum.num - 1);
            } else {
                haveNumObj.visible = false;
            }
            img_lock.visible = false;
            img_di.visible = true;
        } else if (cell.dataSource.LevelAndNum && cell.dataSource.LevelAndNum.num) {
            img_di.skin = "face/装备框.png";
            img_di.visible = true;
            haveNumObj.visible = false;
            img_lock.visible = false;
        } else {
            img_di.skin = "face/装备框_灰.png";
            img_di.visible = false;
            haveNumObj.visible = false;
            img_lock.visible = true;
        }
        img_icon.skin = "shop/" + cell.dataSource.icon + ".png";
    }
    createListMain() {
        //List相关
        const list: Laya.List = this.listMain;
        list.repeatX = 1;
        list.repeatY = 2;
        list.spaceY = 2;
        // 使用但隐藏滚动条
        list.vScrollBarSkin = "";
        list.selectEnable = true;
        list.selectHandler = new Laya.Handler(this, this.onSelectList);
        list.renderHandler = new Laya.Handler(this, this.updateItem);

        list.array = this.dataFillFireAndSpeed();
    }
    /**
     * 副武器list数据填充
     */
    dataFillSecondWeapon(): void {
        const secondaryWeaponKeys = Object.keys(this.secondaryWeaponConfig);

        secondaryWeaponKeys.sort((a, b) => {

            const b_value = BagDataControl.getInstance().getBagDataById(b.toString());
            const a_value = BagDataControl.getInstance().getBagDataById(a.toString());
            if (!a_value) {
                return 1;
            }
            if (!b_value) {
                return -1;
            }
            const b_value_num = b_value.num;
            const a_value_num = a_value.num;
            if (a_value_num && !b_value_num) {
                return -1;
            } else if (!a_value_num && b_value_num) {
                return 1;
            }
            return -1;
        });

        let data: Array<any> = [];

        for (var m: number = 0; m < secondaryWeaponKeys.length; m++) {
            let oneJson = { id: 0, LevelAndNum: 0, icon: "" };
            oneJson.id = Number(secondaryWeaponKeys[m]);
            oneJson.LevelAndNum = BagDataControl.getInstance().getBagDataById(oneJson.id.toString()) || 0;
            oneJson.icon = FixedDataTables.getInstance().getDataByKey(DataType.secondaryWeapon, oneJson.id, "pic") + "_shop";
            data.push(oneJson);
        }
        this.listVice.array = data;
    }
    /**
     * 火力和速度的数据填充
     */
    dataFillFireAndSpeed(): Array<any> {
        var data: any = [];
        for (var m: number = 0; m < 2; m++) {
            var map: any;
            if (m) {
                //速度|威力
                if (this.tab.selectedIndex) {
                    //副武器
                    map = { typeUrl: "face/射速.png", consume: SecondWeaponData.getInstance().getspeed_cost() };
                    map.level = SecondWeaponData.getInstance().getItemPowerLevel();
                    map.value = SecondWeaponData.getInstance().getShowPower();
                    map.consumeType = SecondWeaponData.getInstance().getCostType();
                } else {
                    console.log(this.game.mainWeapon.speedLevel);
                    map = { typeUrl: "face/射速.png", level: this.game.mainWeapon.speedLevel, consume: MainWeaponData.getInstance().speed_gold };
                    map.value = MainWeaponData.getInstance().getShowSpeed();
                }
            } else {
                //火力
                if (this.tab.selectedIndex) {
                    //副武器
                    map = { typeUrl: "face/火力.png", value: SecondWeaponData.getInstance().getItemFireLevel(), consume: SecondWeaponData.getInstance().getFire_cost() };
                    map.level = SecondWeaponData.getInstance().getItemFireLevel();
                    map.value = SecondWeaponData.getInstance().getShowFire();
                    map.consumeType = SecondWeaponData.getInstance().getCostType();
                } else {
                    map = { typeUrl: "face/火力.png", level: this.game.mainWeapon.fireLevel, consume: MainWeaponData.getInstance().fire_gold };
                    map.value = MainWeaponData.getInstance().getShowFire();
                }

            }
            data.push(map);
        }
        return data;
    }

    showUpdatePanel(type: number) {
        if (!this.game.secondWeapon.selected && type === 1) {
            return;
        }
        let itemSprite: Laya.Sprite;
        const createNum = type === 0 ? 3 : 2;
        const itemPrefab: Laya.Prefab = PlayingControl.instance.UpdateItem;
        if (!this.updatePanel.numChildren) {
            let i: number = 0;
            for (i; i < createNum; i++) {
                itemSprite = Laya.Pool.getItemByCreateFun("updateItem", itemPrefab.create, itemPrefab);
                itemSprite.pos(-3, 558 + 100 * i);
                this.setItemInfo(type, i, itemSprite);
                this.updatePanel.addChild(itemSprite);
            }

        } else {
            let i: number = 0;
            for (i; i < createNum; i++) {
                if (i >= this.updatePanel.numChildren) {
                    itemSprite = Laya.Pool.getItemByCreateFun("updateItem", itemPrefab.create, itemPrefab);
                    itemSprite.pos(-3, 558 + 100 * i);
                    this.updatePanel.addChild(itemSprite);
                } else {
                    itemSprite = this.updatePanel._children[i];
                    itemSprite.visible = true;
                }
                this.setItemInfo(type, i, itemSprite);
            }
        }
        Laya.Browser.window.updatePanel = this.updatePanel;
        if (type !== 0) {
            this.updatePanel.y = -872/*98*/;
            this.updatePanel.numChildren > 2 && (this.updatePanel._children[this.updatePanel.numChildren - 1].visible = false);
        } else {
            this.updatePanel.y = -872 - 1 - 98;
        }
    }
    setItemInfo(type: number, index: number, obj: Laya.Sprite) {
        let sendArgObj = {};

        //等级
        const fc_level: Laya.FontClip = obj.getChildByName("fc_level") as Laya.FontClip;
        //数值
        const itemValue: Laya.FontClip = obj.getChildByName("itemValue") as Laya.FontClip;
        //货币图标
        const consumeIcon: Laya.Image = obj.getChildByName("consumeIcon") as Laya.Image;
        //升级需要的值
        const fc_consumeNum: Laya.FontClip = obj.getChildByName("fc_consumeNum") as Laya.FontClip;
        //升级的属性
        const img_updateIcon: Laya.Image = obj.getChildByName("img_updateIcon") as Laya.Image;
        switch (index) {
            case 0:
                if (type === 0) {
                    //飞机的血
                    fc_level.value = "[" + this.game.mainWeapon.hpLevel + "]";
                    itemValue.value = "" + MainWeaponData.getInstance().getShowHp();
                    img_updateIcon.skin = "face/生命.png";  //hp属性图标
                    fc_consumeNum.value = "" + tools.converteNum(MainWeaponData.getInstance().hp_gold);
                    sendArgObj["consume"] = MainWeaponData.getInstance().hp_gold;

                } else {
                    fc_level.value = "[" + SecondWeaponData.getInstance().getItemFireLevel() + "]";
                    itemValue.value = "" + SecondWeaponData.getInstance().getShowFire();
                    img_updateIcon.skin = "face/火力.png";
                    fc_consumeNum.value = "" + tools.converteNum(SecondWeaponData.getInstance().getFire_cost());
                    sendArgObj["consume"] = SecondWeaponData.getInstance().getFire_cost();
                    sendArgObj["consumeType"] = SecondWeaponData.getInstance().getCostType();
                }
                break;
            case 1:
                if (type === 0) {
                    fc_level.value = "[" + this.game.mainWeapon.fireLevel + "]";
                    itemValue.value = "" + MainWeaponData.getInstance().getShowFire();
                    img_updateIcon.skin = "face/火力.png";
                    fc_consumeNum.value = "" + tools.converteNum(MainWeaponData.getInstance().fire_gold);
                    consumeIcon.skin = "commonPic/金币图标.png";
                    sendArgObj["consume"] = MainWeaponData.getInstance().fire_gold;
                } else {
                    fc_level.value = "[" + SecondWeaponData.getInstance().getItemPowerLevel() + "]";
                    itemValue.value = "" + SecondWeaponData.getInstance().getShowPower();
                    img_updateIcon.skin = "face/射速.png";
                    fc_consumeNum.value = "" + tools.converteNum(SecondWeaponData.getInstance().getspeed_cost());

                    sendArgObj["consume"] = SecondWeaponData.getInstance().getspeed_cost();
                    sendArgObj["consumeType"] = SecondWeaponData.getInstance().getCostType();
                }
                break;
            case 2:
                fc_level.value = "[" + this.game.mainWeapon.speedLevel + "]";
                itemValue.value = "" + MainWeaponData.getInstance().getShowSpeed();
                img_updateIcon.skin = "face/射速.png";
                fc_consumeNum.value = "" + tools.converteNum(MainWeaponData.getInstance().speed_gold);
                consumeIcon.skin = "commonPic/金币图标.png";
                sendArgObj["consume"] = MainWeaponData.getInstance().speed_gold;
                break;
            default:
                break;
        }
        if (fc_consumeNum.value.length >= 6) {
            fc_consumeNum.scale(0.8, 0.8);
        } else {
            fc_consumeNum.scale(1, 1);
        }
        //升级需要的货币的图标
        consumeIcon.skin = "commonPic/金币图标.png";
        //监听升级按钮
        const updateBtn: Laya.Button = obj.getChildByName("btn_update") as Laya.Button;
        updateBtn.on(Laya.Event.CLICK, this, this.onUpdateBtn, [sendArgObj, index]);
    }
    onSelect(index: number) {
        Music.getInstance().playSound(MusicEnum.musicToUrl.button_normal);

        index !== 2 && index !== -1 && role.instance.moveRoleInMain("up");
        this._alreadySelected = true;
        switch (index) {
            case 0:
                //准备重新中
                this.showUpdatePanel(index);
                //主武器
                this.updatePanel.visible = true;
                this.listVice.visible = false;
                break;
                if (!this.listMain.length) {
                    this.createListMain();
                } else {
                    this.listMain.array = this.dataFillFireAndSpeed();
                    this.listMain.refresh();
                }
                Laya.Browser.window.listMain = this.listMain;
                break;
            case 1:
                //判断是否有副武器

                // if (!this.judgeSecondWeaponHave()) {
                //     toast.noBindScript("暂未获得副武器,请先通关第五关或者去商店获取!");
                //     break;
                // }

                //重写
                this.showUpdatePanel(index);
                //副武器
                this.updatePanel.visible = true;
                this.listVice.visible = true;

                if (!this.listVice.length) {
                    this.createListVice();
                } else {
                    this.dataFillSecondWeapon();
                    this.listVice.refresh();
                }
                // if (!this.game.secondWeapon.selected) {
                //     this.updatePanel.visible = false;
                // }
                break;
            case 2:
                PlayingControl.instance.playMusicAndSound(1, musicToUrl.button_normal);
                Laya.Scene.open("test/Set.scene", false);
                console.error("点击了副武器~~!~~~");
                break;
            default:
                break;
        }

        this.owner.getChildByName("render")["x"] = -3.1;

    }

    private updateItem(cell: Laya.Box, index: number): void {
        //cell.setImg(cell.dataSource);
        //if (this.tab.selectedIndex === 0) {
        (cell.getChildByName("img_updateIcon") as Laya.Image).skin = cell.dataSource.typeUrl;
        (cell.getChildByName("fc_level") as Laya.FontClip).value = "[" + cell.dataSource.level + "]";
        (cell.getChildByName("fc_consumeNum") as Laya.FontClip).value = cell.dataSource.consume;
        (cell.getChildByName("itemValue") as Laya.FontClip).value = cell.dataSource.value;
        const consumeIconObj: Laya.Image = cell.getChildByName("consumeIcon") as Laya.Image;
        Laya.Browser.window.consumeIcon = consumeIconObj;
        if (this.tab.selectedIndex === 1) {
            // consumeIconObj.skin = "equip/主武器_机炮0.png";
            consumeIconObj.skin = "commonPic/金币图标.png";
            consumeIconObj.scaleX = 1;
            consumeIconObj.scaleY = 1;
        } else {
            consumeIconObj.skin = "commonPic/金币图标.png";
            consumeIconObj.scaleX = 1;
            consumeIconObj.scaleY = 1;
        }
        const enough: boolean = this.isEnough(this.tab.selectedIndex, cell.dataSource.consume);
        if (enough) {
        } else {
            //消耗数量需要变红~
        }
    }
    /**
     * 升级消耗的物品是否足够
     * @param type 1消耗金币 2消耗武器升级
     */
    private isEnough(type: number, consume: number): boolean {
        let enough: boolean = true;
        switch (type) {
            case 1:
                enough = BagDataControl.getInstance().getBagDataById("101").num > consume;
                break;
            case 2:
                const secondId = this.game.secondWeapon.selected;
                enough = this.game.consume <= (BagDataControl.getInstance().getBagDataById(secondId) ? BagDataControl.getInstance().getBagDataById(secondId).num - 1 : 0);
                break;
            default:
                break;
        }
        return enough;
    }
    private onSelectList(index: number): void {
        this._alreadySelected = true;
    }
    private touchStart: boolean;
    private onMouseList(e: Laya.Event, index: number) {
        //console.log(e.type);
        let lastObj = e.target as Laya.Button;
        switch (e.type) {
            case Laya.Event.MOUSE_DOWN:
                Laya.timer.clear(this, this.createDetail);
                this.touchStart = true;
                Laya.timer.once(350, this, this.createDetail, [index]);
                break;
            case Laya.Event.MOUSE_UP:
                Laya.timer.clear(this, this.createDetail);
                this.cancelDetail();
                break;
            case Laya.Event.MOUSE_OUT:
                Laya.timer.clear(this, this.createDetail);
                this.cancelDetail();
                break;
            case Laya.Event.CLICK:
                // console.error("点击item", e);
                Music.getInstance().playSound(MusicEnum.musicToUrl.button_normal);
                this.onSelectViceType(index);
                break;
            default:
                break;
        }
    }
    private detailObj: Laya.Image
    createDetail(index: number) {
        if (this.touchStart) {
            const cell: Laya.Box = this.listVice.getCell(index);
            const detail = PlayingControl.instance.ItemDetail;
            const detailObj: Laya.Image = Laya.Pool.getItemByCreateFun("ItemDetail", detail.create, detail);
            const secondId = cell.dataSource.id;
            const configs = FixedDataTables.getInstance().getData(data2.DataType.secondaryWeapon, secondId);
            detailObj["detailDec"] = configs.dec;
            detailObj["detailIcon"] = "shop/" + configs.pic + "_shop.png";
            detailObj["detailName"] = configs.name;
            detailObj.pos(Laya.stage.width / 2, Laya.stage.height * 0.57);
            Laya.stage.addChild(detailObj);
            this.detailObj = detailObj;
        }
    }
    cancelDetail() {
        if (this.detailObj) {
            this.detailObj.removeSelf();
            this.detailObj = null;
            this.touchStart = false;
        }
    }
    public static instance(): EquipUpdate {
        return EquipUpdate._instance;
    }
    public hideAllList(): void {

        role.instance.moveRoleInMain("down");
        if (this.updatePanel) {
            this.updatePanel.visible = false;
        }
        if (this.listVice) {
            this.listVice.visible = false;
        }
        this.tab.selectedIndex = -1;
    }
    public listVisile(): boolean {
        return this.updatePanel._children.length && (this.updatePanel.visible || this.listVice.visible);
    }
    public get alreadySelected(): boolean {
        return this._alreadySelected;
    }
    public set alreadySelected(v: boolean) {
        this._alreadySelected = v;
    }
    /**
     * 判断副武器是否有
     */
    judgeSecondWeaponHave() {
        const config = this.secondaryWeaponConfig;
        let i: string;
        for (i in config) {
            if (this.bagInstance.hasId(i)) {
                return true;
            }
        }
        return false;
    }
}
