export default class graphics_Ret extends Laya.Script {
    private drawPos: any;
    private drawWidth: number;
    private drawHeight: number;
    constructor() {
        super();
    }
    onEnable() {
        const parentBtn = (this.owner as Laya.Sprite);
        const retObj = parentBtn.graphics;
        this.drawPos = {};
        this.drawPos.x = parentBtn.x;
        this.drawPos.y = parentBtn.y;
        retObj.drawRect(this.drawPos.x, this.drawPos.y, parentBtn.width, parentBtn.height, "#fc0303");
    }
}