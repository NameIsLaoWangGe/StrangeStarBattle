import toast from "./toast";

export default class OpenWx {
    private static _instance: OpenWx;
    private OpenDataContext: any;
    private wx: any;
    constructor() {
        this.wx = Laya.Browser.window.wx;
        if (Laya.Browser.onMiniGame) {
            this.OpenDataContext = this.wx.getOpenDataContext();
            this.listernerShareApp();
        }
    }
    public static getInstance(): OpenWx {
        if (!this._instance) {
            this._instance = new OpenWx();
        }
        return this._instance;
    }
    /**
     * 
     * @param type 1展示等级 2上传数据 3展示分数
     * @param data 
     */
    postMsg(type: number, data?: any) {
        if (Laya.Browser.onMiniGame) {
            this.OpenDataContext.postMessage({
                type: type,
                data: data || null
            });
        }
    }
    listernerShareApp() {
        this.wx.onShareAppMessage(function () {
            //用户点击了转发
            return {
                title: "怪星大作战"
            }
        });
    }
    /**
     * 微信分享
     */
    setShare(successHandler?: Laya.Handler) {
        if (Laya.Browser.onMiniGame) {
            //下次测试
            var id = "TIJXultTTbma3tdkBUVaPA==";
            var url = "https://mmocgame.qpic.cn/wechatgame/9zdKibmXJ3RtrfyRBX0IcqzBNbR07qKgdicicibTMrN3ZZujibibpsickx8BVKHDRJM6UVg/0";
            this.wx.shareAppMessage({
                imageUrlId: id,
                imageUrl:url
            });
            console.log("主动进行了转发");
        } else {
            toast.noBindScript("仅支持微信客户端!");
        }
    }
    /**
     * 短震动
     */
    vibrateShort() {
        Laya.Browser.onMiniGame && this.wx.vibrateShort();
    }
    /**
     * 长震动
     */
    vibrateLong() {
        Laya.Browser.onMiniGame && this.wx.vibrateLong();
    }
}