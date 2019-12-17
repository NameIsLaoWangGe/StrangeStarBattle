import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import AdaptScene from "../manage/AdaptScene";
import PlayingControl from "../playing/PlayingSceneControl";
export default class BossWarning extends Laya.Script {
    constructor() {
        super();
    }
    onEnable(): void {
        const Image = Laya.Image;
        const warningBg = this.owner.getChildAt(0) as Laya.Image;
        warningBg.height = Laya.stage.height;
        const bossEffect = this.owner.getChildByName("boss") as Laya.Image;
        const enemyEffect = this.owner.getChildByName("enemy") as Laya.Image;
        const isWaveEffect = PlayingControl.instance.isWaveEffect || false;
        bossEffect.visible = !isWaveEffect;
        enemyEffect.visible = isWaveEffect;
        PlayingControl.instance.isWaveEffect = null;
        Laya.timer.loop(150, this, this.setWarning, [warningBg]);
    }
    private markIndex: number = 0;
    setWarning(e: Laya.Image): void {
        if (this.markIndex++ % 2 === 0) {
            e.visible = false;
        } else {
            e.visible = true;
        }
        if (this.markIndex >= 20) {
            this.owner.removeSelf();
        }
    }
    onDisable(): void {
        this.owner.destroy();
        this.destroy();
        this.reSetMusic();
    }
    reSetMusic() {
        //开始播放打boss的音乐
        Music.getInstance().playMusic(musicToUrl.bg_boss);
    }
}