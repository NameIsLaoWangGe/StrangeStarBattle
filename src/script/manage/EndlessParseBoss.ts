import Data from "../Data/DataTables";
import Data2 from "../Data/JsonEnum";
import FixedDataTables = Data.FixedDataTables;
import { tools } from "../Tools/Tool";
export default class EndlessParseBoss {
    private static _instance: EndlessParseBoss;
    private _monsterInterval: number;
    private readonly TABLECONFIG: any;
    private alreadyBossed: Array<string>;
    constructor() {
        this.TABLECONFIG = FixedDataTables.getInstance().getData(Data2.DataType.endless_boss);
        this.alreadyBossed = [];
    };
    static getInstance() {
        if (!this._instance) {
            this._instance = new EndlessParseBoss();
        }
        return this._instance;
    }
    /**
     * 满足出boss条件?
     */
    toSatisfy(nowDis: number): boolean {
        const keyArr = Object.keys(this.TABLECONFIG);
        let i = keyArr.length - 1;
        for (i; i >= 0; i--) {
            const id = keyArr[i];
            const distance = this.TABLECONFIG[id].distance;
            if (nowDis >= distance) {
                if (this.alreadyBossed.indexOf(id) >= 0) {
                    return false;
                } else {
                    this.alreadyBossed.push(id);
                    this.initVar_monster(id);
                    return true;
                }
            }
        }
        return false;
    }
    initVar_monster(id: string) {
        // this.monsterInterval = 
        const timeArr = this.TABLECONFIG[id]["monster"].time.split("|");
        const timeValue = tools.random(10000 * Number(timeArr[0]), 10000 * Number(timeArr[1]));
        this.monsterInterval = timeValue * 1000 / 10000;

        this.monsterIndex = 0;
        this.monsterIds = [];
        const monsterIdAndNum = this.TABLECONFIG[id]["monster"].split("#");
        let i: number = 0;
        for (i; i < monsterIdAndNum.length; i++) {
            const one: Array<string> = monsterIdAndNum[i].split("|");
            let j: number = 0;
            for (j; j < Number(one[1]); j++) {
                this.monsterIds.push(one[0]);
            }
        }

    }
    /**
     * 得到出的小怪的id
     */
    private monsterIndex: number;
    private monsterIds: Array<string>;
    getMonsterId() {
        if (this.monsterIndex++ >= this.monsterIds.length) {
            this.monsterIndex = 0;
        }
        return this.monsterIds[this.monsterIndex];
    }

    get monsterInterval(): number {
        return this._monsterInterval;
    }
    set monsterInterval(value) {
        this._monsterInterval = value;
    }
}