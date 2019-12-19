/**
 * 弹出的界面的Dialog的效果
 */
export default class DialogEffect {
    private readonly dialogObject: Laya.Dialog;
    constructor(dia: Laya.Dialog) {
        if (!dia) {
            console.error("发生错误~！");
            debugger;
        }
        this.dialogObject = dia;
        this.init();
    }
    init() {
        let owner = this.dialogObject;
        owner.x = -Laya.stage.width - 50;
        owner.y = Laya.stage.height / 2;
        owner.alpha = 0;
        this.popupAnimation();
    }
    //弹出动画
    popupAnimation(): void {
        let owner = this.dialogObject;
        Laya.Tween.to(owner, { x: Laya.stage.width / 2, y: Laya.stage.height / 2, alpha: 1 }, 200, Laya.Ease.expoIn, Laya.Handler.create(this, function () {
        }, []), 0);
    }

    //弹出动画
    private compelete: Laya.Handler;
    removeAnimation(handler: Laya.Handler): void {
        this.compelete = handler;
        let owner = this.dialogObject;
        Laya.Tween.to(owner, { x: - Laya.stage.width / 2, y: Laya.stage.height / 2, alpha: 0 }, 100, Laya.Ease.circIn, Laya.Handler.create(this, this.destroyAnimation, []), 0);
    }


    //移除动画
    destroyAnimation() {
        Laya.Tween.clearAll(this.dialogObject);
        this.compelete.run();
    }
}