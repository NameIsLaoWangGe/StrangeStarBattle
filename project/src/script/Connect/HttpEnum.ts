module HttpModel {
    // export const URLSERVER = "http://192.168.1.181:5000/api/";
    export const URLSERVER = "http://192.168.1.198:5000/api/";
    // export const URLSERVER = "http://212.64.114.11:5000/api/";
    // export const URLSERVER = "https://ssl.xdieg.com/api/";
    export enum httpUrls {
        uuid = "UserMgr/Login", //获取uuid
        GetPlayerData = "PlayerBase/GetPlayerData",  //获取玩家的数据
        SignUp = "PlayerBase/SignUp",     //签到
        PassedBarrier = "PlayerBase/PassedBarrier",   //过关结算
        UpWeapon = "PlayerBase/UpWeapon",    //升级主武器
        UpSecondaryWeapon = "PlayerBase/UpSecondaryWeapon",     //升级副武器
        ShopOnce = "PlayerBase/ShopOnce", //商城抽奖一次
        ShopTen = "PlayerBase/ShopTen", //商城抽奖十次
        ExchangeEnergy = "PlayerBase/ExchangeEnergy",   //兑换能量
        ExchangeGold = "PlayerBase/ExchangeGold",    //兑换金币
        TimerUpdateUpdateSome = "TimerUpdate/UpdateSome",   //更新体力等
        ShopItem = "PlayerBase/ShopItem",    //购买无尽模式道具
        EndlessStart = "PlayerBase/EndlessStart",  //无尽模式开始
        EndlessStop = "PlayerBase/EndlessStop",          //无尽模式结算
        AchieveFetch = "PlayerBase/AchieveFetch"
    }
    /**
     * 请求用户数据返回
     */
    export interface userDataRequestBack {
        advertise: { watchTimes: number };
        achieve: { battleTopNum: number, killTopNum: number, endlessTopScore: number, unlockTopNum: number };
        bagCommon: any;
        bagSecondaryWeapon: any;
        barrier: { "curBarrier": number, "luckyValue": number };
        mainWeapon: { "fireLvl": number, "shotSpeed": number, "hpLvl": number };
        share: { "shareTimes": number };
        signIn: { [key: string]: any };
        curSecondaryWeaponId: number;

    }
}
export default HttpModel;

