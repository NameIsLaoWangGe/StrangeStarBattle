
export default class toast extends Laya.Script {
    constructor() {
        super();
    }
    onEnable(): void {
        const self = this.owner as Laya.Sprite;
        self.alpha = 0.5;
        //通用tips已经改成渐隐藏
        Laya.Tween.to(self, { y: self.y - 320 + 120, alpha: 1 }, 500, null/*Laya.Ease.elasticOut*/, Laya.Handler.create(this, this.removeSelf));
    }
    removeSelf(): void {
        Laya.timer.once(800, this, () => {
            this.owner.removeSelf();

        });
    }
    onDisable(): void {
        Laya.Pool.recover("toast", this.owner);
        // this.owner.destroy();
    }
    /**
     * 非挂载的toast的创建
     * @param txt toast文本
     */
    public static noBindScript(txt: string, parent?: any, pos?): void {
        let toast: Laya.Prefab = Laya.loader.getRes("prefab/toastSprite.json");
        let toastSprite: Laya.Sprite = toast.create()/*Laya.Pool.getItemByCreateFun("toast", toast.create, toast)*/;
        toastSprite.zOrder = 3005;
        let label = toastSprite.getChildByName("showText") as Laya.Label;
        if (!label) {
            return;
        }
        label.text = txt;
        if (pos) {
            toastSprite.pos(Laya.stage.width / 2 - label.width / 2, pos.y);
        } else {
            toastSprite.pos(Laya.stage.width / 2 - label.width / 2, (Laya.stage.height / 2) + 250 - 250);
        }
        if (parent) {
            parent.addChild(toastSprite);
        } else {
            Laya.stage.addChild(toastSprite);
        }
    }
}