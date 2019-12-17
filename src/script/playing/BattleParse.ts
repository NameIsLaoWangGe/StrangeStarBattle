import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import PlayingSceneControl from "../playing/PlayingSceneControl"
import FixedDataTables = Data.FixedDataTables;
import { tools } from "../Tools/Tool";
import PlayingVar from "../manage/Playing_var";
import EndlessManage from "../manage/EndlessManage";
export default class BattleParse {
    private static instance: BattleParse;
    private gameVar: any;
    //当前关卡所有数组
    // private waveDataInLevel: any;
    //当前关卡所有波的敌人数据数组
    private waveMonsterInLevel: Array<string>;
    //当前所在波
    private nowInWave: number = 0;
    //所在当前波的位置
    private nowInWaveIndex: number = 0;
    private nowLevel: number;
    //本关总的敌人数量
    private totalNums: number;
    //本关目前已经杀死的敌人
    private _killEnemyS: number = 0;
    //本关能获得的所有金币
    private _goldsInLevel: number;
    //每个敌人 金币累加
    private _goldInLevel: number;
    private killEnemyIds: Array<number>;
    constructor() {
        if (PlayingVar.getInstance().gameModel === "endless") {
            this.nowLevel = 1;
        } else {
            this.gameVar = Laya.Browser.window.game;
            this.nowLevel = this.gameVar.nowLevel;
        }

        this._goldInLevel = 0;
        this.initWaveData();
    }
    initWaveData() {
        // this.waveDataInLevel = FixedDataTables.getInstance().getData(Data2.DataType.battle, this.nowLevel);
        if (PlayingVar.getInstance().gameModel === "endless") {
            const data = FixedDataTables.getInstance().getData(Data2.DataType.endless);
            this.waveMonsterInLevel = FixedDataTables.getInstance().getDataByKey(Data2.DataType.endless, this.nowLevel, "troop").split(";");
        } else {
            this.waveMonsterInLevel = FixedDataTables.getInstance().getDataByKey(Data2.DataType.battle, this.nowLevel, "troop").split(";");
        }
        this.getEnemyTotalNum();
    }

    public static getInstance(): BattleParse {
        if (!this.instance) {
            this.instance = new BattleParse();
        }
        return this.instance;
    }
    public static deleteInstance(): void {
        delete this.instance;
    }
    /**
     * 返回下个应该创建的怪物的id 
     * 如果本关的怪物已经出完返回false
     */
    public getNextMonsterData(): any {
        if (this.nowInWave === 1 && this.nowInWaveIndex >= this.waveJson[this.nowInWave].length) {
            if (PlayingVar.getInstance().gameModel === "endless") {
                this.endlessSetNextData();
                return this.getNextMonsterData();
            } else {
                return false;
            }
        } else {
            if (this.nowInWave === 0) {
                if (this.nowInWaveIndex >= this.waveJson[this.nowInWave].length) {
                    this.nowInWaveIndex = 0;
                    this.nowInWave++;
                    // PlayingSceneControl.instance.setLastTimeCreateAWave(Date.now());
                    PlayingSceneControl.instance.setLastByCreateTime(this.nowInWave);
                    return this.getNextMonsterData();
                } else {
                    (this.nowInWaveIndex === (this.waveJson[this.nowInWave].length - 1)) && PlayingSceneControl.instance.setLastTimeCreateAWave(Date.now());
                    return this.waveJson[this.nowInWave][this.nowInWaveIndex++];
                }
            } else {
                return this.waveJson[this.nowInWave][this.nowInWaveIndex++];
            }
        }
    }
    /**
     * 无尽模式 每个编号跑完后下个编号
     */
    endlessSetNextData() {
        this.nowInWave = 0;
        this.nowInWaveIndex = 0;
        this.nowLevel++;
        this.waveJson[0].length = 0;
        this.waveJson[1].length = 0;
        this.initWaveData();

        PlayingSceneControl.instance.preLoadResInPlaying(true);
    }
    /**
     * 当前波是否出完所有怪
     */
    public judgeFinishNowWave(): boolean {
        if (this.waveJson[this.nowInWave] && this.nowInWaveIndex >= this.waveJson[this.nowInWave].length) {
            return true;
        }
        return false;
    }
    /**
     * 判断下一个怪物释放是boss
     */
    public judgeNextIsBoss() {
        if (this.waveJson[this.nowInWave + 1] && this.waveJson[this.nowInWave + 1][0]) {
            const markId = this.waveJson[this.nowInWave + 1][0];
            const type = FixedDataTables.getInstance().getDataByKey(Data2.DataType.monster, markId, "type");
            if (type === 2) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }
    /**
     * 计算关卡怪物总数
     */
    private waveJson = { 0: [], 1: [] };
    private getEnemyTotalNum(): void {
        const waveMonsterInLevel: Array<string> = this.waveMonsterInLevel;
        let nums = 0;
        let i: number = 0;
        for (i = 0; i < waveMonsterInLevel.length; i++) {
            let poArr: Array<string> = waveMonsterInLevel[i].split("#");
            let j = 0;
            for (j; j < poArr.length; j++) {
                const markArr = poArr[j].split("|");
                nums += Number(markArr[1]);
                const markId = JSON.parse(markArr[0]);
                const sameArr = tools.fillArray(markId, Number(markArr[1]));
                this.waveJson[i] = this.waveJson[i].concat(sameArr);

            }
        }
        this.totalNums = nums;
    }
    /**
     *  得到当前关卡的所有怪物的sk 模板 复用~
     */
    public getTempletDateInLevel(isNext?: boolean) {
        let idsJson = {};
        let waveMonsterInLevel: Array<string>;
        if (isNext) {
            waveMonsterInLevel = FixedDataTables.getInstance().getDataByKey(Data2.DataType.endless, this.nowLevel + 1, "troop").split(";");
        } else {
            waveMonsterInLevel = this.waveMonsterInLevel;

        }
        let i: number = 0;
        for (i; i < waveMonsterInLevel.length; i++) {
            let poArr: Array<string> = waveMonsterInLevel[i].split("#");
            let j = 0;
            for (j; j < poArr.length; j++) {
                const markArr = poArr[j].split("|");
                idsJson[markArr[0]] = true;
            }
        }
        return idsJson;
    }
    /**
     * 
     * @param itemId 怪物id
     * @param bate 金币加成
     */
    public calKillOneGold(itemId: number, bate?: number) {
        let gold: number = FixedDataTables.getInstance().getDataByKey(Data2.DataType.monster, itemId, "gold");
        gold = gold * ((typeof (bate) === "number" ? bate : 1) || 1);

        this._goldInLevel += gold;
    }

    public get goldsInLevel(): number {
        if (!this._goldsInLevel) {
            this.goldsInLevel = this._goldInLevel/*this.calKillAllGold()*/;
        }
        return this._goldsInLevel;
    }
    public set goldsInLevel(golds: number) {
        this._goldsInLevel = golds;
    }
    public getTotalNums(): number {
        return this.totalNums;
    }
    public set killEnemyS(num: number) {
        this._killEnemyS += 1;
    }
    public get killEnemyS(): number {
        return this._killEnemyS;
    }

}