import EndlessSuspend from './EndlessSuspend';
export default class EndlessSuspend_explain extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**所属box*/
    private box: Laya.Box;
    /**所属list*/
    private list: Laya.List;
    /**list的父节点*/
    private contentSet: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**提示框*/
    private explain: Laya.Image;
    /**自己在list中的名字，这个名字恰好对应的是index*/
    private selfIndex: any;
    /**长按显示提示框的时间计算*/
    private longPressTime: number;
    /**长按开关*/
    private pressSwitch: boolean;

    constructor() { super(); }

    onEnable(): void {
        this.initScene();
    }

    /**场景初始化*/
    initScene(): void {
        this.self = this.owner as Laya.Sprite;
        this.box = this.self.parent as Laya.Box;
        this.list = this.owner.scene.m_list as Laya.List;
        this.contentSet = this.list.parent as Laya.Sprite;
        this.selfScene = this.self.scene as Laya.Dialog;
        this.explain = this.selfScene.getComponent(EndlessSuspend).explain;
        //父节点名称后面的数字和他的顺序相等
        let parentName = this.box.name;
        //截取名称后面的数字
        this.selfIndex = parentName.substring(4);
        // 长按时间
        this.longPressTime = 0;
        //长按开关
        this.pressSwitch = false;
        // 点击事件
        this.cellClick();
    }

    /**cell的点击事件*/
    cellClick() {
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.cellDOWN);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.cellMOVE);
        this.self.on(Laya.Event.MOUSE_UP, this, this.cellUP);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.cellOUT);
    }
    
    /**按下*/
    cellDOWN(): void {
        this.longPressTime = 0;
        this.pressSwitch = true;
        // 解释图片下面的三个属性和这个cell一一对应
        // icon
        let id = this.list.array[this.selfIndex].id;
        let url = 'endlessMode' + '/' + 'icon_' + id + '.png';
        let icon = this.explain.getChildByName('icon') as Laya.Sprite;
        icon.loadImage(url);
        // 名字
        let name = this.explain.getChildByName('name') as Laya.Label;
        name.text = this.list.array[this.selfIndex].name;
        // 描述
        let decExplain = this.explain.getChildByName('describe') as Laya.Label;
        decExplain.text = this.list.array[this.selfIndex].dec;
        // 位置变化
        let posX = this.box.x;
        if (posX >= this.list.width * 1 / 4 && posX < this.list.width * 2 / 4) {
            this.explain.x = this.contentSet.width * 3 / 4 - 50;
        } else if (posX >= this.list.width * 2 / 4 && posX < this.list.width * 3 / 4) {
            this.explain.x = this.contentSet.width * 1 / 4 + 50;
        } else {
            this.explain.x = this.contentSet.width / 2;
        }
    }

    /**移动时缩小*/
    cellMOVE(): void {
    }
    /**抬起大小还原打开场景*/
    cellUP(): void {
        this.longPressTime = 0;
        this.pressSwitch = false;
        this.explain.alpha = 0;
    }
    /**出屏幕大小还原*/
    cellOUT(): void {
        this.longPressTime = 0;
        this.pressSwitch = false;
        this.explain.alpha = 0;
    }
    /**设置显示*/
    onUpdate(): void {
        if (this.pressSwitch) {
            this.longPressTime += 1;
            if (this.longPressTime >= 0 && this.longPressTime < 20) {
                this.explain.alpha = 0;
            } else if (this.longPressTime >= 10) {
                this.explain.alpha = 1;
            }
        }
    }

    onDisable(): void {

    }

}