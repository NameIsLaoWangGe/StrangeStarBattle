import Data from "../Data/JsonEnum"
import Data2 from "../Data/DataTables"
import Toast from "../manage/toast"
import PlayingControl from "../playing/PlayingSceneControl"
import SkeletonTempletManage from "../manage/SkeletonTempletManage";
import BuffControl from "../playing/BuffControl";

export default class Buffer {
    public readonly buffLastTime: number;
    public readonly time_lost: number;
    public readonly buffId: number;
    public readonly buffValue: any;
    public readonly type: number;
    //创建的间隔
    public readonly speedBate: any;
    //子弹的pic name
    public readonly bullet: string;
    //冷却的图标
    public readonly icon: string;
    //buff的冷却Sprite  (不初始化)
    public buffProgress: Laya.Sprite;
    //buffProgress用到的  Date.now() (不初始化)
    public nowTime: number;
    //buffProgress的计数 用到的 (不初始化)
    public countSecond: number;
    //特殊弹幕用的 （不用初始化）
    public nowTime_otherBuff: number;
    //火力增强弹幕

    public nowTime_fireBuff: any;
    public readonly mark_w: number = 182;
    public readonly mark_h: number = 99;
    private readonly buffConfig: Data.buff;
    private readonly posX: number;
    private readonly posY: number;
    private readonly parent: any;

    constructor(id: number, x: number, y: number, parent?: any) {
        this.buffConfig = Data2.FixedDataTables.getInstance().getData(Data.DataType.buff, id);
        this.buffId = id;
        this.buffValue = this.buffConfig.value;
        this.buffLastTime = this.buffConfig.time;
        this.time_lost = this.buffConfig.time_lost;
        this.type = this.buffConfig.type;
        this.bullet = this.buffConfig.bullet;
        this.icon = this.buffConfig.icon;
        this.posX = x;
        this.posY = y;
        this.parent = parent || Laya.Stage;
        this.speedBate = this.buffConfig.speed;
        this.createBuff();
    }
    createBuff(): void {
        var buffTemplet: Laya.Templet = SkeletonTempletManage.getInstance().templets["buff"];

        const buffSk = Laya.Pool.getItemByCreateFun("buff", () => {
            return buffTemplet.buildArmature(0);
        }, this);
        buffSk.visible && buffSk.addComponent(BuffControl)
        buffSk.play(this.buffConfig.icon_buff, true);
        buffSk["propertyObj"] = this;
        buffSk.pos(this.posX, this.posY);
        PlayingControl.instance.dropBuffParent.addChild(buffSk);
    }
}