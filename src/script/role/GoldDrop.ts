import Playing_var from "../manage/Playing_var"
import PlayingSceneControl from "../playing/PlayingSceneControl"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;

export default class GoldDrop extends Laya.Script {
    private self: Laya.Image;
    private roleObj: Laya.Sprite;
    private readonly speedValue: number = 15;
    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Image;
        this.roleObj = PlayingSceneControl.instance.roleObj;
    }
    onUpdate() {
        const selfPoint: Laya.Point = new Laya.Point(this.self.x, this.self.y);
        const distance: number = selfPoint.distance(this.roleObj.x + this.roleObj.width / 2, this.roleObj.y + this.roleObj.height / 2);
        if (distance <= 65) {
            this.self.removeSelf();
            Music.getInstance().playSound(musicToUrl.get_coin);
        } else {
            const difference = new Laya.Point(this.self.x - (this.roleObj.x + this.roleObj.width / 2), this.self.y - (this.roleObj.y + this.roleObj.height / 2));
            difference.normalize();
            this.self.x -= this.speedValue * difference.x;
            this.self.y -= this.speedValue * difference.y;
        }
    }
    onDisable(): void {
        Laya.Pool.recover("DropGold", this.self);
    }
}