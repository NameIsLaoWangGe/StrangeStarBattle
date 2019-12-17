import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import DialogEffect from "../manage/DialogEffect";
import musicToUrl = MusicEnum.musicToUrl;
export default class Setting extends Laya.Script {
    /**
     * 设置~
     */
    constructor() { super(); }
    private setMusic: Laya.Button;
    private setSound: Laya.Button;

    private dilogEffect: DialogEffect;
    onEnable(): void {
        Music.getInstance().playSound(musicToUrl.ui_popup);
        this.owner["btn_close"].on(Laya.Event.CLICK, this, () => {
            this.playCommonSound();
            // (this.owner as Laya.Dialog).close();
            this.dilogEffect.removeAnimation(Laya.Handler.create(this, () => {
                (this.owner as Laya.Dialog).close();
                this.dilogEffect = null;
            }));
        });
        this.setSound = this.owner["btn_sound"];
        this.setMusic = this.owner["btn_music"];
        this.setListerner();
        this.changeStart(0);
        this.dilogEffect = new DialogEffect(this.owner as Laya.Dialog);
    }
    setListerner() {
        this.setMusic.on(Laya.Event.CLICK, this, this.changeStart, [1]);
        this.setSound.on(Laya.Event.CLICK, this, this.changeStart, [2]);
    }

    changeStart(type: number) {
        switch (type) {
            case 1:
                this.setMusic.skin = Music.getInstance().musicOn ? "set/关按钮.png" : "set/开按钮.png";
                Music.getInstance().musicOn = !Music.getInstance().musicOn;
                if (Music.getInstance().musicOn) {
                    Music.getInstance().startNowMusic();
                } else {
                    Music.getInstance().stopNowMusic();
                }
                this.playCommonSound(Music.getInstance().musicOn);
                break;
            case 2:
                this.setSound.skin = Music.getInstance().soundOn ? "set/关按钮.png" : "set/开按钮.png";
                Music.getInstance().soundOn = !Music.getInstance().soundOn;
                this.playCommonSound(Music.getInstance().soundOn);
                break;
            default:
                this.setMusic.skin = Music.getInstance().musicOn ? "set/开按钮.png" : "set/关按钮.png";
                this.setSound.skin = Music.getInstance().soundOn ? "set/开按钮.png" : "set/关按钮.png";
                break;
        }

    }
    playCommonSound(onOff?: boolean) {
        Music.getInstance().playSound(onOff ? musicToUrl.set_on : musicToUrl.set_off);
    }
}