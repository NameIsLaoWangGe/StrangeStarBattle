import Buff from "../role/Buff"
import tools from "../Tools/Tool"
import PlayingControl from "../playing/PlayingSceneControl"
import Data from "../Data/JsonEnum"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
export default class BuffControl extends Laya.Script {
    private proppertyObj: Buff;
    private self: Laya.Sprite;
    private buffId: number;
    //private regidbody: Laya.RigidBody;
    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.proppertyObj = this.self["propertyObj"];
        this.buffId = this.proppertyObj.buffId;
        this.self.visible = true;
    }
    onUpdate() {
        if (!this.self.visible) {
            return;
        }
        this.setMove();
        this.hitCollision();
        this.collisionLeaveSceen();
    }
    collisionLeaveSceen() {
        if (this.self.y > (Laya.stage.height + this.proppertyObj.mark_h / 2)) {
            this.self.removeSelf();
        }
    }
    setMove() {
        this.self.y += 2;
    }
    hitCollision() {
        const w: number = this.proppertyObj.mark_w;
        const h: number = this.proppertyObj.mark_h;
        const rect0: Data.Rect = { x: this.self.x - w / 2, y: this.self.y - h / 2, w: w, h: h };
        const role_w = PlayingControl.instance.role_w;
        const role_h = PlayingControl.instance.role_h;
        const mainPlane = PlayingControl.instance.mainPlane;
        const mainPlanePoint = new Laya.Point(mainPlane.x - role_w / 2, mainPlane.y - role_w / 2);
        mainPlane.localToGlobal(mainPlanePoint);

        const roleRect: Data.Rect = { x: mainPlanePoint.x, y: mainPlanePoint.y, w: role_w, h: role_h };
        const isCollision = tools.rectangleCollisions(rect0, roleRect);
        if (isCollision) {
            PlayingControl.instance.setBuff(this.proppertyObj);
            this.self.removeSelf();
            Music.getInstance().playSound(musicToUrl.get_item);
        }
    }
    onDisable() {
        this.self.visible = false;
        Laya.Pool.recover("buff", this.self);
    }
    onDestroy() {
        debugger
    }
}