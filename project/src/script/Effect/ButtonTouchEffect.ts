import toast from "../manage/toast";

export default class ButtonTouchEffect extends Laya.Script {
    /**
     * 按钮动画通用动作序列
     */
    constructor() { super() }
    private self: Laya.Button;
    private startScale: number;
    onEnable() {
        this.self = this.owner as Laya.Button;
        this.startScale = this.self.scaleX;
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.setScaleSmall);
        this.self.on(Laya.Event.MOUSE_UP, this, this.setResumeScale);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.setScaleSmall);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.setResumeScale);
    }
    setScaleSmall(e) {
        // this.self.
        if (this.self.hasOwnProperty("canTouch") && !this.self["canTouch"]) {
            return;
        }
        this.self.scale(0.9 * this.startScale, 0.9 * this.startScale);
    }
    setResumeScale() {
        this.self.scale(this.startScale, this.startScale);
    }
}