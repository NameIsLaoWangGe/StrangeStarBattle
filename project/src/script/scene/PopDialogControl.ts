import toast from "../manage/toast"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import DialogEffect from "../manage/DialogEffect";

import musicToUrl = MusicEnum.musicToUrl;

export default class PopDialogControl extends Laya.Script {
    constructor() {
        super();
    }
    private self: Laya.Dialog;
    private showText: Laya.Label;
    //弹出效果不使用原生的
    private dialogE: DialogEffect;
    onEnable() {
        this.self = this.owner as Laya.Dialog;
        this.self.closeHandler = new Laya.Handler(this, this.closeNowDialog);
        this.showText = this.self["showText"] as Laya.Label;
        this.showText.leading = 9;

        this.dialogE = new DialogEffect(this.self);
        this.self["btn_closeDialog"].on(Laya.Event.CLICK, this, () => {
            this.self.close();
            this.dialogE = null;
        });
    }
    closeNowDialog(e: string): void {
        Music.getInstance().playSound(musicToUrl.button_normal);
        if (e === "sure") {
            Laya.Scene.open("test/ExchangeDialog.scene", false, 1);
        }
        this.dialogE = null;
        this.owner.destroy();
        this.destroy();

    }
    setPopText(txt: string): void {
        if (txt) {
            this.showText.text = txt;
        }
    }
}