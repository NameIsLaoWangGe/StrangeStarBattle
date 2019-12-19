import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import FixedDataTables = Data.FixedDataTables;
import DataJsonUrl = Data2.DataType;
import PlayingVar from "./Playing_var";
import EndlessManage from "./EndlessManage";
import EndlessParseSkill from "./EndlessParseSkill";
export default class MainWeaponData {
    private static _instance: MainWeaponData;
    private fireData: any;
    private speedData: any;
    private hpDate: any;
    private _fire_gold: number;

    private _hp_gold: number;
    private _fire: number;
    private _speed_gold: number;
    private _speed: number;
    private _bulletSpeed: number;
    constructor() { this.setMainWeapon(); };
    public static getInstance(): MainWeaponData {
        if (!MainWeaponData._instance) {
            MainWeaponData._instance = new MainWeaponData()
        }
        return MainWeaponData._instance;
    }
    private game: any;
    setMainWeapon(fireLevel?: number, speedLevel?: number, hpLevel?: number) {
        if (!this.game) {
            this.game = Laya.Browser.window.game;
        }
        //火力的等级
        const markFireLevel = fireLevel || (PlayingVar.getInstance().gameModel === "endless" ? EndlessManage.getInstance().mainLevel : this.game.mainWeapon.fireLevel);
        this.fireData = FixedDataTables.getInstance().getData(DataJsonUrl.weapon, markFireLevel);
        //速度的等级
        const markspeedLevel = speedLevel || (PlayingVar.getInstance().gameModel === "endless" ? EndlessManage.getInstance().mainLevel : this.game.mainWeapon.speedLevel);
        this.speedData = FixedDataTables.getInstance().getData(DataJsonUrl.weapon, markspeedLevel);
        //hp等级
        const markHpLevel = hpLevel || (PlayingVar.getInstance().gameModel === "endless" ? EndlessManage.getInstance().mainLevel : this.game.mainWeapon.hpLevel);
        this.hpDate = FixedDataTables.getInstance().getData(DataJsonUrl.weapon, markHpLevel);

    }
    /**
     * 火力升级需要的金币
     */
    get fire_gold(): number {
        this._fire_gold = this.fireData.fire_gold;
        return this._fire_gold;
    }
    /**
     * 升级飞机的生命值需要的金币
     */
    get hp_gold(): number {
        this._hp_gold = this.hpDate.hp_gold;
        return this._hp_gold;
    }
    /**
     * 主武器的火力值
     */
    get fire(): number {
        this._fire = this.fireData.fire;
        return this._fire;
    }
    /**
     * 射速升级需要的金币
     */
    get speed_gold(): number {
        this._speed_gold = this.speedData.speed_gold;
        return this._speed_gold;
    }
    /**
     * 当前主武器射速值
     */
    get speed(): number {
        this._speed = this.speedData.speed;
        return this._speed;
    }
    /**
     * 当前主武器的子弹的速度
     */
    get bulletSpeed(): number {
        this._bulletSpeed = this.speedData.bulletSpeed;
        const gameModel: string = PlayingVar.getInstance().gameModel;
        if (gameModel === "endless") {
            const value = 0.01 * EndlessParseSkill.getInstance().getSkillNum(3);
            this._bulletSpeed = this._bulletSpeed * (1 + value)
        }
        return this._bulletSpeed;
    }
    /**
     * 展示火力值
     */
    getShowFire(): number {
        const gameModel: string = PlayingVar.getInstance().gameModel;
        let fireLevel: number;
        if (gameModel === "endless") {
            fireLevel = EndlessManage.getInstance().mainLevel;
        } else {
            fireLevel = this.game.mainWeapon.fireLevel;
        }
        const fireNum = FixedDataTables.getInstance().getDataByKey(DataJsonUrl.weapon, fireLevel, "fire");
        // const skillEndless = EndlessParseSkill.getInstance();
        // let nowNum: number;
        // if (skillEndless.isUpgraded) {
        //     nowNum = fireNum + 0.01 * skillEndless.getSkillNum(2)
        // } else {
        //     nowNum = fireNum;
        // }
        return fireNum;
    }
    /**
 * 展示Hp值
 */
    getShowHp(): number {
        const hpLevel = PlayingVar.getInstance().gameModel !== "endless" ? this.game.mainWeapon.hpLevel : EndlessManage.getInstance().mainLevel;
        return FixedDataTables.getInstance().getDataByKey(DataJsonUrl.weapon, hpLevel, "hp");
    }
    /**
     * 展示速度值
     */
    getShowSpeed(): void {
        const speedLevel = PlayingVar.getInstance().gameModel !== "endless" ? this.game.mainWeapon.speedLevel : EndlessManage.getInstance().mainLevel;
        return FixedDataTables.getInstance().getDataByKey(DataJsonUrl.weapon, speedLevel, "speed");
    }
    updateMainWeapon(fireLevel?: number, speedLevel?: number, hpLevel?: number): void {
        this.setMainWeapon(fireLevel || this.game.mainWeapon.fireLevel, speedLevel || this.game.mainWeapon.speedLevel, hpLevel || this.game.mainWeapon.hpLevel);
    }
    /**
     * role 飞机的血量值
     */
    getRoleHp() {
        const hpLevel = PlayingVar.getInstance().gameModel !== "endless" ? this.game.mainWeapon.hpLevel : EndlessManage.getInstance().mainLevel;
        return FixedDataTables.getInstance().getDataByKey(DataJsonUrl.weapon, hpLevel, "hp");
    }
}