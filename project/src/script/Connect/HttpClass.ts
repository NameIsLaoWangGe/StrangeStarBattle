import Toast from "../manage/toast"
module HttpModel {
    export class HttpClass extends Laya.HttpRequest {
        private markUrl: string;
        private getType: string;
        private completeH: Laya.Handler;
        /**
         * 
         * @param compelete 
         * @param markUrl 请求地址
         * @param data 发送的参数
         * @param type 请求的类型 post get
         */
        constructor(compelete: Laya.Handler, markUrl: string, data: string, type?: string) {
            //此处需要设置loading   
            super();
            this.markUrl = markUrl;
            this.getType = type || "post";
            this.completeH = compelete;
            this.http.timeout = 10000;//设置超时时间；
            this.once(Laya.Event.COMPLETE, this, this.completeHandler);
            this.once(Laya.Event.ERROR, this, this.errorHandler);
            this.on(Laya.Event.PROGRESS, this, this.processHandler);
            this.send(this.markUrl, data, this.getType, "json", ["Content-Type", "application/json"]);
        }
        /**
         * 请求完成
         */
        completeHandler(e: any) {
            console.error("返回的数据:", e);
            this.completeH.runWith(e);
        }
        /**
         * 请求发生了错误
         */
        errorHandler(e: any) {
            console.error("requestError:", e);
            Toast.noBindScript("请求发生了错误~");
        }
        /**
         * 进度
         */
        processHandler(e: any) {
            console.error("requestProcess:", e);
        }
    }
}
export default HttpModel;