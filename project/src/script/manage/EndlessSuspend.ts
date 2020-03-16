import Data2 from "../Data/DataTables";
import FixedDataTables = Data2.FixedDataTables;
import Data from "../Data/JsonEnum";
import PlayingVar from "../manage/Playing_var";
import PlayingSceneControl from "../playing/PlayingSceneControl";
import EndlessParseSkill from "./EndlessParseSkill";
import EndlessManage from "./EndlessManage";
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
export default class EndlessChooseSkills extends Laya.Script {
    /**自己*/
    private self: Laya.Dialog;
    /**内容合集,除了背景都在这里*/
    private contentSet: Laya.Sprite;
    /**成就列表*/
    private list: Laya.List;
    /**背景图*/
    private background: Laya.Sprite;
    /**数据表*/
    private indexData: any;
    /**已经学习的技能的id*/
    private acquiredSkills: Array<number>;
    /**退出游戏按钮*/
    private But_Quit: any;
    /**继续游戏按钮*/
    private But_Continue: any;
    /**提示框*/
    private explain: Laya.Image;
    /**长按显示提示框的时间计算*/
    private longPressTime: number;
    /**长按开关*/
    private pressSwitch: boolean;

    constructor() { super(); }
    onEnable(): void {
        this.initScene();
        this.listInit();
    }

    /**场景初始化*/
    initScene(): void {
        this.self = this.owner as Laya.Dialog;
        this.contentSet = this.owner.getChildByName('contentSet') as Laya.Sprite;
        this.background = this.owner.getChildByName('background') as Laya.Sprite;
        this.contentSet.x = -800;
        this.self.pos(0, 0);
        //列表
        this.list = this.self['m_list'];
        this.list.repeatX = 4;
        this.list.repeatY = 4;
        this.list.spaceY = 10;
        //数据表
        this.indexData = FixedDataTables.getInstance().getData(Data.DataType.endless_skill);
        //已经学习的技能的id包括顺序
        this.acquiredSkills = EndlessParseSkill.getInstance().skillsByDate;
        //退出按钮
        this.But_Quit = this.self['But_Quit'];
        //继续按钮
        this.But_Continue = this.self['But_Continue'];
        //提示框
        this.explain = this.self['explain'];
        this.explain.alpha = 0;
      
        this.adaptive();
        this.closeButtonClick();
        Laya.timer.pause();
        this.interfaceAppear();
    }

    /**适配策略*/
    adaptive() {
        this.contentSet.y += 10;
        this.background.height = Laya.stage.height;
        this.background.width = Laya.stage.width;
        this.contentSet.y += (Laya.stage.height - 1334) / 2;
    }

    /**出现开关*/
    private appearSwitch: boolean = true;
    /**界面出现动画*/
    interfaceAppear(): void {
        // 内容移动
        if (this.contentSet.x >= 0) {
            this.appearSwitch = false;
        } else {
            this.contentSet.x += 200;
        }
        // 背景容移动
        if (this.background.alpha >= 0.8) {
            this.background.alpha += 0.8;
        } else {
            this.background.alpha += 0.05;
        }
    }

    /**界面消失动画*/
    interfaceVanish(type): void {
        // 内容移动
        if (this.contentSet.x <= -800) {
            this.contentSet.x = -800;
            Laya.timer.resume();
            if (type === 'continue') {
                PlayingSceneControl.instance.resumeGame();
            } else if (type === 'settle') {
                EndlessManage.getInstance().immediatelySettlement();
            }
            this.self.close();
        } else {
            this.contentSet.x -= 150;
        }

        // 背景移动
        if (this.background.alpha <= 0) {
            this.background.alpha = 0;
        } else {
            this.background.alpha -= 0.05;
        }
    }

    /**成就栏初始化*/
    listInit(): void {
        // this.list.scrollBar.hide = true;//使用但隐藏滚动条
        // this.list.scrollBar.elasticBackTime = 200;//设置橡皮筋回弹时间。单位为毫秒。
        // this.list.scrollBar.elasticDistance = 50;//设置橡皮筋极限距离。
        this.list.selectEnable = true;//设置可选
        this.listArrayMessage();
        this.list.selectHandler = new Laya.Handler(this, this.onSelect_List);
        this.list.renderHandler = new Laya.Handler(this, this.updateItem);
    }

