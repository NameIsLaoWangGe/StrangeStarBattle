import Data from "../Data/JsonEnum";
import templetType = Data.templetType;
import Bullet_second from "../role/Bullet_second";

/**
 * 骨骼动画 模板
 */
interface posXy {
    x,
    y,
}
export default class SkeletonTempletManage {
    private static _instance;
    private _templets: any;
    public TEMPLETARR0: string[] = ["buff", "diancipao", "xuanfupao", "xuhongyinqing", "liuxingpao", "mogupao", "feirenfengbao", "daodanpao", "qpbz", "fanghudun", "jiguangpao", "duye"];
    public BOSSSKILLEFFECT: string[] = [/*"xuanfeng", "boss2_pao",*/ "baozi", "zd", "boos4texiao", "bingzhui", "boss5texiao"];
    // private _tempType: templetType;
    constructor() { }
    public static getInstance(): SkeletonTempletManage {
        if (!SkeletonTempletManage._instance) {
            SkeletonTempletManage._instance = new SkeletonTempletManage();
        }
        Laya.Browser.window.templets = SkeletonTempletManage._instance;
        return SkeletonTempletManage._instance;
    }
    //可拓展同时播放多个 同一模板的不同动画(后续)
    play(type: templetType, name: any, templet?: string, loop?: boolean, pos?: posXy, parent?: any, compete?: Laya.Handler, nick?: string) {
        const jsons = {
            nowLoop: loop, nowPos: pos || { x: 0, y: 0 }, nowParent: parent, nowComplete: compete,
            templetName: templet, aniName: name, nick: nick, _tempType: type
        };
        this.initTemplet(jsons);
    }
    initTemplet(arg: any) {
        const templetName = arg.templetName;
        let markTemplet: Laya.Templet;
        this._templets === (void 0) && (this._templets = {});
        if (!this._templets[templetName]) {
            markTemplet = new Laya.Templet();
            this._templets[templetName] = markTemplet;
            this._templets[templetName]["templetType"] = arg._tempType;

            markTemplet.on(Laya.Event.COMPLETE, this, this.parseComplete, [arg]);
            markTemplet.on(Laya.Event.ERROR, this, this.onError);
            markTemplet.loadAni("dragonbones/" + templetName + ".sk");
        } else {
            markTemplet = this._templets[templetName];
            this.parseComplete(arg);
        }
    }
    private parseComplete(arg: any) {
        const parent = arg.nowParent;
        const tempName = arg.templetName;
        const complete: Laya.Handler = arg.nowComplete;
        if (!parent) {
            console.error("加载完成~~~~", tempName);
            //只创建模板 不创建动画
            // this.nowComplete && tempName === "boss5texiao" && this.nowComplete.run();
            this.clearTextureRes(tempName);
            complete && complete.run();
            return;
        }
        let skeleton0: Laya.Skeleton = Laya.Pool.getItemByCreateFun(tempName, () => {
            return this._templets[tempName].buildArmature(0);
        }, this);
        // let skeleton0: Laya.Skeleton = this.nowTemplet.buildArmature(0);
        skeleton0.pos(arg.nowPos.x, arg.nowPos.y);
        !arg.nowLoop && skeleton0.on(Laya.Event.STOPPED, this, this.sk_listener, [skeleton0]);
        skeleton0.play(arg.aniName, arg.nowLoop);
        if (parent) {
            parent.addChild(skeleton0);
        }
        arg.nick && (skeleton0.name = arg.nick);
        //从动画模板创建动画播放对象
        arg.nowComplete && arg.nowComplete.runWith(skeleton0);
    }
    /**
     * 
     * @param tname templet名字
     */
    clearTextureRes(tname?: string) {
        if (!tname) {
            let i;
            for (i in this.templets) {
                const templet = this.templets[i];
                const temp = templet._textureDic;
                let j;
                for (j in temp) {
                    Laya.loader.getRes(j) && Laya.loader.clearTextureRes(j);
                }
            }
            return;
        }
        const templet = this.templets[tname];
        if (!templet) {
            return;
        }
        const temp = templet._textureDic;
        let i;
        for (i in temp) {
            Laya.loader.getRes(i) && Laya.loader.clearTextureRes(i);
        }
    }
    sk_listener(e: any) {
        e.off(Laya.Event.STOPPED, this, this.sk_listener);
        e && e.removeSelf();
    }
    private onError(arg) {
        console.error("onError:", arg);
    }
    public get templets() {
        return this._templets;
    }
    public set templets(value: any) {
        this._templets = value;
    }
    public createSkByTemplet(resName: string) {
        if (this.templets[resName]) {
            const sk = Laya.Pool.getItemByCreateFun(resName, () => {
                const temp: Laya.Skeleton = this.templets[resName].buildArmature(0);
                temp.addComponent(Bullet_second);
                return temp;
            }, this);
            return sk;
        } else {
            console.error("不存在的templets---", resName);
        }
    }
    /**
 * 释放骨骼模板 的纹理
 */
    releaseTempletTexture(tempKeyName: string) {
        if (this.templets[tempKeyName]) {
            this.templets[tempKeyName].destroy();
            this.templets[tempKeyName] = null;
        }
    }
    /**
     * 释放所有的骨骼模板的纹理
     */
    releaseAllTemplet() {
        let i: string;
        for (i in this.templets) {
            this.templets[i].destroy();
            this.templets[i] = null;
        }
        this.templets = {};
        console.error("已经释放了所有骨骼模板的纹理");
    }
    xxx() {
        const xxx: Laya.Sprite[] = Laya.Pool["_poolDic"].monster;
        let i: number = 0;
        for (i; i < xxx.length; i++) {
            xxx[i].destroy(true);
        }
    }
}