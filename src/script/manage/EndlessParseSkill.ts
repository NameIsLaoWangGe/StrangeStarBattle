import Data from "../Data/JsonEnum";
import Data2 from "../Data/DataTables"
import FixedDataTables = Data2.FixedDataTables;
import { tools } from "../Tools/Tool";
import getRandomArrayElements = tools.getRandomArrayElements;
import PlayingControl from "../playing/PlayingSceneControl";
import MainWeaponData from "./MainWeaponData";
import role from "../role/role";
interface endless_skill {
    id;
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
            this.skillTakeEffect(id);

        }
    }
    skillTakeEffect(skillId: number) {
        switch (skillId) {
            case 1:
                //增加了最大血量
                const bate = 0.01 * this.getSkillNum(skillId);
                const addHpNum = bate * MainWeaponData.getInstance().getRoleHp();
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
            case 18:
                //超强回复
                const recoverBeta = 0.01 * this.getSkillNum(skillId);
                const recoverHp = PlayingControl.instance.roleTotal * recoverBeta;
                role.instance.setRoleHp(-recoverHp);
                break;
            default:
                break;
        }
    }
    get skills_endless(): any {
        return this._skills_endless;
    }
    get skillsByDate(): any {
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
        let value = null;
        if (attackObjectType && attackObjectType === "boss") {
            value = this.tableConfig[id].value1;
        } else {
            value = this.tableConfig[id].value2;
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
                value = Number(value[1]) * this.skills_endless[id] + Number(value[0]);
                break;
            case 9:
                const dropHpBate = Number(value[3]) * this.skills_endless[id] + Number(value[2]);
                value = [Number(value[0]), Number(value[1]), dropHpBate];
                break;
            case 11:
            case 12:
                const hurtPercent = Number(value[1]) * this.skills_endless[id] + Number(value[0]);
                value = [hurtPercent, Number(value[2])];
                break;
            case 14:
                //爆头 只对小怪生效
                value = this.tableConfig[id].rate;
                break;
            case 17:
                const fireValue = Number(value[2]) * this.skills_endless[id] + Number(value[1]);
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
            return this.tableConfig[id].immunity2;
        } else {
            return this.tableConfig[id].immunity1;
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
                const tempArr = getRandomArrayElements(idArr, 3);
                return tempArr.map((item) => { return Number(item) });
            } else {
                return idArr.map((item) => { return Number(item) });
            }
        } else {
            return false;
        }
    }
    /**
     * 
     * @param id 
     * 技能被升级过
     */
    isUpgraded(id: number) {
        return this.skills_endless[id];
    }
}