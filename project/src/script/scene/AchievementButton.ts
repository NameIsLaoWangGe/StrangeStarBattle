import Data2 from "../Data/DataTables";
import FixedDataTables = Data2.FixedDataTables;
import Data from "../Data/JsonEnum";
import PlayingVar from "../manage/Playing_var";
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
export default class ButtonTouchEffect extends Laya.Script {
    /**红点提示*/
    private redDot: Laya.Sprite;
    /**从服务端拉去的成就所有信息*/
    private achieve: any;
    /**成就奖励被领过的信息*/
    private playerAchieve: any;
    /**自己*/
    private self: Laya.Button;
    /**自己当前按钮缩放比例*/
    private startScale: number;
    /**数据表*/
    private indexData: any;
    /**除去已经领取的奖励的成就后，还可以领取却没有领取奖励的id数组*/
    private canReach_B_Arr: any;
    /**未达成成就的id数组*/
    private notReachArr: any;
    constructor() { super() }
    onEnable() {
        this.eventRegistration();
        this.initData();
    }

    /**初始化数据*/
    initData(): void {
        this.achieve = PlayingVar.getInstance().achieve;//成就总信息
        this.playerAchieve = PlayingVar.getInstance().playerAchieve;//成就奖励已经被领取的信息
        this.indexData = FixedDataTables.getInstance().getData(Data.DataType.achievement);//数据表
        this.canReceiveAndeRedDot();
    }

    /**achieve对比数据表,根据类型，返回一个成就达成的数组，数组里面是数据表里面的id
     * @param type 类型,和tap页数据表上面的类型一致1,2,3,4
     * @param notOrCan 计算未达成的还是达成的
     * @param value 成就达成的值，达到这个成就就会push进去reachArray，没有则push进this.notReachArr
     *  */
    contrastTable(type: any, notOrCan: string, value: number): Array<number> {
        let array = [];
        for (const key in this.indexData) {
            if (this.indexData.hasOwnProperty(key)) {
                const element = this.indexData[key];
                if (element.type === type) {
                    if (notOrCan === "reach") {
                        if (value >= element.value) {
                            array.push(element.id);
                        }
                    } else if (notOrCan === "notReach") {
                        if (value < element.value) {
                            array.push(element.id);
                        }
                    }
                }
            }
        }
        return array;
    }

    /**对比成就奖励已经被领过的信息,返回一个可以领取但是还没有领取的id数组
    * @param type 类型
    * @param array 这个类型下的可以领取的id数组
   */
    contrastPlayerAchieve(type, array: Array<number>): Array<number> {
        for (const key in this.playerAchieve[type]) {
            if (this.playerAchieve[type].hasOwnProperty(key)) {
                for (let i = 0; i < array.length; i++) {
                    //领取完成的和成就完成的同时存在则删掉这个id
                    if (Number(key) === array[i]) {
                        array.splice(i, 1);
                    }
                }
            }
        }
        return array;
    }

    /**还有可以领取的奖励的所有id
     * 并且设置红点提示
    */
    canReceiveAndeRedDot(): void {
        this.canReach_B_Arr = [];
        // 不同类型下达成成就的id
        let arr1 = this.contrastTable(1, 'reach', this.achieve.battleTopNum);
        let arr2 = this.contrastTable(2, 'reach', this.achieve.killTopNum);
        let arr3 = this.contrastTable(3, 'reach', this.achieve.endlessTopScore);
        let arr4 = this.contrastTable(4, 'reach', this.achieve.unlockTopNum);
        //不同类型下达成后还有可以领取奖励的id
        let reachArray1 = this.contrastPlayerAchieve(1, arr1);
        let reachArray2 = this.contrastPlayerAchieve(2, arr2);
        let reachArray3 = this.contrastPlayerAchieve(3, arr3);
        let reachArray4 = this.contrastPlayerAchieve(4, arr4);
        // 把可以领却还没有领的id push进同一个数组
        this.canReach_B_Arr.push(reachArray1);
        this.canReach_B_Arr.push(reachArray2);
        this.canReach_B_Arr.push(reachArray3);
        this.canReach_B_Arr.push(reachArray4);

        // 不同类型下，没有达成的成就id
        this.notReachArr = [];
        // 不同类型下达成成就的id
        let notArr1 = this.contrastTable(1, 'notReach', this.achieve.battleTopNum);
        let notArr2 = this.contrastTable(2, 'notReach', this.achieve.killTopNum);
        let notArr3 = this.contrastTable(3, 'notReach', this.achieve.endlessTopScore);
        let notArr4 = this.contrastTable(4, 'notReach', this.achieve.unlockTopNum);
        this.notReachArr.push(notArr1);
        this.notReachArr.push(notArr2);
        this.notReachArr.push(notArr3);
        this.notReachArr.push(notArr4);

        // 设置红点提示
        if (reachArray1.length === 0 && reachArray2.length === 0 && reachArray3.length === 0 && reachArray4.length === 0) {
            this.redDot.visible = false;
        } else {
            this.redDot.visible = true;
        }
    }

    /**成就按钮点初始化*/
    eventRegistration(): void {
        this.self = this.owner as Laya.Button;
        this.startScale = this.self.scaleX;
        this.redDot = this.self.getChildAt(0) as Laya.Sprite;
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.DOWN);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.MOVE);
        this.self.on(Laya.Event.MOUSE_UP, this, this.UP);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.OUT);
    }
    /**按下缩小按钮*/
    DOWN(): void {
        Music.getInstance().playSound(musicToUrl.button_normal);
        this.self.scale(0.9 * this.startScale, 0.9 * this.startScale);
    }
    /**移动时缩小*/
    MOVE(): void {
        this.self.scale(0.9 * this.startScale, 0.9 * this.startScale);
    }
    /**抬起大小还原打开场景*/
    UP(): void {
        this.self.scale(this.startScale, this.startScale);
        Laya.Scene.open('test/Achievement_dialog.scene', null, null, Laya.Handler.create(this, function () {
            console.log('场景打开');
        }, []));
    }
    /**出屏幕大小还原*/
    OUT(): void {
        this.self.scale(this.startScale, this.startScale);
    }
}