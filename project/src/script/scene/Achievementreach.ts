import Data2 from "../Data/DataTables";
import FixedDataTables = Data2.FixedDataTables;
import Data from "../Data/JsonEnum";
import PlayingVar from "../manage/Playing_var";
import HttpModel from "../Connect/HttpClass";
import HttpModel2 from "../Connect/HttpEnum"
import HttpModel3 from "../Connect/HttpError"
import BagDataControl from "../manage/BagDataControl";
import AchievementControl from "./AchievementControl";
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
export default class Achievementreach extends Laya.Script {
    /** @prop {name:getDiamond,tips:"获取钻石数量",type:Prefab}*/
    getDiamond: Laya.Prefab;
    /**自己*/
    private self;
    /**所属box*/
    private box: Laya.Box;
    /**所属list*/
    private list: Laya.List;
    /**list的父节点*/
    private contentSet: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Dialog;

    constructor() { super(); }
    onEnable(): void {
        this.init();
        this.reachButtonClick();
    }

    init() {
        this.self = this.owner as Laya.Sprite;
        this.box = this.self.parent as Laya.Box;
        this.list = this.owner.scene.m_list as Laya.List;
        this.contentSet = this.list.parent as Laya.Sprite;
        this.selfScene = this.self.scene as Laya.Dialog;
    }
    /**去除数据表类型，组成的数组*/
    private reachButton: Laya.Sprite;
    /**领奖按钮的点击事件*/
    reachButtonClick() {
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.reachButtonDOWN);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.reachButtonMOVE);
        this.self.on(Laya.Event.MOUSE_UP, this, this.reachButtonUP);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.reachButtonOUT);
    }
    /**按下缩小*/
    reachButtonDOWN(): void {
        Music.getInstance().playSound(musicToUrl.button_normal);
    }
    reachButtonMOVE(): void {
    }
    reachButtonUP(): void {
        //父节点名称后面的数字和他的顺序相等
        let parentName = this.box.name;
        //截取名称后面的数字
        let number = parentName.substring(4);
        // 状态改为已经领取
        let data = this.list.array[number];
        let type = data.tapIndex;
        let id = data.id;
        // 本地上传的object，下面这种写法是给予object定值
        let object = {};
        object[type] = {};
        object[type][id] = 1;
        // 数据对接
        const urls: string = (HttpModel2.URLSERVER + HttpModel2.httpUrls.AchieveFetch);
        const args: any = { uuId: PlayingVar.getInstance().uuId, achieveType: type, achieveId: id };
        Laya.Dialog.showLoadingPage();
        const httpClass = new HttpModel.HttpClass(Laya.Handler.create(this, (e: any) => {
            //收到回调
            if (!e.ret) {
                // 本地修改数据
                PlayingVar.getInstance().updatePlayerAchieve(object);
                // 上传服务器
                BagDataControl.getInstance().updateBagDate_new(e);
                // 修改按钮状态刷新列表
                this.list.array[number].getState = 'getComplete';
                this.list.refresh();
                // 更新tap页的红点提示
                this.selfScene.getComponent(AchievementControl).tapRedDotRrompt();
                this.selfScene.getComponent(AchievementControl).getStick();
                // 钻石飞升动画
                this.diamondIconAnimation(data);
            } else {
                new HttpModel3.HttpError(e.ret, this.owner);
            }
            Laya.Dialog.hideLoadingPage();
            console.error(e);
        }), urls, JSON.stringify(args));
    }

    /** 钻石图标飞向钻石资源位置动画commonPic/钻石图标.png*/
    diamondIconAnimation(data): void {
        //使用对象池创建钻石
        let getDiamond = this.selfScene.getComponent(AchievementControl).getDiamond as Laya.Prefab;
        let aniDiamond: Laya.Sprite = Laya.Pool.getItemByCreateFun("getDiamond", getDiamond.create, getDiamond);
        aniDiamond.alpha = 0;
        aniDiamond.scale(0, 0);
        // 数量显示
        let numberDiamonds = aniDiamond.getChildByName('numberDiamonds') as Laya.FontClip;
        numberDiamonds.value = 'x' + data.diamondsNumber.toString();
        // 添加到舞台
        aniDiamond.pos(Laya.stage.width / 3 + 30, Laya.stage.height / 3 + 50);
        Laya.stage.addChild(aniDiamond);
        aniDiamond.zOrder = 5000;
        // 主界面钻石在屏幕上stage坐标
        let target = Laya.stage._children[0]._children[0].img_mainDiamond;
        let targetPosX = target.x + target.parent.x;
        let targetPosY = target.y + target.parent.y;

        // 动画表现
        let timeLine = new Laya.TimeLine;
        timeLine.addLabel('appear', 0).to(aniDiamond, { scaleX: 1, scaleY: 1, alpha: 1 }, 500, Laya.Ease.circInOut, 0)
            .addLabel('move', 0).to(aniDiamond, { x: targetPosX - 10, y: targetPosY + 50, scaleX: 0.5, scaleY: 0.5 }, 700, Laya.Ease.circInOut, 0)
            .addLabel('vanish', 0).to(aniDiamond, { x: targetPosX, y: targetPosY, alpha: 0 }, 500, Laya.Ease.circInOut, 0)
        timeLine.play('appear', false);
        timeLine.on(Laya.Event.COMPLETE, this, this.onComplete);
        timeLine.on(Laya.Event.LABEL, this, this.onLabel);

    }
    onComplete() {
        console.log("timeLine complete!!!!");
    }

    onLabel(label) {
        console.log("LabelName:" + label);
    }
    reachButtonOUT(): void {
    }
    onDisable(): void {
    }
}