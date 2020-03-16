import { ui } from "../../ui/layaMaxUI";
import DialogEffect from "../manage/DialogEffect";
import Music from "../manage/Music";
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import toast from "../manage/toast";
import EndlessManage from "../manage/EndlessManage";
import WeiXinAD from "../manage/WeiXinAD";


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
        } else if (e === "cancel") {
            this.cancelActionByType();
        }
    }
    setPopText(txt: string): void {
        if (txt) {
            this.showText.text = txt;
        }
    }
    cancelActionByType() {
        switch (this.popType) {
            case 2:
                this.dialogE = null;
                this.destroy();
                EndlessManage.getInstance().selectSkillBack();
                break;

            default:
                break;
        }
    }
    goActionByType() {
        switch (this.popType) {
            case 0:         //体力
            case 1:         //金币
                Laya.Scene.open("test/ExchangeDialog.scene", false, this.popType);
                this.dialogE = null;
                this.destroy();
                this.destroy();
                break;
            case 2:
                //观看广告
                Laya.Dialog.showLoadingPage();
                if (WeiXinAD.getInstance().adStatus) {
                    WeiXinAD.getInstance().addVideoAD(Laya.Handler.create(this, this.lookAdCallBack));
                } else {
                    Laya.timer.once(5000, this, () => {
                        this.dialogE = null;
                        this.destroy();
                        toast.noBindScript("广告观看完成~!");
                        EndlessManage.getInstance().createSelectSkill();
                    });
                }
                break;
            default:
                break;
        }
    }
    lookAdCallBack(e: number) {
        if (e) {
            this.dialogE = null;
            this.destroy();
            toast.noBindScript("广告观看完成~!");
            EndlessManage.getInstance().createSelectSkill();
        } else {
            toast.noBindScript("广告观看未完成！");
            Laya.Dialog.hideLoadingPage();
        }
    }
}
