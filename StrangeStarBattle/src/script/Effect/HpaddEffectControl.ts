import TimeLine = Laya.TimeLine;
import Event = Laya.Event;
export default class HpaddEffectControl extends Laya.FontClip {
    private timeLineObj: TimeLine;
    constructor() { super() };
    onEnable() {
        this.timeLineObj = new TimeLine();
        const timeLineObj = this.timeLineObj;
        this.alpha = 1;
        timeLineObj.addLabel("move", 0).to(this, { y: this.y - 250 }, 2000, Laya.Ease.expoOut, 0)
            .addLabel("alphaChange", 1500).to(this, { alpha: 0 }, 1000, null, 0);
        timeLineObj.play(0, false);
        timeLineObj.on(Event.COMPLETE, this, this.onFinished);
        timeLineObj.on(Event.LABEL, this, this.onLabel);
    }
    onFinished(): void {
        this.timeLineObj.destroy();
        this.removeSelf();
    }
    onLabel(label: string): void {
        console.log("标签~---", label);
    }
    onDisable() {
        Laya.Pool.recover("HpAddToast", this);
    }
}