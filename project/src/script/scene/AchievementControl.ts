import Data2 from "../Data/DataTables";
import FixedDataTables = Data2.FixedDataTables;
import Data from "../Data/JsonEnum";
import Achievementreach from "./Achievementreach";
import PlayingVar from "../manage/Playing_var";
import PlayingSceneControl from "../playing/PlayingSceneControl";
import AchievementButton from "./AchievementButton";
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
export default class AchievementControl extends Laya.Script {
    /** @prop {name:closeButton, tips:"关闭按钮", type:node, default:Button}*/
    public closeButton: Laya.Sprite;
    /** @prop {name:getDiamond,tips:"获取钻石数量",type:Prefab}*/
    getDiamond: Laya.Prefab;
    /**成就列表*/
    private list: Laya.List;
    /**成就类型tap*/
    private tap: Laya.Tab;
    /**自己*/
    private self: Laya.Dialog;
    /**关闭按钮初始大小*/
    private startScale: number;
    /**内容合集,除了背景都在这里*/
    private contentSet: Laya.Sprite;
    /**背景图*/
    private background: Laya.Sprite;
    /**分解数据表类型，组成的数组*/
    private dataTypeArray: Array<Array<Array<number>>>;
    /**领取奖励按钮状态*/
    private getState: string;
    /**从服务端拉去的成就所有信息*/
    private achieve: any;
    /**成就奖励被领过的信息，在成就按钮点击之后就已经计算好了*/
    private playerAchieve: any;
    /**成就按钮*/
    private achievementBtn: Laya.Button;
    /**当前tap最顶部的id*/
    private topID: number;

    constructor() { super(); }
    onEnable(): void {
        this.initScene();
        this.closeButtonClick();
        this.dataTypeCount();
        this.listInit();
        this.tapControl();
    }

    /**数据表各类型数量*/
    dataTypeCount(): void {
        let count: number = 0;
        this.dataTypeArray = [];
        let arr1: Array<Array<number>> = [];
        let arr2: Array<Array<number>> = [];
        let arr3: Array<Array<number>> = [];
        let arr4: Array<Array<number>> = [];
        let indexData = FixedDataTables.getInstance().getData(Data.DataType.achievement);
        for (let key in indexData) {
            if (indexData.hasOwnProperty(key)) {
                let element = indexData[key];
                if (element.type === 1) {
                    arr1.push([element.type, element.id]);
                } else if (element.type === 2) {
                    arr2.push([element.type, element.id]);
                } else if (element.type === 3) {
                    arr3.push([element.type, element.id]);
                } else if (element.type === 4) {
                    arr4.push([element.type, element.id]);
                }
            }
        }
        this.dataTypeArray.push(arr1);
        this.dataTypeArray.push(arr2);
        this.dataTypeArray.push(arr3);
        this.dataTypeArray.push(arr4);
    }

    /**场景初始化*/
    initScene(): void {
        let aniDiamond: Laya.Sprite = Laya.Pool.getItemByCreateFun("getDiamond", this.getDiamond.create, this.getDiamond);
        console.log(aniDiamond);
        // 初始化位置
        this.self = this.owner as Laya.Dialog;
        this.self.pos(0, 0);
        this.contentSet = this.owner.getChildByName('contentSet') as Laya.Sprite;
        // tap
        this.tap = this.self['m_tap'];
        this.tap.selectedIndex = 0;
        //列表
        this.list = this.self['m_list'];
        // 主界面成就按钮
        this.achievementBtn = Laya.stage._children[0]._children[0].achievementBtn;
        // 服务端成就信息
        this.achieve = PlayingVar.getInstance().achieve;
        this.playerAchieve = PlayingVar.getInstance().playerAchieve;

        //黑色先背景出现
        this.background = this.owner.getChildByName('background') as Laya.Sprite;
        Laya.Tween.to(this.background, { alpha: 0.8 }, 20, Laya.Ease.circIn, Laya.Handler.create(this, function () {
        }, []), 0);

        //内容延时出现
        Laya.Tween.to(this.contentSet, { x: 0 }, 100, Laya.Ease.circIn, Laya.Handler.create(this, function () {
        }, []), 0);

        this.adaptive();
    }

