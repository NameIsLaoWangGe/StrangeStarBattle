import nanGuaWangZi_Boss from "../Boss/nanGuaWangZi_Boss";
import maoWangHou_Boss from "../Boss/maoWangHou_Boss";
import daShuRen_Boss from "../Boss/daShuRen_Boss";
import shitoujuren_Boss from "../Boss/shitoujuren_Boss";
import bingqilinzuhe_Boss from "../Boss/bingqilinzuhe_Boss";
import bingtouxiang_Boss from "../Boss/bingtouxiang_Boss";
import jibaobao_Boss from "../Boss/jibaobao_Boss";
import zhangyunvhuang_Boss from "../Boss/zhangyunvhuang_Boss";

import Data from "../Data/DataTables"
import FixedDataTables = Data.FixedDataTables;
import DataMonster from "../Data/JsonEnum"
import DataT from "../Data/JsonEnum"
import DataType = DataT.DataType;
import monster = DataMonster.monster;
import DropHpStatus = DataMonster.dropHpStatus;
import { tools } from "../Tools/Tool";
/**
 * 敌人通用基类(boss 特性敌人 普通敌人)
 */
enum skToScale {
    "chuji_xiaoemo1" = 0.4,
    "chuji_xiaoemo2" = 0.5,
    "chuji_xiaoemo" = 0.55,
    "zhongji_hetun" = 0.7,
    "zhongji_xiezi" = 0.5,
    "chuji_feishu" = 0.5,
    "chuji_jianci" = 0.4,
    "chuji_xigua" = 0.6,
    "zhongji_feihou" = 0.75,
    "zhongji_luobo" = 0.55,
}
export default class EnemyCommon {

    //包括enemyId
    public readonly enemyId: number;
    public enemyLevel: number;
    public defaultSpeedY: number;
    public readonly prefabType: DataT.prefabType;
    public config: monster;
    //敌人的类型
    public e_type: number;
    //击杀获得的金币
    public gold: number;
    //击杀获得bug的类型和概率
    public buffProbabilit: Array<string>;
    //是否掉buff
    public dropBuff: boolean;
    //当前血量
    private _hp: number;
    //当前敌人对主角造成的伤害~
    public hurtValue: number;

    public readonly startHp: number;
    //怪物的pic（Res name）
    protected pic: string;
    //预设res
    protected res: Laya.Prefab;
    // sk monster 缩放
    protected scaleXY: any;
    //预设name值
    public nick: string;
    //way
    public way: number;

