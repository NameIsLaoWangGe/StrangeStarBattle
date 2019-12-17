import { ui } from "../../ui/layaMaxUI";
import DialogEffect from "../manage/DialogEffect";
import Music from "../manage/Music";
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import toast from "../manage/toast";
import EndlessManage from "../manage/EndlessManage";


export default class PopDialogRunTime extends ui.test.popDialogUI {
    private popType: number;
    private dialogE: DialogEffect;

    constructor() { super() }
    onEnable() {
        this.showText.leading = 9;
        this.dialogE = new DialogEffect(this);
        this.closeHandler = new Laya.Handler(this, this.closeNowDialog);
        this.btn_closeDialog.on(Laya.Event.CLICK, this, () => {
            this.close();
            this.dialogE = null;
        });
    }
    /**
     * 
     * @param txt 
     * @param type 1||null 默认兑换 2 无尽观看广告 
     */
    onOpened(data: any) {
        data.txt && this.setPopText(data.txt);
        this.popType = data.type;
    }
    closeNowDialog(e: string) {
        Music.getInstance().playSound(musicToUrl.button_normal);
        if (e === "sure") {
            this.goActionByType();
        }
    }
    setPopText(txt: string): void {
        if (txt) {
            this.showText.text = txt;
        }
    }
    /**
     * 不同的type不同的界面~
     */
    setDiffItemByType() {

    }
    goActionByType() {
        switch (this.popType) {
            case 1:
                Laya.Scene.open("test/ExchangeDialog.scene", false, 1);
                this.dialogE = null;
                this.destroy();
                this.destroy();
                break;
            case 2:
                //观看广告
                Laya.Dialog.showLoadingPage();
                Laya.timer.once(5000, this, () => {
                    this.dialogE = null;
                    this.destroy();
                    this.destroy();
                    toast.noBindScript("广告观看完成~!");
                    EndlessManage.getInstance().createSelectSkill();
                });
                break;
            default:
                break;
        }
    }
}