    /**适配策略*/
    adaptive() {
        let background = this.owner.getChildByName('background') as Laya.Sprite;
        let contentSet = this.owner.getChildByName('contentSet') as Laya.Sprite;
        contentSet.y += 40;
        background.height = Laya.stage.height;
        contentSet.y += (Laya.stage.height - 1334) / 2;
    }

    /**tap控制list规则*/
    tapControl(): void {
        this.tap.selectHandler = new Laya.Handler(this, this.onSelect_Tap);
        // 分别设置tap页的红点提示
        this.tapRedDotRrompt();
        this.getStick();
    }

    /**当前选中的tap监听,主要是显示根据类型显示list数量*/
    onSelect_Tap(index: number): void {
        Music.getInstance().playSound(musicToUrl.button_normal);
        this.listAssignment();
        this.list.refresh();
        this.tapRedDotRrompt();
        this.getStick();
    }

    /**1.tap上面的红点提示，
     *2.并且把可以领取的奖励Id也是最小的放最上面*/
    tapRedDotRrompt(): void {
        // 刷新数据后才能得到点击后的新数据
        this.achievementBtn.getComponent(AchievementButton).onEnable();
        // “可领取未领取”的id数组
        let canReach_B_Arr = this.achievementBtn.getComponent(AchievementButton).canReach_B_Arr;
        for (let i = 0; i < canReach_B_Arr.length; i++) {
            if (canReach_B_Arr[i].length !== 0) {
                this.tap._children[i]._children[0].visible = true;
            } else {
                this.tap._children[i]._children[0].visible = false;
            }
        }
    }

    /**list中设置id最小并且可以领取的成就顶置显示
     * 如果没有可以领取的奖励，那么把当前正在进行的成就放在第一个位置
    */
    getStick() {
        // 刷新数据后才能得到点击后的新数据
        this.achievementBtn.getComponent(AchievementButton).onEnable();
        // “可领取未领取”的id数组
        let canReach_B_Arr = this.achievementBtn.getComponent(AchievementButton).canReach_B_Arr;
        // 未达成的数组
        let notReachArr = this.achievementBtn.getComponent(AchievementButton).notReachArr;
        // 数据表里面的不同类型数据节点位置,对应的是id-1
        let number0 = this.dataTypeArray[0].length;
        let number1 = this.dataTypeArray[1].length;
        let number2 = this.dataTypeArray[2].length;
        let number3 = this.dataTypeArray[3].length;

        let tapIndex = this.tap.selectedIndex;
        let tweenTime = 0;
        if (tapIndex === 0) {
            if (canReach_B_Arr[0].length !== 0) {
                this.list.tweenTo(canReach_B_Arr[0][0] - 1, tweenTime);
            } else {
                this.list.tweenTo(notReachArr[0][0] - 1, tweenTime);
            }
        } else if (tapIndex === 1) {
            if (canReach_B_Arr[1].length !== 0) {
                this.list.tweenTo(canReach_B_Arr[1][0] - number0 - 1, tweenTime);
            } else {
                this.list.tweenTo(notReachArr[1][0] - number0 - 1, tweenTime);
            }
        } else if (tapIndex === 2) {
            if (canReach_B_Arr[2].length !== 0) {
                this.list.tweenTo(canReach_B_Arr[2][0] - number0 - number1 - 1, tweenTime);
            } else {
                this.list.tweenTo(notReachArr[2][0] - number0 - number1 - 1, tweenTime);
            }
        } else if (tapIndex === 3) {
            if (canReach_B_Arr[3].length !== 0) {
                this.list.tweenTo(canReach_B_Arr[3][0] - number0 - number1 - number2 - 1, tweenTime);
            } else {
                this.list.tweenTo(notReachArr[3][0] - number0 - number1 - number2 - 1, tweenTime);
            }
        }
    }

