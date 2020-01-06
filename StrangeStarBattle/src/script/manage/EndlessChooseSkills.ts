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
    /**随机到的三个技能的Id*/
    private randomSkills: Array<number>;

    constructor() { super(); }
    onEnable(): void {
        this.numberOfSkills();
        Laya.timer.pause();
    }
    numberOfSkills(): void {
        // 拿到当前随机到的三个技能id，如果为null则不加载这个场景
        this.randomSkills = EndlessParseSkill.getInstance().getRandomUpgradeSkills();
        if (this.randomSkills.length !== 0) {
            this.initScene();
            this.listInit();
        } else {
            return;
        }
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
        this.list.repeatX = 1;
        this.list.repeatY = 3;
        this.list.spaceY = 17;
        //数据表
        this.indexData = FixedDataTables.getInstance().getData(Data.DataType.endless_skill);

        // //黑色先背景出现
        this.background = this.owner.getChildByName('background') as Laya.Sprite;
        this.contentSet.x = -800;

        this.adaptive();
        this.interfaceAppear();
    }

    /**适配策略*/
    adaptive() {
        let background = this.owner.getChildByName('background') as Laya.Sprite;
        let contentSet = this.owner.getChildByName('contentSet') as Laya.Sprite;
        contentSet.y += 10;
        background.height = Laya.stage.height;
        background.width = Laya.stage.width;
        contentSet.y += (Laya.stage.height - 1334) / 2;
    }

    /**出现开关*/
    private appearSwitch: boolean = true;
    /**界面出现动画*/
    interfaceAppear(): void {
        // 内容移动
        if (this.contentSet.x >= 0) {
            this.appearSwitch = false;
            this.pageTurnSwitch = true;
            this.pageTurnTime = Date.now();
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
    interfaceVanish(index): void {
        // 内容移动
        if (this.contentSet.x <= -800) {
            this.contentSet.x = -800;
            Laya.timer.resume();
            Laya.Scene.close('test/skillsToChoose.scene', 'skillsToChoose');
            EndlessManage.getInstance().selectSkillBack(this.list.array[index]["id"]);
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
        const scrollObj = this.list._children[1];
        scrollObj.hide = true;//使用但隐藏滚动条
        scrollObj.touchScrollEnable = false;//禁止触摸滚动
        scrollObj.elasticBackTime = 200;//设置橡皮筋回弹时间。单位为毫秒。
        scrollObj.elasticDistance = 50;//设置橡皮筋极限距离。
        this.listArrayMessage();
        this.list.selectHandler = new Laya.Handler(this, this.onSelect_List);
        this.list.renderHandler = new Laya.Handler(this, this.updateItem);
    }

    /**把数据表中的数据导入list.array中
     * 如果只有2个或者1个那么没有翻页动画
     * 如果大于三个则会有翻页动画*/
    listArrayMessage(): void {
        let data: Array<object> = [];
        // 直接给data导入1~2个数据
        if (this.randomSkills.length >= 1 && this.randomSkills.length < 3) {
            for (const key in this.indexData) {
                if (this.indexData.hasOwnProperty(key)) {
                    const element = this.indexData[key];
                    if (this.randomSkills.length === 1) {
                        if (key === this.randomSkills[0].toString()) {
                            data.push({
                                id: key,
                                icon: element.icon,
                                name: element.name,
                                dec: element.dec,
                                selected: false,
                            });
                        }
                    } else if (this.randomSkills.length === 2) {
                        if (key === this.randomSkills[0].toString() || key === this.randomSkills[1].toString()) {
                            data.push({
                                id: key,
                                icon: element.icon,
                                name: element.name,
                                dec: element.dec,
                                selected: false,
                            });
                        }
                    }
                }
            }
        } else if (this.randomSkills.length >= 3) {
            // 导入信息，并去掉当前随机出来的技能id
            for (const key in this.indexData) {
                if (this.indexData.hasOwnProperty(key)) {
                    const element = this.indexData[key];
                    data.push({
                        id: key,
                        icon: element.icon,
                        name: element.name,
                        dec: element.dec,
                        selected: false,
                    });
                }
            }
            // 删除这三个技能
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < this.randomSkills.length; j++) {
                    if (i < 0) {
                        i = 0;
                    }
                    if (data[i]['id'] === this.randomSkills[j].toString()) {
                        data.splice(i, 1);
                        i--;
                    }
                }
            }
            // 把随机出来的技能放在最前面
            for (let i = 0; i < this.randomSkills.length; i++) {
                let element = FixedDataTables.getInstance().getData(Data.DataType.endless_skill, this.randomSkills[i]);
                data.unshift({
                    id: this.randomSkills[i],
                    icon: element.icon,
                    name: element.name,
                    dec: element.dec,
                    selected: false,
                });
            }
        }
        this.list.array = data;
        this.pageIndex = this.list.array.length - 1;
    }

    /**翻页动画开关*/
    private pageTurnSwitch: boolean = false;
    /**当前索引值*/
    private pageIndex: number;
    /**翻页当前时间*/
    private pageTurnTime: any;
    /**list动画,翻页的时候不可以点击*/
    listAnimation(): void {
        if (this.pageIndex > 0) {
            let nowTime = Date.now();
            if (nowTime - this.pageTurnTime > 40) {
                this.pageTurnTime = nowTime;
                this.list.scrollTo(this.pageIndex);
                this.pageIndex--;
            }
        } else {
            this.list.scrollTo(0);
            this.list.selectEnable = true;
            this.pageTurnSwitch = false;
        }
    }

    /**记录当前触摸的cell*/
    private presentCell: any = null;
    /**记录当前触摸的cell索引值*/
    private presentCellIndex: any = null;
    /**当前触摸的box监听，第一次触摸到任何一个都会关闭场景*/
    onSelect_List(index: number): void {
        // 按钮动画
        let timeLine = new Laya.TimeLine;
        let cell = this.list.getCell(index);
        // 选中显示
        this.list.array[index].selected = true;
        this.list.refresh();
        // 设置不可选
        this.list.selectEnable = false;
        // 播放音乐
        Music.getInstance().playSound(musicToUrl.button_normal);
        this.presentCell = cell;
        this.presentCellIndex = index;
    }

    private vanishSwitch: boolean = false;
    private press: boolean = false;
    /**cell的点击效果*/
    cellClickAni(cell, index): void {
        if (!this.press) {
            cell.scaleX -= 0.03;
            cell.scaleY -= 0.03;
            if (cell.scaleX < 0.9) {
                this.press = true;
            }
        } else {
            if (cell.scaleX > 1) {
                cell.scaleX = 1;
                cell.scaleY = 1;
                this.vanishSwitch = true;
            } else {
                cell.scaleX += 0.05;
                cell.scaleY += 0.05;
            }
        }
    }

    /**box信息对应list赋值信息*/
    updateItem(cell: Laya.Box, index: number): void {
        // icon
        let id = this.list.array[index].id;
        let url = 'endlessMode' + '/' + 'icon_' + id + '.png';
        let icon = cell.getChildByName('icon') as Laya.Sprite;
        icon.loadImage(url);
        // 选中显示
        let baseboard_pitch = cell.getChildByName('baseboard_pitch') as Laya.Sprite;
        let baseboard = cell.getChildByName('baseboard') as Laya.Sprite;
        if (this.list.array[index].selected) {
            baseboard_pitch.visible = true;
            baseboard.visible = false;
        } else {
            baseboard_pitch.visible = false;
            baseboard.visible = true;
        }
        // 名字
        let name = cell.getChildByName('name') as Laya.Label;
        name.text = this.list.array[index].name;
        // 解释
        let describe = cell.getChildByName('describe') as Laya.Label;
        describe.text = this.list.array[index].dec;
    }

    onUpdate(): void {
        // 出现控制
        if (this.appearSwitch) {
            this.interfaceAppear();
        }
        // list翻页动画
        if (this.pageTurnSwitch) {
            this.listAnimation();
        }
        // 消失控制
        // 第一步是按钮动画，第二是场景消失动画
        if (this.presentCell) {
            this.cellClickAni(this.presentCell, this.presentCellIndex);
            if (this.vanishSwitch) {
                this.interfaceVanish(this.presentCellIndex);
            }
        }
    }

    onDisable(): void {
    }
}