import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import Tool from "../Tools/Tool"
import DataType = Data2.DataType;
import FixedDataTables = Data.FixedDataTables;
import Skeleton = Laya.Skeleton;
import EnemyCommon from "./EnemyCommon";

export default class BossObject extends EnemyCommon {
    public enmeySprite;
    constructor(bossId: number) {
        super(bossId);
        this.createBoss();
    }
    createBoss(): void {
        this.enmeySprite = Laya.Pool.getItemByCreateFun(this.nick, this.res.create, this);
        if (!this.enmeySprite.vars_) {
            this.enmeySprite.vars_ = {};
        }
        this.enmeySprite.vars_.propertyObj = this;
        this.enmeySprite.pos(Tool.random(5, Laya.stage.width - this.enmeySprite.width - 5), Tool.random(-50 - this.enmeySprite.height, -5 - this.enmeySprite.height));
    }
    destroyEnemy(): void {
        this.enmeySprite.destroy();
    }
    
}