import Data from "../Data/JsonEnum"
export default class BaoZha extends Laya.Script {
    constructor() { super(); }
    private self: Laya.Sprite;
    private aniName: any/*Data.baozhaAni*/;
    private prefabName: string;
    private skObj: any;
    private playStatus: string;
    // private prefabName: string;
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.prefabName = this.self["prefabName"];
        this.self.visible = true;
        if (this.prefabName === "boss_baozha") {
            this.skObj = this.self;
            this.self.scale(1.5, 1.5);
        } else {
            this.skObj = this.self.getChildAt(0) as Laya.Skeleton;
        }

        this.skObj.on(Laya.Event.STOPPED, this, this.stopped)
        this.aniName = this.self["aniName"];
        if (this.aniName === "baozha1") {
            this.skObj.playbackRate(2.5);
        }
        Laya.timer.frameOnce(3, this, this.playAnimation);
    }
    playAnimation() {
        Laya.timer.clear(this, this.playAnimation);
        this.skObj.play(this.aniName, false, true);
        this.playStatus = "stopped";
    }
    stopped(): void {
        if (this.playStatus === "stopped") {
            this.self.removeSelf();
        }
    }
    onDisable(): void {
        this.self.visible = false;
        this.skObj.stop();
        // Laya.Pool.recover("baozha", this.self)
        Laya.Pool.recover(this.owner["prefabName"], this.self)
    }
}