import Datas from "./JsonEnum"
import manage from "../manage/LoadManager"
import tools from "../Tools/Tool"
import tool from "../Tools/ReadZip"
import readZip = tool.readZip;
import copydata = tools.copydata;
import zipDataFileList = Datas.zipDataFileList;
import DataType = Datas.DataType;
import JsonDataFileList = Datas.DataJsonUrl;
import FixedDataTablesDir = Datas.url;
import LoadManager = manage.LoadManager;
import LYHandler = Laya.Handler;
import LYLoader = Laya.loader;
module Data {
    export class FixedDataTables {
        // private static readonly dir = `res/data/fixed_tables`;
        private static bLoadData = false;
        private static instance: FixedDataTables;
        private dataCollection = {};
        // 加载固定表的json文件
        public static loadFixedTables(complete?: LYHandler, progress?: LYHandler) {
            const loadFiles = [];
            // 整合需要加载的JSON列表
            /*
                Object.getOwnPropertyNames(JsonDataFileList).forEach(filename => {
                    loadFiles.push(`${JsonDataFileList[filename].file}.json`);
                });
                */
            //zip加入到loadFiles
            for (let i in zipDataFileList) {
                loadFiles.push(i + ".zip");
            }

            LoadManager.Instance().loadAssets(loadFiles, LYHandler.create(this, (e) => {
                FixedDataTables.bLoadData = true;
                FixedDataTables.getInstance(complete, e);
                if (complete) {
                    //complete.runWith(e);
                }
            }), progress);
            FixedDataTables.bLoadData = true;
        }

        public static getInstance(complete?: LYHandler, e?: any) {
            if (!FixedDataTables.instance) {
                FixedDataTables.instance = new FixedDataTables(complete, e);
                //console调试用
                Laya.Browser.window.FixedDataTables = FixedDataTables.instance;
            }
            return FixedDataTables.instance;
        }
        // get data() {
        //     return this.dataCollection;
        // }
        /**
         * 根据id获取对应英雄、装备、道具、技能等详细属性数据
         * @param type      获取的物品类型
         * @param ptyVal    属性检索值
        */
        public getData(type: DataType, ptyVal?: any): any {
            // const fixData = FixedDataTables.getInstance().data;
            switch (type) {
                default:
                    const jsonFile = JsonDataFileList[DataType[type]];
                    if (ptyVal) {
                        return copydata(this.dataCollection[jsonFile.file][ptyVal]);
                    }
                    return copydata(this.dataCollection[jsonFile.file]);
            }
        }

        /**
         * 根据key从json中取值
         * @param type         DataType类型
         * @param ptyVal       key值
         * @param fieldName    属性名称
         */
        public getDataByKey(type: any, ptyVal?: any, fieldName?: any): any {
            const jsonFile = typeof (type) === 'number' ? JsonDataFileList[DataType[type]].file : type;
            const jsons = this.dataCollection;
            if (!jsons || jsons === undefined) {
                return jsons;
            }

            const json = jsons[jsonFile];
            if (!json || ptyVal === undefined) {
                return json;
            }

            const data = json[ptyVal];
            if (!data || fieldName === undefined || jsonFile === 'MazeMap') {
                return data;
            }

            const value = data[fieldName];
            return value;
        }

        /**
         * 从服务器获取固定表信息，类似关卡表
         * @param name  表名称
         * @param id    表里面Key字段
         * @param fieldName  属性名称
         */
        /*
        async getFixedData(name, id, fieldName?) {
            if (!this.dataCollection[name] || !this.dataCollection[name][id]) {
                const msgClient = NSCommunication.MessageClient.getInstance();
                const req = await msgClient.request(MSG.FixedTableInfo_Request, { tableName: name, tableId: id });
                if (req.fixedInfo) {
                    this.cacheServerData(name, id, req.fixedInfo);
                    return this.getDataByKey(name, id, fieldName);
                } else {
                    return null;
                }
            } else {
                return this.getDataByKey(name, id, fieldName);
            }
        }
        */
        private cacheServerData(name, key, dataStr) {
            const dataPrase = JSON.parse(dataStr);
            const objData = {};
            if (name === 'MazeMap') {
                objData[key] = dataPrase;
            } else {
                dataPrase.forEach(element => {
                    const keyName = this.JsonFileKeyName(name);
                    objData[element[keyName]] = element;
                });
            }
            this.dataCollection[name] = objData;
        }

        private JsonFileKeyName(fileName) {
            for (const n in JsonDataFileList) {
                if (JsonDataFileList[n].file === fileName) {
                    return JsonDataFileList[n].key;
                }
            }
        }

        private constructor(complete?: LYHandler, e?: any) {
            if (!FixedDataTables.bLoadData) { // 必须预先加载json文件
                throw new Error(`FixedDataTables haven't loaded data files yet.`);
            }
            let zipObj = new readZip();
            let zIndex = 0;

            zipObj.loadAsync(Laya.loader.getRes(`${FixedDataTablesDir}/${Object.keys(zipDataFileList)[0]}.zip`)).then((data: any) => {
                Object.getOwnPropertyNames(zipDataFileList.jsonZip).forEach(filename => {

                    data.file(`${JsonDataFileList[filename].file}.json`).async("text").then((data_json: string) => {
                        this.dataCollection[JsonDataFileList[filename].file] = zipObj.convertToJson(JSON.parse(data_json), JsonDataFileList[filename].key)
                        zIndex++;

                        if (zIndex >= Object.keys(data.files).length) {
                            if (complete) {
                                Laya.Browser.window.dataCollection = this.dataCollection;
                                complete.runWith(e);
                            }
                        }
                    });
                    //this.dataCollection[JsonDataFileList[filename].file] = zipObj.convertToJson(zipObj.decomposeFiles(`${JsonDataFileList[filename].file}.json`), JsonDataFileList[filename].key)

                })
            });

            /*
            Object.getOwnPropertyNames(JsonDataFileList).forEach(filename => {
                this.dataCollection[JsonDataFileList[filename].file] = this.json2KeyValues(
                    LYLoader.getRes(`${FixedDataTablesDir}/${JsonDataFileList[filename].file}.json`).RECORDS,
                    JsonDataFileList[filename].key);
                LYLoader.clearRes(`${FixedDataTablesDir}/${JsonDataFileList[filename].file}.json`);
            });
	*/
        }
        // 将JSON数组整合成Key:value格式
        private json2KeyValues(jsonPty, keyPty) {
            const ret = {};
            jsonPty.forEach(pty => {
                ret[pty[keyPty]] = pty;
            });
            return ret;
        }

    }
}

export default Data;