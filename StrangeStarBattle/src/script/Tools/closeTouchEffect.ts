/**
 * 部分弹窗上的关闭按钮的缩放效果
 */
export default class closeTouchEffect extends Laya.Script {
    constructor() { super(); }
    private clothBtn: Laya.Button;
    onEnable(): void {
        this.clothBtn = this.owner as Laya.Button;
        this.clothBtn.on(Laya.Event.MOUSE_DOWN, this, this.setZoom);
        this.clothBtn.on(Laya.Event.MOUSE_MOVE, this, this.setZoom);
        this.clothBtn.on(Laya.Event.MOUSE_UP, this, this.setBig);
        this.clothBtn.on(Laya.Event.MOUSE_OUT, this, this.setBig);
    }
    setZoom() {
        this.clothBtn.scale(0.9, 0.9);
    }
    setBig() {
        this.clothBtn.scale(1, 1);
    }
}