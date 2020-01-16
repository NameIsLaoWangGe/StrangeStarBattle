import LYSkeleton = Laya.Skeleton;
export default class UpdateItemEffectControl extends Laya.Script {
    private self: LYSkeleton;
    private canPlay: boolean;
    constructor() { super() }
    onEnable() {
        this.self = this.owner as LYSkeleton;
        this.self.on(Laya.Event.STOPPED, this, this.playFinished);
        this.canPlay && this.self.play(0, false);
    }
    onUpdate() {
        if (!this.canPlay && this.self.templet) {
            this.canPlay = true;
            this.self.play(0, false);
        }
    }
    playFinished() {
        this.self.removeSelf();
    }
    onDisable() {
        Laya.Pool.recover("UpdateWeapon", this.self);
    }
}