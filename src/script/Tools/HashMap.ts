//export module tools {

export interface KeyValue<K, V> {
    key: K;
    value: V;
}

/**
 * HashMap泛型实现
 */
export default class HashMap<K, V> {
    // 存储列表
    private _list: KeyValue<K, V>[];
    private _keyList = [];

    constructor() {
        this.clear();
    }

    /**
     * 添加键值
     */
    public add(key: K, value: V): void {
        const data: KeyValue<K, V> = { key: key, value: value };
        // console.log('key = ' + key);
        const index: number = this.getIndexByKey(key);
        if (index !== -1) {
            // 已存在：刷新值
            this._list[index] = data;
        } else {
            // 不存在：添加值
            this._list.push(data);
            this.addKey(key);
        }
    }
    /**
     * 添加键值到键值列表
     */
    private addKey(key: K): void {
        if (this._keyList.indexOf(key) < 0) {
            this._keyList.push(key);
        }
    }

    /**
     * 删除键值
     */
    public remove(key: K): any {
        const index: number = this.getIndexByKey(key);
        if (index !== -1) {
            const data: KeyValue<K, V> = this._list[index];
            this._list.splice(index, 1);
            this.removeKey(key);
            return data;
        }
        return null;
    }

    /**
     * 从键值列表中删除键值
     */
    private removeKey(key: K): void {
        const index = this._keyList.indexOf(key);
        if (index >= 0) {
            this._keyList.splice(index, 1);
        }
    }

    /**
     * 是否存在键
     */
    public has(key: K): boolean {
        const index: number = this.getIndexByKey(key);
        return index !== -1;
    }

    /**
     * 通过key获取键值value
     * @param key
     */
    public get(key: K): V {
        const index: number = this.getIndexByKey(key);
        if (index !== -1) {
            const data: KeyValue<K, V> = this._list[index];
            return data.value;
        }
        return null;
    }

    /**
     * 获取所有值的集合
     */
    public getValueList() {
        const valueList = [];
        this.forEach(function (key, value) {
            valueList.push(value);
        });
        return valueList;
    }

    /**
     * 根据属性获取符合的数值列表
     * @param propetyList 属性列表
     */
    public getVlaueByProperty(propetyList: any) {
        const valueList = [];
        this.forEach(function (key, value, obj) {
            if (obj.judgeObjectProperty(value, propetyList)) {
                valueList.push(value);
            }
        }, this);
        return valueList;
    }

    private judgeObjectProperty(obj, propetyList) {
        const propetyNames = Object.getOwnPropertyNames(propetyList);

        for (let index = 0; index < propetyNames.length; index++) {
            const propName = propetyNames[index];
            if (!this.judgeSingleProperty(obj, propName, propetyList[propName])) {
                return false;
            }
        }

        return true;
    }

    private judgeSingleProperty(obj, proName, proValue) {
        if (!obj.hasOwnProperty(proName) || obj[proName] !== proValue) {
            return false;
        } else {
            return true;
        }
    }
    /**
     * 获取数据个数
     */
    public get length(): number {
        return this._list.length;
    }


    /**
     * 遍历列表，回调(data:KeyValue<K, V>)
     */
    public forEachKeyValue(f: { (data: KeyValue<K, V>): void }) {
        const count: number = this._list.length;
        for (let index = 0; index < count; index++) {
            const element: KeyValue<K, V> = this._list[index];
            f(element);
        }
    }

    /**
     * 遍历列表，回调(K,V)
     */
    public forEach(f: { (key: K, value: V, any?): void }, any?) {
        const count: number = this._list.length;
        for (let index = 0; index < count; index++) {
            const element: KeyValue<K, V> = this._list[index];
            f(element.key, element.value, any);
        }
    }

    // 通过key获取索引
    private getIndexByKey(key: K): number {
        const count: number = this._keyList.indexOf(key);
        return count;
    }

    /**
     * 清空全部
     */
    public clear(): void {
        this._list = [];
        this._keyList = [];
    }
}
//}

//export default tools;