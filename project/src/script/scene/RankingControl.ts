import { ui } from "../../ui/layaMaxUI"
import PlayingControl from "../playing/PlayingSceneControl";
export default class RankingControl extends ui.test.RankingUI {
    /**
     * 开放域排行榜dialog
     */
    private self: Laya.Dialog;
    constructor() {
        super();
    }
    onEnable() {
        this.setListener();
    }
    onOpened(para: any) {
        if (Laya.Browser.onMiniGame) {
            // let message = { type: 1, value: 1 };
            // message.type = 1;
            // message.value = null;
            // this.openDataView.postMsg(message);
            this.onSelect(1);
        }
    }
    setListener() {
        this.btn_level.on(Laya.Event.CLICK, this, this.onSelect, [1]);
        this.btn_endless.on(Laya.Event.CLICK, this, this.onSelect, [2]);
        this.btn_close.on(Laya.Event.CLICK, this, this.closeRank);
    }
    onSelect(index: number) {
        if (index === 1) {
            this.btn_level.skin = "ranking/选中页签.png";
            this.btn_endless.skin = "ranking/页签.png";
        } else {
            this.btn_level.skin = "ranking/页签.png";
            this.btn_endless.skin = "ranking/选中页签.png";
        }
        if (Laya.Browser.onMiniGame) {
            let message = { type: 1, value: 1 };
            message.type = index === 1 ? 1 : 3;
            message.value = null;
            this.openDataView.postMsg(message);
        }
    }
    closeRank(): void {
        this.close();
    }
    onDestroy() {
        const urls: string[] = ["commonPic/黑色遮罩.png", "ranking/标题底.png", "ranking/界面底板.png"];
        PlayingControl.instance.clearResUrl(urls, true);
    }
}