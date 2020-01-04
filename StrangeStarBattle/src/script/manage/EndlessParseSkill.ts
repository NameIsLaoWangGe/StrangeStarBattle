import Data from "../Data/JsonEnum";
import Data2 from "../Data/DataTables"
import FixedDataTables = Data2.FixedDataTables;
import { tools } from "../Tools/Tool";
import getRandomArrayElements = tools.getRandomArrayElements;
import PlayingControl from "../playing/PlayingSceneControl";
import MainWeaponData from "./MainWeaponData";
import role from "../role/role";
import SkeletonTempletManage from "./SkeletonTempletManage";
interface endless_skill {
    i
    name;
    dec;
    icon;
    rate;   //100 触发概率
    value1; //小怪数值
    value2;         //boss数值
    immunity1;      //小怪受到技能效果后免疫该技能时间（秒）
    immunity2;      //boss受到技能效果后免疫该技能时间（秒）
    limit;      //可叠加的上限
}
export default class EndlessParseSkill {
    private static _instance: EndlessParseSkill;
    private tableConfig: any;
    //当前拥有的技能以及叠加次数
    private _skills_endless: any;
    private _skillsByDate: Array<number>;
    constructor() {
        this._skills_endless = {};
        this.parseSkillTable();
    }
    public static getInstance() {
        if (!this._instance) {
            this._instance = new EndlessParseSkill();
        }
        return this._instance;
    }
    parseSkillTable() {
        this.tableConfig = FixedDataTables.getInstance().getData(Data.DataType.endless_skill);
    }
    /**
     * 
     * @param id 
     * 是否达到上限
     */
    isSkillCap(id: number) {
        const num = this.skills_endless[id];
        if (num && num >= this.tableConfig[id].limit) {
            return true;
        }
        return false;
    }
    addNewSkill(id: number) {
        if (!this.isSkillCap(id)) {
            this.setSkills_endless(id);
            this.skillTakeEffect(Number(id));
            const roleStatuSkills = [6, 7, 8];
            if (roleStatuSkills.indexOf(Number(id)) > -1) {
                this.setSkillEffect(Number(id));
            }
        }
    }
    skillTakeEffect(skillId: number) {
        switch (skillId) {
            case 1:
                //增加了最大血量
                const bate = 0.01 * this.getSkillNum(skillId);
                let addHpNum = bate * MainWeaponData.getInstance().getRoleHp();
                addHpNum = Math.floor(addHpNum);
                PlayingControl.instance.roleTotal = addHpNum + MainWeaponData.getInstance().getRoleHp();
                PlayingControl.instance.roleHp += addHpNum;
                if (PlayingControl.instance.roleHp > PlayingControl.instance.roleTotal) {
                    PlayingControl.instance.roleHp = PlayingControl.instance.roleTotal;
                }
                role.instance.setRoleHp(0);
                break;
            case 3:
                //更新子弹 创建的速度
                PlayingControl.instance.setSpeedByEndless(this.getSkillNum(skillId));
                break;
            case 5:
                //更新无敌的持续时间
                role.instance.updateWuDiKeepTime();
                break;
            case 18:
                //超强回复
                const recoverBeta = 0.01 * this.getSkillNum(skillId);
                const recoverHp = PlayingControl.instance.roleTotal * recoverBeta;
                role.instance.setRoleHp(-recoverHp);
                this.setSkillEffect(18);
                break;
            default:
                break;
        }
    }
    get skills_endless(): any {
        return this._skills_endless;
    }
    get skillsByDate(): any {
        if (!this._skillsByDate) {
            this._skillsByDate = [];
        }
        return this._skillsByDate;
    }
    setSkills_endless(value: number) {
        if (this._skills_endless[value]) {
            this._skills_endless[value]++;
        } else {
            this._skills_endless[value] = 1;
        }
        this._skillsByDate === (void 0) && (this._skillsByDate = []);
        this._skillsByDate.push(value)
    }
    /**
     * 
     * @param id 
     * @param attackObjectType 攻击对象的类型 boss smallEnemy
     */
    getSkillNum(id: number, attackObjectType?: string): any {
        if (!this.skills_endless[id]) {
            return false;
        }
        const skillLevel = this.skills_endless[id] - 1;
        let value = null;
        if (attackObjectType && attackObjectType === "boss") {
            value = this.tableConfig[id].value2;
        } else {
            value = this.tableConfig[id].value1;
        }
        if (typeof (value) === "string") {
            value = value.split("|");
        }
        switch (id) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 10:
            case 13:
            case 15:
            case 16:
            case 18:
            case 19:
                value = Number(value[1]) * skillLevel + Number(value[0]);
                break;
            case 9:
                const dropHpBate = Number(value[3]) * skillLevel + Number(value[2]);
                value = [Number(value[0]), Number(value[1]), dropHpBate];
                break;
            case 11:
            case 12:
                const hurtPercent = Number(value[1]) * skillLevel + Number(value[0]);
                value = [hurtPercent, Number(value[2])];
                break;
            case 14:
                //爆头 只对小怪生效
                value = this.tableConfig[id].rate;
                break;
            case 17:
                const fireValue = Number(value[2]) * skillLevel + Number(value[1]);
                value = [Number(value[0]), fireValue];
                break;
            default:
                break;
        }
        return value;
    }
    /**
     * 
     * @param id 
     * 技能的触发概率
     */
    getSkillProbability(id: number) {
        return this.tableConfig[id].rate;
    }
    /**
     * 
     * @param id 
     * @param attackObjectType      现在攻击对象的类型 boss smallEnemy
     * 得到免疫的数据
     */
    getImmunityData(id: number, attackObjectType?: string) {
        if (attackObjectType && attackObjectType === "boss") {
            return Number(this.tableConfig[id].immunity2);
        } else {
            return Number(this.tableConfig[id].immunity1);
        }
    }

    /**
     * getRandomUpgradeSkills
     */
    getRandomUpgradeSkills(): any {
        let idArr = Object.keys(this.tableConfig);
        let i;
        for (i in this.skills_endless) {
            const inIndex = idArr.indexOf(i);
            if (inIndex > -1 && this.isSkillCap(Number(i))) {
                idArr.splice(inIndex, 1);
            }
        }
        if (idArr.length) {
            if (idArr.length > 3) {
                const rateArr = this.getRateArr(idArr);
                const tempArr = tools.getArrayDifElements(rateArr, 3);
                return tempArr.map((item) => { return Number(item) });
            } else {
                return idArr.map((item) => { return Number(item) });
            }
        } else {
            return false;
        }
    }
    getRateArr(idArr: Array<string>) {
        let tempArr = [];
        let i: number = 0;
        for (i; i < idArr.length; i++) {
            const skillId = idArr[i];
            const rateNum = Number(this.tableConfig[skillId].rate);
            let j: number = 0;
            for (j; j < rateNum; j++) {
                tempArr.push(skillId);
            }
        }
        return tempArr;
    }
    /**
     * 
     * @param id 
     * 技能被升级过
     */
    isUpgraded(id: number) {
        return this.skills_endless[id];
    }
    /**
     * 
     * @param id 
     * 通过id获得sk name
     */
    getEffectNameById(id: number): string {
        const config = this.tableConfig[id];
        if (!config || config.effect == -1) {
            return config[11].effect;
        }
        return config.effect;
    }
    /**
     * 
     * @param skillId 技能的id
     * @param parent 
     * 设置技能的特效
     */
    setSkillEffect(skillId, parent?: Laya.Sprite, pos?: any) {
        const effectName: string = this.tableConfig[skillId].effect;
        const templets = SkeletonTempletManage.getInstance().templets;
        let skObj: Laya.Skeleton;
        if (templets[effectName]) {
            skObj = Laya.Pool.getItemByCreateFun("effectName", () => {
                return (templets[effectName] as Laya.Templet).buildArmature(0);
            }, this);
            skObj.name = effectName;
            if (!parent) {
                parent = PlayingControl.instance.roleObj;
            }
            switch (skillId) {
                case 6:
                case 7:
                case 8:
                case 17:
                    //终极防御
                    skObj.play(0, true);
                    skObj.pos(parent.width / 2, parent.height / 2);
                    parent.addChild(skObj);
                    break;
                case 9:
                    skObj.on(Laya.Event.STOPPED, this, this.playFinshCallBack, [skObj, skillId]);
                    var obj = parent["vars_"].propertyObj;
                    skObj.pos(obj.mark_w / 2, obj.mark_h / 2);

                    skObj.play("bz", false);
                    parent.addChild(skObj);
                    break;
                case 10:
                    if (parent.getChildByName(effectName)) {
                        skObj.play("hit", false);
                        skObj.visible = true;
                    } else {
                        skObj.on(Laya.Event.STOPPED, this, this.playFinshCallBack, [skObj, skillId]);
                        var obj = parent["vars_"].propertyObj;
                        skObj.pos(obj.mark_w / 2, obj.mark_h / 2);
                        skObj.play("hit", false);
                        parent.addChild(skObj);
                    }
                    break;
                case 11:
                    //爆炸输出
                    skObj.on(Laya.Event.STOPPED, this, this.playFinshCallBack, [skObj, skillId]);
                    var obj = parent["vars_"].propertyObj;
                    skObj.pos(parent.x + obj.mark_w / 2, parent.y + obj.mark_h / 2);
                    skObj.play(0, false);
                    Laya.stage.addChild(skObj);
                    break;
                case 12:
                    //冰缓
                    skObj.on(Laya.Event.STOPPED, this, this.playFinshCallBack, [skObj, skillId]);
                    var obj = parent["vars_"].propertyObj;
                    skObj.pos(obj.mark_w / 2, obj.mark_h / 2);
                    skObj.play("bdxg", true);
                    parent.addChild(skObj);
                    break;
                case 14:
                    skObj.on(Laya.Event.STOPPED, this, this.playFinshCallBack, [skObj, skillId]);
                    skObj.pos(pos.x, pos.y);
                    skObj.play(0, false);
                    PlayingControl.instance.effectParent.addChild(skObj);
                    break;
                case 18:
                case 15:
                    skObj.on(Laya.Event.STOPPED, this, this.playFinshCallBack, [skObj, skillId]);
                    skObj.pos(parent.width / 2, parent.height / 2);
                    skObj.play(0, false);
                    parent.addChild(skObj);
                    break;
                default:
                    break;
            }
        }
    }
    playFinshCallBack(skObj: Laya.Skeleton, skillId: number) {
        switch (skillId) {
            case 9:
            case 12:
                skObj.visible = false;
                break;
            case 10:
                skObj.play("dcp", true);
                break;
            default:
                skObj.removeSelf();
                Laya.Pool.recover(skObj.name, skObj);
                break;
        }

    }
    cancalSkillEffect(skillId, parent?: Laya.Sprite) {
        const effectName: string = this.getEffectNameById(skillId);
        if (parent && parent.getChildByName(effectName)) {
            const obj = parent.removeChildByName(effectName);
            Laya.Pool.recover(effectName, obj);
        }
    }
    getSkillEffectIds(): Array<string> {
        const arr: Array<string> = [];
        let i: string;
        for (i in this.tableConfig) {
            const skName = this.tableConfig[i].effect;
            if (skName == -1) {
                continue;
            }
            arr.push(skName);
        }
        return arr;
    }
    deleteSkill() {
        EndlessParseSkill._instance = null;
    }
}