    /**拿到还可以领取奖励的id
     * @param id 带入id即可返回“可领取未领取”，“已领取”，“未达成”三个状态 */
    stateJudgement(id): any {
        // 刷新数据后才能得到点击后的新数据
        this.achievementBtn.getComponent(AchievementButton).onEnable();
        // “可领取未领取”的id数组
        let canReach_B_Arr = this.achievementBtn.getComponent(AchievementButton).canReach_B_Arr;
        // "未达成"的id数组
        let notReachArr = this.achievementBtn.getComponent(AchievementButton).notReachArr;
        //数据表
        let indexData = FixedDataTables.getInstance().getData(Data.DataType.achievement);
        // 值记录
        let getState = null;
        let tap = null;
        let object: object = {};
        // “可领取未领取”
        // 把传进来的成就分别在四个组中对比,因为他是唯一的，所以只能在一个组里面找到
        // 当找到了“可领取未领取”的这个成就后，就会给这个tap页添加红点提示
        for (let i = 0; i < canReach_B_Arr.length; i++) {
            for (let j = 0; j < canReach_B_Arr[i].length; j++) {
                if (canReach_B_Arr[i][j] === id) {
                    getState = 'reachButton';
                }
            }
        }

        //“未达成”
        if (getState === null) {
            for (let k = 0; k < notReachArr.length; k++) {
                for (let l = 0; l < notReachArr[k].length; l++) {
                    if (notReachArr[k][l] === id) {
                        getState = 'notReach';
                    }
                }
            }
        }

        //“已经领取”
        if (getState === null) {
            getState = 'getComplete';
            object = {
                getState: 'getComplete',
                tap: null,
            }
        }
        return getState;
    }

    /**成就栏初始化*/
    listInit(): void {
        this.list.scrollBar.hide = true;//使用但隐藏滚动条
        this.list.scrollBar.elasticBackTime = 200;//设置橡皮筋回弹时间。单位为毫秒。
        this.list.scrollBar.elasticDistance = 50;//设置橡皮筋极限距离。
        this.list.selectEnable = true;//设置可选
        this.listAssignment();//刷新
        this.list.selectHandler = new Laya.Handler(this, this.onSelect_List);
        this.list.renderHandler = new Laya.Handler(this, this.updateItem);
    }

    /**list赋值规则*/
    listAssignment() {
        let indexData = FixedDataTables.getInstance().getData(Data.DataType.achievement);//数据表
        let tapIndex = this.tap.selectedIndex;//tap当前位置
        // 赋值
        var data: Array<object> = [];
        for (const key in indexData) {
            if (indexData.hasOwnProperty(key)) {
                const element = indexData[key];
                if (element.type === tapIndex + 1) {
                    // 计算最高值，显示百分比
                    let highest;
                    // 当前击杀值
                    let intIPos;
                    // 类型值
                    if (tapIndex === 0) {
                        intIPos = this.achieve.battleTopNum;
                    } else if (tapIndex === 1) {
                        intIPos = this.achieve.killTopNum;
                    } else if (tapIndex === 2) {
                        intIPos = this.achieve.endlessTopScore;
                    } else if (tapIndex === 3) {
                        intIPos = this.achieve.unlockTopNum;
                    }
                    // 如果当前成就达成了，那么显示为（100/100）这种格式
                    if (intIPos >= element.value) {
                        intIPos = element.value;
                    }
                    // 如果是可以领取的id那么getState状态为'reachButton';
                    data.push({
                        //描述
                        describe: element.dec + '(' + intIPos + '/' + element.value + ')',
                        //钻石数量
                        diamondsNumber: element.diamond,
                        //领取状态
                        getState: this.stateJudgement(element.id),
                        // 当前tap
                        tapIndex: tapIndex + 1,
                        // id:
                        id: element.id,
                    });
                }
            }
        }
        this.list.array = data;
    }

