export default class AdaptScene {
    private static _instance: AdaptScene;
    constructor() { }
    static getInstance() {
        if (!AdaptScene._instance) {
            AdaptScene._instance = new AdaptScene();
        }
        return AdaptScene._instance;
    }
    setSceneAdaptHeight() {
        const childrens = Laya.Scene.root._children;
        if (!childrens.length) {
            return;
        }
        let i: number = 0;
        for (i; i < childrens.length; i++) {
            (childrens[0] as Laya.Scene).height = Laya.stage.height;
        }
    }
    /**
     * 适配bg留空 中间适配
     */
    setBg(image: any) {
        if (image.height && image.height !== Laya.stage.height) {
            const s_height: number = Laya.stage.height;
            const i_height: number = image.height;
            image.y = -(s_height - i_height) / 2;
            image.height = s_height;
        }
    }
    setBG_top(img: any) {
        if (img && img.height && img.height !== Laya.stage.height) {
            img.height = Laya.stage.height;
        }
    }
}