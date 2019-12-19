import toast from "../manage/toast";
module HttpModel {
    export enum errorCode {
        OK = 0,
        Error = -1,
        ParamError = -2,
        HasNotLoginYet = -3,
        ReLogin = -4,
        FixedTableError = -5,
        Repeated = -6,
        NoEnough = -7,
        FullLevel = -8,
        UserDataError = -9,
        TryLockFailed = -10, //需要隔时间重试
    }
    export class HttpError {
        private readonly ERRORCODE: errorCode;
        constructor(error: errorCode, pare?: any, back?: Laya.Handler) {
            this.ERRORCODE = error;
            this.handerError(error, pare, back);
        }
        handerError(error: errorCode, parent?: any, back?: Laya.Handler) {
            let toastText: string;
            switch (error) {
                case errorCode.Error:
                    toastText = "发生错误,请刷新游戏!";
                    break;
                case errorCode.ParamError:
                    toastText = "参数错误!";
                    break;
                case errorCode.HasNotLoginYet:
                    toastText = "未登录!"
                    break;
                case errorCode.ReLogin:
                    toastText = "在其它设备登录!"
                    break;
                case errorCode.FixedTableError:
                    toastText = "数据表错误!";
                    break;
                case errorCode.Repeated:
                    toastText = "今天已经签过了哦~！"
                    break;
                case errorCode.FullLevel:
                    toastText = "已达满级~！"
                    break;
                case errorCode.UserDataError:
                    toastText = "用户数据错误!";
                    break;
                case errorCode.TryLockFailed:
                    toastText = "发生异常，请重试！";
                    break;
                default:
                    break;
            }
            toastText && toast.noBindScript(toastText, parent);
            back && back.run();
        }
    }
}
export default HttpModel;