    //boss的缩放 每个boss都需要缩放 缩放比例不一样
    protected bossScale: number;
    //boss的左右的移动区域
    protected moveAreaPos: any;
    //boss开始的时候 y的位置
    protected bossStartY: number = 95;
    //wFbOSS
    public isWFboss: boolean;
    //script
    protected needAddScript: any;
    //掉血状态 null || 9 ||10
    public dropHpStatus: DropHpStatus = DropHpStatus.born;
    constructor(public id: number) {
        this.enemyId = id;
        this.initProperty();
        this.startHp = this._hp;
        this.prefabType = this.e_type === 2 ? DataT.prefabType.boss : DataT.prefabType.enemy;
    }
    private initProperty() {
        this.config = FixedDataTables.getInstance().getData(DataType.monster, this.enemyId);

        this.defaultSpeedY = this.setRandomSpeed(this.config.speed)/*Number(this.config.speed)*/;
        this._hp = Number(this.config.hp);
        this.gold = Number(this.config.gold);
        this.e_type = Number(this.config.type);
        this.enemyLevel = Number(this.config.level);
        this.way = Number(this.config.way);
        if (this.config.buff == -1) {
            this.dropBuff = false;
        } else {
            this.dropBuff = true;
            this.buffProbabilit = this.config.buff.split("|");
        }
        this.pic = this.config.pic;
        if (this.e_type === 2) {
            this.nick = /*"Boss5" || */DataT.enemyToPerfab[this.pic];
            this.isWFboss = this.judgeWFBoss();
            this.setScript();
            this.res = Laya.loader.getRes("prefab/" + this.nick + ".json");
            this.bossStartY = this.config.positiony == -1 ? 95 : (this.config.positiony);
            this.scaleXY = { x: 0, y: 0 };
            const scaleArr = this.config.scale.split("|");
            this.scaleXY.x = Number(scaleArr[0]);
            this.scaleXY.y = Number(scaleArr[1]);
            this.moveAreaPos = {};
            const areaArr = this.config.positionx.split("|");
            this.moveAreaPos.x1 = Number(areaArr[0]);
            this.moveAreaPos.x2 = Number(areaArr[1]);
            //boss伤害
            this.hurtValue = 100000;
        } else {
            this.scaleXY = {};
            if (skToScale[this.pic]) {
                this.scaleXY.x = skToScale[this.pic];
                this.scaleXY.y = skToScale[this.pic];
            } else {
                this.scaleXY.x = 0.6;
                this.scaleXY.y = 0.6;
            }
            // const scaleArr: Array<string> = this.config.scale.split("|")
            // this.scaleXY.x = Number(scaleArr[0]);
            // this.scaleXY.y = Number(scaleArr[1]);
            if (DataT.midEnemyNameToSK[this.pic]) {
                this.nick = "monsterSK";
                this.res = Laya.loader.getRes("prefab/EnemySK.json");
                console.error("进入到了中级怪物的nick~");
            } else {
                // this.nick = "monster";
                // this.res = Laya.loader.getRes("prefab/Enemy_blue.json");
                this.nick = "monster";
                this.res = Laya.loader.getRes("prefab/EnemySK.json");
            }
            //伤害
            const value = FixedDataTables.getInstance().getDataByKey(DataType.misc, 10, "value")
            this.hurtValue = value ? Number(value) : 20;
            // console.error("敌人造成的伤害");
        }
        if (!this.res) {
            console.error(this.nick + "未加载就开始使用~！");
        }
    }
    set hp(hpValue: number) {
        if (hpValue) {
            this._hp = hpValue;
        } else {
            this._hp = 0;
        }
    }
    get hp(): number {
        return this._hp;
    }
    judgeWFBoss(): boolean {
        const nicks = ["Boss1", "Boss2", "Boss3", "Boss4", "Boss5"];
        if (nicks.indexOf(this.nick) > -1) {
            return false;
        } else {
            return true;
        }
    }
    setRandomSpeed(config: string): number {
        const arr: Array<string> = config.split("|");
        const arr2 = arr.map((item, index) => { return Number(item) });
        const speed = tools.random(arr2[0], arr2[1]);
        return speed;
    }
    setScript() {
        switch (this.nick) {
            case DataT.enemyToPerfab.boss_nanguawangzi:
                this.needAddScript = nanGuaWangZi_Boss;
                break;
            case DataT.enemyToPerfab.boss_maowanghou:
                this.needAddScript = maoWangHou_Boss;
                break;
            case DataT.enemyToPerfab.boss_dashuren:
                this.needAddScript = daShuRen_Boss;
                break;
            case DataT.enemyToPerfab.boss_shitoujuren:
                this.needAddScript = shitoujuren_Boss;
                break;
            case DataT.enemyToPerfab.boss_bingqilinzuhe:
                this.needAddScript = bingqilinzuhe_Boss;
                break;
            case DataT.enemyToPerfab.boss_bingqilinzuhe:
                this.needAddScript = bingqilinzuhe_Boss;
                break;
            case DataT.enemyToPerfab.boss_bingtouxiang:
                this.needAddScript = bingtouxiang_Boss;
                break;
            case DataT.enemyToPerfab.boss_jibaobao:
                this.needAddScript = jibaobao_Boss;
                break;
            case DataT.enemyToPerfab.boss_zhangyunvhuang:
                this.needAddScript = zhangyunvhuang_Boss;
                break;
            default:
                break;
        }
    }
}