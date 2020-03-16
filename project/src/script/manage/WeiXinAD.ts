import toast from "./toast";

export default class WeiXinAD {
    public static _instance;
    private wx: any;
    private _adStatus: boolean;
    private adInstance: any;
    private handleBack: Laya.Handler;
    private pullAdSuc: boolean;
    constructor() {
        if (Laya.Browser.onMiniGame) {
            this.wx = Laya.Browser.window.wx;
            this.adStatus = true;
            this.initAdComponent();
        }
        //现在强制关闭 因为广告暂未开放
        //  this.adStatus = false;
    }
    static getInstance():WeiXinAD {
        if (!this._instance) {
            this._instance = new WeiXinAD();
        }
        return this._instance;
    }
    /**
     * 初始化广告组件
     */
    initAdComponent() {
        this.adInstance = this.wx.createRewardedVideoAd({ adUnitId: 'adunit-7e1acfe8314a0542' });
        this.adInstance.onLoad(() => {
            console.log("广告拉取成功！");
            this.pullAdSuc = true;
        });
        this.adInstance.onError((err) => {
            console.error("广告拉取失败:", err);
            this.pullAdSuc = false;
            //失败再去拉去一次
            this.adInstance.load();
        });
        this.adInstance.onClose((res) => {
            if (res && res.isEnded || res === undefined) {
                //播放结束
                this.handleBack && this.handleBack.runWith(1)
            } else {
                //播放中途退出
                this.handleBack && this.handleBack.runWith(0);
            }
        });
    }
    addVideoAD(e: Laya.Handler) {
        if (!this.pullAdSuc) {
            toast.noBindScript("获取广告失败！");
            Laya.Dialog.hideLoadingPage();
            return;
        }
        this.handleBack = e;
        // 用户触发广告后，显示激励视频广告
        this.adInstance.show().catch(() => {
            // 失败重试
            this.adInstance.load()
                .then(() => this.adInstance.show())
                .catch(err => {
                    console.log('激励视频 广告显示失败')
                    toast.noBindScript("获取广告失败！");
                    Laya.Dialog.hideLoadingPage();
                });
        });
        
        // this.adInstance.show().then(() => {
        //     console.log("激励广告,广告显示！");
        // }).catch((err) => {
        //     console.log("拉取广告失败(catch):", err);
        //     this.adInstance.load().then(() => {
        //         this.adInstance.show();
        //     });
        // });;

    }
    get adStatus() {
        return this._adStatus;
    }
    set adStatus(statu: boolean) {
        if (statu != void 0) {
            this._adStatus = statu;
        } else {
            this._adStatus = false;
        }
    }
}