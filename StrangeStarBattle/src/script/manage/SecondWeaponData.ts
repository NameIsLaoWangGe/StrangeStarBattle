import BagDataControl from "./BagDataControl"
import Data from "../Data/DataTables"
import Dat2 from "../Data/JsonEnum"
import DataType = Dat2.DataType;
import enemyToPerfab = Dat2.enemyToPerfab;
import FixedDataTables = Data.FixedDataTables;
export default class SecondWeaponData {
    private game: any;
    private static _instance;

    private _fire: number;
    private _speed: number;
    private _fire_cost: number;
    private _speed_cost: number;
    private _bulletSpeed: number;
    private _buffType: Array<string>;
    private _getIceSpeed: Array<number>;
    private _getFlottantT: number;
    private _bulletPrefab: string;
    private configNowWeapon: any;
    constructor() {
        this.game = Laya.Browser.window.game;
        this.configNowWeapon = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, this.game.secondWeapon.selected);
    }
    updateWeaponComfig() {
        this.configNowWeapon = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, this.game.secondWeapon.selected);
    }
    public static getInstance(): SecondWeaponData {
        if (!SecondWeaponData._instance) {
            SecondWeaponData._instance = new SecondWeaponData();
        }
        return SecondWeaponData._instance
    }
    getItemPowerLevel(markId?: number): number {
        return BagDataControl.getInstance().getBagDataById(markId || this.game.secondWeapon.selected).power;
    }
    getItemFireLevel(markId?: number): number {
        //console.log(BagDataControl.getInstance().getBagDataById(markId || this.game.secondWeapon.selected));
        Laya.Browser.window.BagDataControl = BagDataControl;
        return BagDataControl.getInstance().getBagDataById(markId || this.game.secondWeapon.selected).fire;
    }
    /**
     * 
     * @param select 选择的副武器的id
     */
    getShowFire(select?: number): number {
        return this.getFire(select);
    }
    /**
     * 
     * @param select 选择的副武器id
     */
    getShowPower(select?: number): number {
        const markId: number = select || this.game.secondWeapon.selected;
        const powerLevel = this.getItemPowerLevel(markId);
        const speedConfig = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, markId).power;
        const configArr = speedConfig.split("|");
        return Number(configArr[0]) + powerLevel * Number(configArr[1]);
    }
    getFire(select?: number): number {
        const markId: number = select || this.game.secondWeapon.selected;
        const fireLevel = this.getItemFireLevel(markId);
        const fireConfig = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, markId).fire;
        const configArr = fireConfig.split("|");
        return Number(configArr[0]) + fireLevel * Number(configArr[1]);
    }
    getSpeed(select?: number): number {
        if (!this.game.secondWeapon.selected) {
            return 0;
        }
        const markId: number = select || this.game.secondWeapon.selected;
        const powerLevel = BagDataControl.getInstance().getBagDataById(JSON.stringify(markId)).power;
        const speedConfig = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, markId).speed;
        const configArr = speedConfig.split("|");
        const speedBase: number = Number(configArr[0]) + powerLevel * Number(configArr[1]);
        return Number(configArr[2]) - (speedBase - 9) * Number(configArr[3]);
    }
    getFire_cost(select?: number): number {
        const markId: number = select || this.game.secondWeapon.selected;
        const fireLevel = BagDataControl.getInstance().getBagDataById(JSON.stringify(markId)).fire;
        const config = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, markId).fire_cost;
        const configArr = config.split("|");
        const cosume: number = Math.floor(Number(configArr[0]) + Math.pow(fireLevel / Number(configArr[1]), Number(configArr[2])));
        return cosume;
    }

    /**
     * 
     * @param select 选中的副武器的id
     * 返回副武器的解锁条件 条件不同升级消耗不同
     */
    getCostType(select?: number): number {
        const markId: number = select || this.game.secondWeapon.selected;
        let config = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, markId).unlock.split("|");
        config.filter((item, index, array) => { array[index] = Number(item) });
        return config;
    }
    getspeed_cost(select?: number): number {
        const markId: number = select || this.game.secondWeapon.selected;
        const fireLevel = BagDataControl.getInstance().getBagDataById(JSON.stringify(markId)).power;
        const config = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, markId).fire_cost;
        const configArr = config.split("|");
        const consume: number = Number(configArr[0]) + Math.pow(fireLevel / Number(configArr[1]), Number(configArr[2]));
        return Math.floor(consume);
    }
    getbulletSpeed(select?: number): number {
        const markId: number = select || this.game.secondWeapon.selected;
        const fireLevel = BagDataControl.getInstance().getBagDataById(JSON.stringify(markId)).power;
        let data = FixedDataTables.getInstance().getData(DataType.secondaryWeapon);
        let config = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, markId).bulletSpeed;

        const configArr = config.split("|");
        return Number(configArr[0]) + fireLevel * Number(configArr[1]);
    }

    /**
     * 得到buff的type
     */
    get buffType(): Array<string> {
        if (!this._buffType) {
            const markId: number = this.game.secondWeapon.selected;
            const typeConfig = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, markId).type;
            const typeArray: Array<string> = typeConfig.split("|");
            this._buffType = typeArray;
        }
        return this._buffType;
    }
    /**
     * 获得减缓buff的速度 持续时间
     */
    get getIceData(): Array<number> {
        if (!this._getIceSpeed) {
            this._getIceSpeed = [];
            const powerLevel: number = BagDataControl.getInstance().getBagDataById(JSON.stringify(this.game.secondWeapon.selected)).power;
            const arr = this.configNowWeapon.type.split("|");
            this._getIceSpeed.push(this.getbulletSpeed() * Number(arr[1]) / 100);
            this._getIceSpeed.push(powerLevel * Number(arr[3]) + Number(arr[2]))
        }
        return this._getIceSpeed;
    }
    /**
     * 获得减速buff的触发的概率
     */
    get iceBate(): number {
        const powerLevel: number = BagDataControl.getInstance().getBagDataById(JSON.stringify(this.game.secondWeapon.selected)).power;
        const arr = this.configNowWeapon.type.split("|");
        const bate: number = Number(arr[4]) + powerLevel * Number(arr[5]);
        return bate;
    }
    /**
     * 漂浮的持续时间
     */
    get getFlottantT(): number {
        if (!this._getFlottantT) {
            const powerLevel: number = BagDataControl.getInstance().getBagDataById(JSON.stringify(this.game.secondWeapon.selected)).power;
            const arr = this.configNowWeapon.type.split("|");
            this._getFlottantT = Number(arr[1]) + powerLevel * Number(arr[2]);
        }
        return this._getFlottantT;
    }
    get bulletPrefab(): string {
        //部分新的不使用Sprite了
        return enemyToPerfab[this.configNowWeapon.bullet] || this.configNowWeapon.bullet;
    }

    unlockCondition(markId?: number): string {
        const secondaryWeapon = FixedDataTables.getInstance().getData(DataType.secondaryWeapon, markId.toString());
        let unlock: string = !markId ? this.configNowWeapon.unlock : secondaryWeapon.unlock;
        const unlockArr: Array<string> = unlock.split("|");
        let strDec: string;
        if (unlockArr[0] === "1") {
            strDec = "通关第 " + unlockArr[1] + " 关解锁！";
        } else {
            strDec = "请前往商店解锁";
        }
        return strDec;
    }
}