    /**把数据表中的数据导入list.array中*/
    listArrayMessage(): void {
        let data: Array<object> = [];
        // 没有学习技能则不执行
        if (this.acquiredSkills.length <= 0) {
            this.list.array = [];
            return;
        }
        // 导入已经学习过的技能
        for (let i = this.acquiredSkills.length - 1; i >= 0; i--) {
            for (const key in this.indexData) {
                if (this.indexData.hasOwnProperty(key)) {
                    const element = this.indexData[key];
                    if (element.id == this.acquiredSkills[i]) {
                        data.push({
                            id: key,
                            icon: element.icon,
                            name: element.name,
                            dec: element.dec,
                            animation: true,
                        });
                    }
                }
            }
        }
        this.list.array = data;
    }

    /**list动画,翻页的时候不可以点击*/
    listAnimation(): void {
        // 设置不可选
        this.list.selectEnable = false;
        // 最后一个置顶
        this.list.scrollTo(this.list.array.length);
        // 下翻到最后一个
        this.list.tweenTo(0, 1000, Laya.Handler.create(this, function () {
            // 设置不可选
            this.list.selectEnable = true;
        }, []));
    }

    /**当前触摸的box监听，触摸到之后直接把信息复制给提示框 this.explain，虽然它并不一定显示*/
    onSelect_List(index: number): void {
        // 解释图片下面的三个属性和这个cell一一对应
        // icon
        let id = this.list.array[index].id;
        let url = 'endlessMode' + '/' + 'icon_' + id + '.png';
        let icon = this.explain.getChildByName('icon') as Laya.Sprite;
        icon.loadImage(url);
        // 名字
        let name = this.explain.getChildByName('name') as Laya.Label;
        name.text = this.list.array[index].name;
        // 描述
        let decExplain = this.explain.getChildByName('describe') as Laya.Label;
        decExplain.text = this.list.array[index].dec;
    }

    /**box信息对应list赋值信息*/
    updateItem(cell: Laya.Box, index: number): void {
        // cell名称
        cell.name = 'item' + index;
        // icon
        let id = this.list.array[index].id;
        let url = 'endlessMode' + '/' + 'icon_' + id + '.png';
        let icon = cell.getChildByName('icon') as Laya.Sprite;
        icon.loadImage(url);
        // 技能名称
        let name = cell.getChildByName('name') as Laya.Label;
        name.text = this.list.array[index].name;
        if (name.text.length >= 7) {
            name.fontSize = 20;
        } else {
            name.fontSize = 23;
        }
        // 可以在update里面做动画
    }

    /**继续游戏按钮和退出游戏按钮的点击事件*/
    closeButtonClick(): void {
        // 继续游戏按钮
        this.But_Continue.on(Laya.Event.MOUSE_DOWN, this, this.closeButtonDOWN);
        this.But_Continue.on(Laya.Event.MOUSE_MOVE, this, this.closeButtonMOVE);
        this.But_Continue.on(Laya.Event.MOUSE_UP, this, this.But_ContinueUP);
        this.But_Continue.on(Laya.Event.MOUSE_OUT, this, this.closeButtonOUT);
        // 退出游戏
        this.But_Quit.on(Laya.Event.MOUSE_DOWN, this, this.closeButtonDOWN);
        this.But_Quit.on(Laya.Event.MOUSE_MOVE, this, this.closeButtonMOVE);
        this.But_Quit.on(Laya.Event.MOUSE_UP, this, this.But_QuitUP);
        this.But_Quit.on(Laya.Event.MOUSE_OUT, this, this.closeButtonOUT);
    }
    /**按下缩小*/
    closeButtonDOWN(): void { Music.getInstance().playSound(musicToUrl.button_normal); }
    /**移动时缩小*/
    closeButtonMOVE(): void { }

    /**打开消失开关*/
    private vanishSwitch: boolean = false;
    private buttonContinue: boolean = false;
    private buttonSettle: boolean = false;
    /**继续按钮点击事件,关闭场景*/
    But_ContinueUP(): void {
        this.vanishSwitch = true;
        this.buttonContinue = true;
        //内容先消失
    }

    /**退出按钮点击事件,切换场景*/
    But_QuitUP(): void {
        this.vanishSwitch = true;
        this.buttonSettle = true;
    }

    /**出屏幕大小还原*/
    closeButtonOUT(): void { }

    onUpdate(): void {
        // 出现控制
        if (this.appearSwitch) {
            this.interfaceAppear();
        }
        // 消失控制
        if (this.vanishSwitch) {
            if (this.buttonContinue) {
                this.interfaceVanish('continue');
            } else if (this.buttonSettle) {
                this.interfaceVanish('settle');
            }
        }
    }
    onDisable(): void {
    }

}