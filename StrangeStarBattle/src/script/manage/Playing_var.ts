import HttpModel from "../Connect/HttpEnum"
import userDataRequestBack = HttpModel.userDataRequestBack;
interface signModel {
    already: boolean;
    day: number;
}
export default class PlayingVar {
    private static instance: PlayingVar;
    //游戏状态 loading main playing preSettlement settlement 
    private _gameStatus: string;

    //每波10人(应该读表 暂无)
    private readonly _enemyNumByAwave = 1;
    //每波间隔
    private readonly _timeIntervalByOne = 10000;
    //主角是否无敌
    private _invincible: boolean = true;
    //是否根据颜色杀敌
    private _canColorKillEnemy: boolean = false;
    private _roleSecondaryEquipType: number;
    //1:红色
    private readonly enemyHp: any = { 1: 5, 2: 3, 3: 2 };
    //子弹速度
    private readonly bulletSpeed: number = -50;
    //子弹的
    private readonly bulletInterval: number = 100;
    //签到
    private _checkInData: signModel = { "already": false, "day": 0 };
    //幸运值
    public luckyValue: number;
    //玩家的唯一uuid每次请求需要带再参数里面
    private _uuId: string;
    //weCode 
    private _wecode: string;

    public firstTouchPlay: boolean;
    //游戏的模式 
    public gameModel: string = "level";
    //成就 的数据
    public playerAchieve: any;
    public achieve: any;
    constructor() { }
    /**
     * 初始化游戏初始变量
     */
    updateGameVar(e: userDataRequestBack, playerAchieve: any) {
        //console用
        Laya.Browser.window.playingVar = this;
        if (!Laya.Browser.window.game) {
            Laya.Browser.window.game = {};
        }
        let game = Laya.Browser.window.game;
        let propertyJson = ["enemyNumByAwave", "timeIntervalByOne", "gameStatus", "canColorKillEnemy", "roleSecondaryEquipType", "enemyHp"];
        propertyJson.forEach((item, index) => {
            game[item] = this[item];
        });
        //现在的关卡
        game.nowLevel = e.barrier.curBarrier || 1;
        game.mainWeapon = { fireLevel: e.mainWeapon.fireLvl, speedLevel: e.mainWeapon.shotSpeed, hpLevel: e.mainWeapon.hpLvl };
        game.secondWeapon = { selected: /*208 || */e.curSecondaryWeaponId };
        //签到相关
        this.checkInData.already = e.signIn.signIn;
        this.checkInData.day = e.signIn.signTimes;
        this.luckyValue = e.barrier.luckyValue;
        //成就相关
        this.achieve = e.achieve;
        this.playerAchieve = playerAchieve;
    }
    public static getInstance() {
        if (!PlayingVar.instance) {
            PlayingVar.instance = new PlayingVar();
        }
        return PlayingVar.instance;
    }
    public get roleSecondaryEquipType(): number {
        return this._roleSecondaryEquipType;
    }
    public set roleSecondaryEquipType(e: number) {
        this._roleSecondaryEquipType = e;
        //this.updateGameVar();
    }
    public get canColorKillEnemy(): boolean {
        return this._canColorKillEnemy;
    }
    public get invincible(): boolean {
        return this._invincible;
    }
    public get enemyNumByAwave() {
        return this._enemyNumByAwave;
    }
    public get timeIntervalByOne() {
        return this._timeIntervalByOne;
    }
    public set gameStatus(status: string) {
        this._gameStatus = status;
        //this.updateGameVar();
    }
    public get gameStatus() {
        return this._gameStatus;
    }

    public get checkInData(): signModel {
        return this._checkInData;
    }
    public set checkInData(data: signModel) {
        this._checkInData = data;
    }
    public get uuId(): string {
        if (this._uuId === void 0) {
            console.error("发生了严重错误！");
        }
        return this._uuId;
    }
    public set uuId(id: string) {
        if (!id) {
            console.error("发生了严重错误！");
        }
        this._uuId = id;
    }
    public get wecode(): string {
        if (this._wecode === void 0) {
            console.error("发生了严重错误！");
        }
        return this._wecode;
    }
    public set wecode(id: string) {
        if (!id) {
            console.error("发生了严重错误！");
        }
        this._wecode = id;
    }
    /**
     * 
     * @param data 
     * 更新成就相关的本地数据  {battleTopNum endlessTopScore killTopNum unlockTopNum}
     */
    public updateAchieve(data: any) {
        let i;
        for (i in data) {
            this.achieve[i] = data[i];
        }
    }
    /**
     * 更新领取的数据 
     */
    public updatePlayerAchieve(data: any) {
        let i;
        for (i in data) {
            let ids = data[i];
            let j;
            for (j in ids) {
                this.playerAchieve[i][j] = ids[j];
            }
        }
    }
    /**
     * 发送给服务端的最大杀敌数
     */
    getKillMaxNum(nowKill: number) {
        if (nowKill > this.achieve["killTopNum"]) {
            return nowKill
        } else {
            return this.achieve["killTopNum"];
        }
    }
    /**
     * 发送给服务端的最大分数
     */
    getScoresMaxNum(nowScore: number) {
        if (nowScore > this.achieve["endlessTopScore"]) {
            return nowScore;
        } else {
            return this.achieve["endlessTopScore"];
        }
    }
}
