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
        (this.getChildByName("icon") as Laya.Sprite).texture = Laya.loader.getRes(this["detailIcon"]);
        (this.getChildByName("icon") as Laya.Sprite).scale(0.8, 0.8);
        (this.getChildByName("describe") as Laya.Label).text = this["detailDec"];
        (this.getChildByName("name") as Laya.Label).text = this["detailName"];
    }
    onDisable() {
        this.visible = false;
        Laya.Pool.recover("ItemDetail", this);
    }
}