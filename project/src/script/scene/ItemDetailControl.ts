import PlayingControl from "../playing/PlayingSceneControl";
export default class ItemDetailControl extends Laya.Image {
    constructor() {
        super();
    };
    onEnable() {
        if (!this["detailName"]) {
            return;
        }
        this.visible = true;
        const iconObj: Laya.Sprite = (this.getChildByName("icon") as Laya.Sprite);
        iconObj.texture = Laya.loader.getRes(this["detailIcon"]);
        iconObj.scale(0.8, 0.8);
        iconObj.x = 135 + 5;
        (this.getChildByName("describe") as Laya.Label).text = this["detailDec"];
        (this.getChildByName("name") as Laya.Label).text = this["detailName"];
    }
    onDisable() {
        this.visible = false;
        Laya.Pool.recover("ItemDetail", this);
    }
}