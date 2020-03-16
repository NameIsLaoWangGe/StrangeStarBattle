export module tools {

    export class readZip {
        private instance: JSZip;
        private loadAsyncObj: any;
        constructor() {
            this.instance = new JSZip();
        }
        public getInstance(): JSZip {
            if (this.instance) {
                return this.instance;
            } else {
                console.log("readZip not have instance");
            }
        }
        public loadAsync(zipLoaded: any): any {
            this.loadAsyncObj = this.instance.loadAsync(zipLoaded);
            return this.loadAsyncObj;
        }
        public convertToJson(data: any, key: string): any {
            if (!data.RECORDS) {
                console.log("json数据有问题需要查看~", data);
                return;
            }
            const ret = {};
            data.RECORDS.forEach(pty => {
                ret[pty[key]] = pty;
            });
            return ret;
        }

        public judgeIsZip(lists: any): boolean {
            let listIndex0: string;
            if (lists instanceof Array) {
                listIndex0 = lists[0];
            }
            if (listIndex0.indexOf(".zip") > -1) {
                return true;
            } else {
                return false;
            }
        }

    }
}
export default tools;