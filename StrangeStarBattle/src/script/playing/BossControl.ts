import BossObject from "../role/BossObject"
/**
 * 准备废弃  boss脚本类准备和enemy通用
 */
export default class BossControl extends Laya.Script {
    private self: Laya.Sprite;
    private propertyObj: BossObject;
    constructor() { super() };
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        if (!this.self["vars_"]) {
            console.error("propertyObj需要查看 错误", this.self["vars_"])
        }
        this.propertyObj = this.self["vars_"].propertyObj;
    }
    onTriggerEnter(other: any, self: any): void {
        const prefabType: string = other.owner["vars_"] && other.owner["vars_"].prefabType;
        if (prefabType && prefabType === "enemy") {
            return;
        }
        let otherB = other.owner as Laya.Sprite;
        let selfE = self.owner as Laya.Sprite;

    }
    onDisable(): void {

    }
}