    /**box信息对应list赋值信息*/
    updateItem(cell: Laya.Box, index: number): void {
        cell.name = ('item' + index).toString();
        //描述
        let describeLabel = cell.getChildByName('describeLabel') as Laya.Label;
        describeLabel.text = this.list.array[index].describe;
        //奖励钻石数量Label
        let diamondsNumber = cell.getChildByName('diamondsNumber ') as Laya.FontClip;
        diamondsNumber.value = this.list.array[index].diamondsNumber;
        //领取状态
        this.getState = this.list.array[index].getState;
        //已经领取
        let reach = cell.getChildByName('reach') as Laya.Sprite;
        //没有达成
        let notReach = cell.getChildByName('notReach') as Laya.Sprite;
        //领取按钮
        let reachButton = cell.getChildByName('reachButton') as Laya.Button;
        // 黄色底板
        let baseboard = cell.getChildByName('baseboard') as Laya.Button;
        // 蓝色底板
        let blueBaseboard = cell.getChildByName('blueBaseboard') as Laya.Button;
        if (this.getState === 'reachButton') {
            //可领取
            reachButton.visible = true;
            reach.visible = false;
            notReach.visible = false;
            baseboard.visible = true;
            blueBaseboard.visible = false;
        } else if (this.getState === 'notReach') {
            //未达成不可领取
            reachButton.visible = false;
            reach.visible = false;
            notReach.visible = true;
            baseboard.visible = true;
            blueBaseboard.visible = false;
        } else if (this.getState === 'getComplete') {
            //已经领取过了
            reachButton.visible = false;
            reach.visible = true;
            notReach.visible = false;
            baseboard.visible = false;
            blueBaseboard.visible = true;
        }
    }
    /**当前触摸的box监听*/
    onSelect_List(index: number): void {
        // console.log("当前选择的索引：" + index);
    }

    closeButtonClick(): void {
        // 关闭按钮大小
        this.startScale = this.closeButton.scaleX;
        this.closeButton.on(Laya.Event.MOUSE_DOWN, this, this.closeButtonDOWN);
        this.closeButton.on(Laya.Event.MOUSE_MOVE, this, this.closeButtonMOVE);
        this.closeButton.on(Laya.Event.MOUSE_UP, this, this.closeButtonUP);
        this.closeButton.on(Laya.Event.MOUSE_OUT, this, this.closeButtonOUT);
    }
    /**按下缩小*/
    closeButtonDOWN(): void {
        Music.getInstance().playSound(musicToUrl.button_normal);
        this.closeButton.scale(this.startScale, this.startScale);
    }
    /**移动时缩小*/
    closeButtonMOVE(): void {
        this.closeButton.scale(0.9 * this.startScale, 0.9 * this.startScale);
    }

    /**抬起大小还原打开场景*/
    closeButtonUP(): void {
        this.closeButton.scale(this.startScale, this.startScale);

        //内容先消失
        Laya.Tween.to(this.contentSet, { x: -800, Y: 0 }, 100, Laya.Ease.circIn, Laya.Handler.create(this, function () {
            Laya.Scene.close('test/Achievement_dialog.scene', 'Achievement_dialog');
        }, []), 0);

        //黑色背景延时消失
        Laya.Tween.to(this.background, { alpha: 1 }, 100, Laya.Ease.circIn, Laya.Handler.create(this, function () {
        }, []), 50);
    }

    /**出屏幕大小还原*/
    closeButtonOUT(): void {
        this.closeButton.scale(this.startScale, this.startScale);
    }

    onDestroy() {
        console.error("成就销毁的界面~~~");
        const urls = ["commonPic/黑色遮罩.png", "changtaitiaohuang.png", "dangqianwnajitiaolan.png", "diban.png", "微信图片_20191127175348.png"];
        PlayingSceneControl.instance.clearResUrl(urls, true);
    }
}