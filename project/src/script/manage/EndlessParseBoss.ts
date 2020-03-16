import Data from "../Data/DataTables";
import Data2 from "../Data/JsonEnum";
import FixedDataTables = Data.FixedDataTables;
import { tools } from "../Tools/Tool";
export default class EndlessParseBoss {
    private static _instance: EndlessParseBoss;
    private _monsterInterval: number;
    private readonly TABLECONFIG: any;
    private alreadyBossed: Array<string>;
    private _nowBossId: number;
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
                    const bossArr = this.TABLECONFIG[id].boss.split("|");
                    this._nowBossId = Number(bossArr[0]);
                    this.initVar_monster(id);
                    return true;
                }
            }
        }
        return false;
    }
    initVar_monster(id: string) {
        // this.monsterInterval = 
        const timeArr = this.TABLECONFIG[id].time.split("|");
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
        if (this.monsterIndex >= this.monsterIds.length) {
            this.monsterIndex = 0;
        }
        return this.monsterIds[this.monsterIndex++];
    }
    /**
     * 得到下一个boss战的时候刷的小怪ids
     */
    getTempletDateInBoss() {
        let id: number;
        if (this.alreadyBossed.length) {
            id = Number(this.alreadyBossed[this.alreadyBossed.length - 1]) + 1
        } else {
            id = 1;
        }
        const ids = {};
        if (this.TABLECONFIG[id]) {
            const monsterIds: Array<string> = this.TABLECONFIG[id].monster.split("#");
            let i: number = 0;
            for (i; i < monsterIds.length; i++) {
                const markMonsterId = monsterIds[i].split("|")[0];
                ids[markMonsterId] = true;
            }
        }
        return ids;
    }
    /**
     * boss战中刷小怪的间隔
     */
    getintervalByOne() {
        const id = Number(this.alreadyBossed[this.alreadyBossed.length - 1]);
        const timeString = this.TABLECONFIG[id].time;
        const timeArr: Array<string> = timeString.split("|");
        const randomArr: Array<number> = timeArr.map(item => {
            return 10000 * Number(item);
        });
        const randomValue = tools.random(randomArr[0], randomArr[1]);
        return randomValue * 0.0001 * 1000;
    }
    get monsterInterval(): number {
        return this._monsterInterval;
    }
    set monsterInterval(value) {
        this._monsterInterval = value;
    }
    get nowBossId(): number {
        return this._nowBossId;
    }
}