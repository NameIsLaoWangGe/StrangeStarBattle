import { ui } from "../../ui/layaMaxUI"
export default class RankingControl extends ui.test.RankingUI {
    /**
     * 开放域排行榜dialog
     */
    private self: Laya.Dialog;
    constructor() {
        super();
    }

    onOpened(para: any) {
        this.setListener();
        if (Laya.Browser.onMiniGame) {
            let message = { type: 1, value: 1 };
            message.type = 1;
            message.value = null;
            this.openDataView.postMsg(message);
        }
    }
    setListener() {
        this.btn_close.on(Laya.Event.CLICK, this, this.closeRank);
    }
    closeRank(): void {
        this.close();
    }
}