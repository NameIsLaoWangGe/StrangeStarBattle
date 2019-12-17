import MusicEnum from "../Data/MusicEnum"
import musicPath = MusicEnum.musicPath;
import musicToUrl = MusicEnum.musicToUrl;
import SoundManager = Laya.SoundManager;
export default class Music {
    private static instance: Music;
    private _musicOn: boolean;
    private _soundOn: boolean;
    constructor() {
        SoundManager.useAudioMusic = false;
    };
    static getInstance() {
        if (!Music.instance) {
            Music.instance = new Music();
            Laya.Browser.window.Music = Music.instance;
        }
        return Music.instance;
    }
    get musicOn(): boolean {
        if (this._musicOn === undefined) {
            this._musicOn = true;
        }
        return this._musicOn;
    }
    set musicOn(can: boolean) {
        this._musicOn = can;
    }
    get soundOn(): boolean {
        if (this._soundOn == undefined) {
            this._soundOn = true;
        }
        return this._soundOn;
    }
    set soundOn(can: boolean) {
        this._soundOn = can;
    }
    /**
     * 
     * @param markType 
     * 播放音乐
     */
    playMusic(markType: musicToUrl) {
        this.musicOn === void 0 && (this.musicOn = true);
        this.musicOn && SoundManager.playMusic(musicPath + musicToUrl[markType] + ".mp3");
    }
    /**
     * 播放音效
     * @param markType
     */
    playSound(markType: musicToUrl, loops?: number) {
        this.soundOn === void 0 && (this.soundOn = true);
        this.soundOn && SoundManager.playSound(musicPath + musicToUrl[markType] + ".mp3", loops || 1);
    }
    /**
     * 音乐静音
     */
    stopNowMusic() {
        Laya.SoundManager.stopMusic();
    }
    /**
     * 关闭音乐静音
     */
    startNowMusic() {
        this.playMusic(musicToUrl.bg_menu);
    }
    //停止某个sound
    stopOneSound(markType: musicToUrl) {
        SoundManager.stopSound(musicPath + musicToUrl[markType] + ".mp3");
    }
}