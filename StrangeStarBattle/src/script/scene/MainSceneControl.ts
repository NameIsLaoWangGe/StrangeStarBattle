import PlayingVar from "../manage/Playing_var"
export default class MainSceneControl extends Laya.Script {
    /** @prop {name:monster, tips:"怪物类型", type:Prefab}*/
    public monster: Laya.Prefab;
    /** @prop {name:bullet, tips:"子弹类型", type:Prefab}*/
    public bullet: Laya.Prefab;
    // 更多参数说明请访问: https://ldc2.layabox.com/doc/?nav=zh-as-2-4-0
    private mainSceneStart: boolean = false;
    private btn_startGame: Laya.Sprite;
    private roleSprite: Laya.Sprite;
    private dragArea: Laya.Rectangle;
    constructor() { super(); }

    onEnable(): void {
        PlayingVar.getInstance().gameStatus = "main";
        this.btn_startGame = this.owner.getChildByName("main_btn_layer") as Laya.Sprite;
        let btnSprite = this.btn_startGame.getChildAt(1) as Laya.Sprite;
        for (var i = 0; i < btnSprite._children.length; i++) {
            btnSprite.getChildAt(i).on(Laya.Event.CLICK, this, this.startGame, [btnSprite.getChildAt(i)]);
        }
        this.roleSprite = this.owner.getChildByName("playingSprite").getChildByName("roleSprite") as Laya.Sprite;
        this.dragArea = new Laya.Rectangle(0, 0, Laya.stage.width, Laya.stage.height - 150 / 2);

    }

    listenDragRole(): void {
        if (!this.dragArea) {
            //拖动区域的限制
            this.dragArea = new Laya.Rectangle(0, 0, Laya.stage.width, Laya.stage.height - 150 / 2);
        }
    }
    onStageMouseDown(): void {
        console.log("场景的点击事件~~~");
        this.roleSprite.startDrag(this.dragArea, true, 50);
    }
    startGame(e: any): void {
        let type: string = e.name;
        if (type === "level_btn") {
            //
            console.log("进入关卡模式:", type);
            PlayingVar.getInstance().gameStatus = "levelModel";

        } else {
            //关卡模式
            console.log("进入无尽模式:", type);
            PlayingVar.getInstance().gameStatus = "farModel";
        }
        this.btn_startGame.visible = false;
        this.mainSceneStart = true;
    }
    onUpdate(): void {
        if (this.mainSceneStart) {

        }
    }
    onDisable(): void {
    }
}