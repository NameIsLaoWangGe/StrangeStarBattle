import { ui } from "../../ui/layaMaxUI";

export default class ReqLoadingControl extends ui.test.ReqLoadingUI {
    private canMove: boolean;
    constructor() { super() };
    onEnable() {
        this.blackSprite.alpha = 0.6;
        this.canMove = true;
        this.blackSprite.on(Laya.Event.CLICK, this, (e: Laya.Event) => {
            e.stopPropagation();
        });
        this.setLoading();
    }
    setLoading() {
        this.canMove && Laya.timer.loop(50, this, () => {
            if (this.canMove) {
                this.loadIcon.rotation += 4;
            }
        });
    }
    onClosed() {
        this.canMove = false;
        this.loadIcon.rotation = 0;
        Laya.timer.clearAll(this);
    }
}