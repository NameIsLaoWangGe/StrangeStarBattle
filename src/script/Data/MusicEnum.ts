module Data {
    export const musicPath: string = "music/";
    export enum musicToUrl {
        "bg_menu" = "bg_menu",
        "bg_fight" = "bg_fight",
        "bg_boss" = "bg_boss",
        "button_normal" = "button_normal",
        "button_buy" = "button_buy",
        "ui_popup" = "ui_popup",
        "bullet_normal" = "bullet_normal",
        "bomb" = "bomb",
        "bomb_boss" = "bomb_boss",
        "bomb_hero" = "bomb_hero",  //飞机死亡
        "get_coin" = "get_coin",
        "get_item" = "get_item",
        "warning" = "warning",
        "warning_bg" = "warning_bg",    //警告背景音效
        "lose_noise" = "lose_noise",    //游戏失败的
        "lose_bg" = "lose_bg",
        "win_noise" = "win_noise",      //游戏胜利的音效
        "win_bg" = "win_bg",        //游戏胜利的背景音乐
        "lottery_single" = "lottery_single",
        "lottery_ten" = "lottery_ten",
        "set_off" = "set_off",
        "set_on" = "set_on",
        "readygo" = "readygo",      //准备音效 用于战斗开始前
        "coin_charge"="coin_charge"     //兑换音效，用于金币-钻石之间兑换
    }
}
export default Data;