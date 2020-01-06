import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import AdaptScene from "../manage/AdaptScene";
import PlayingControl from "../playing/PlayingSceneControl";
import Skeleton = Laya.Skeleton;
import LYSprite = Laya.Sprite;

export default class BossWarning extends Laya.Script {
    private isTempletCreate: boolean;
    private sk: Skeleton;
    private self: LYSprite;
    constructor() {
        super();
    }
    onEnable(): void {
        this.self = this.owner as LYSprite;
        const Image = Laya.Image;
        const warningBg = this.owner.getChildAt(0) as Laya.Image;
        this.sk = this.owner.getChildByName("sk") as Skeleton;
        this.sk.on(Laya.Event.STOPPED, this, this.finished);
        warningBg.height = Laya.stage.height;
        Laya.timer.loop(150, this, this.setWarning, [warningBg]);
        this.self.visible = true;
        this.isTempletCreate = null;
    }
    private markIndex: number = 0;
    setWarning(e: Laya.Image): void {
        if (this.markIndex++ % 2 === 0) {
            e.visible = false;
        } else {
            e.visible = true;
        }
    }
    onUpdate() {
        if (!this.isTempletCreate && this.sk && this.sk.templet) {
            this.isTempletCreate = true;
            this.setSkPlaying();
        }
    }
    setSkPlaying() {
        const isWaveEffect: boolean = PlayingControl.instance.isWaveEffect;
        this.sk.visible = true;
        if (isWaveEffect) {
            this.sk.play("xiaoguailx", false);
        } else {
            this.sk.play("bosslx", false);
        }
        PlayingControl.instance.isWaveEffect = null;
    }
    finished() {
        this.self.removeSelf();
    }
    onDisable(): void {
        // this.owner.destroy();
        // this.destroy();
        this.self.visible = false;
        Laya.Pool.recover("Boss_warning", this.self);
        this.reSetMusic();
    }
    reSetMusic() {
        //开始播放打boss的音乐
        Music.getInstance().playMusic(musicToUrl.bg_boss);
    }
}