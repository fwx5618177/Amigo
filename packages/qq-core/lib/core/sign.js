"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiQQVer = exports.submitSsoPacket = exports.requestSignToken = exports.getSign = exports.getT544 = void 0;
const axios_1 = __importDefault(require("axios"));
const base_client_1 = require("./base-client");
const constants_1 = require("./constants");
const device_1 = require("./device");
async function getT544(cmd) {
    let sign = constants_1.BUF0;
    if (!this.sig.sign_api_addr) {
        return sign;
    }
    if (this.apk.qua) {
        const time = Date.now();
        const post_params = {
            ver: this.apk.ver,
            uin: this.uin,
            data: cmd,
            guid: this.device.guid.toString('hex'),
            version: this.apk.sdkver,
        };
        const url = new URL(this.sig.sign_api_addr);
        let path = url.pathname;
        if (path.substring(path.length - 1) === '/') {
            path += 'energy';
        }
        else {
            path = path.replace(/\/sign$/, '/energy');
        }
        url.pathname = path;
        const data = await get.bind(this)(url.href, post_params, true);
        this.emit('internal.verbose', `getT544 ${cmd} result(${Date.now() - time}ms): ${JSON.stringify(data)}`, base_client_1.VerboseLevel.Debug);
        if (data.code === 0) {
            if (typeof data.data === 'string') {
                sign = Buffer.from(data.data, 'hex');
            }
            else if (typeof data.data?.sign === 'string') {
                sign = Buffer.from(data.data.sign, 'hex');
            }
        }
        else {
            this.emit('internal.verbose', `签名api(energy)异常： ${cmd} result(${Date.now() - time}ms): ${JSON.stringify(data)}`, base_client_1.VerboseLevel.Error);
        }
    }
    return this.generateT544Packet(cmd, sign);
}
exports.getT544 = getT544;
async function getSign(cmd, seq, body) {
    let params = constants_1.BUF0;
    if (!this.sig.sign_api_addr) {
        return params;
    }
    const qImei36 = this.device.qImei36 || this.device.qImei16;
    if (qImei36 && this.apk.qua) {
        const time = Date.now();
        const post_params = {
            ver: this.apk.ver,
            qua: this.apk.qua,
            uin: this.uin,
            cmd: cmd,
            seq: seq,
            androidId: this.device.android_id,
            qimei36: qImei36,
            guid: this.device.guid.toString('hex'),
            buffer: body.toString('hex'),
        };
        const url = new URL(this.sig.sign_api_addr);
        let path = url.pathname;
        if (path.substring(path.length - 1) === '/') {
            path += 'sign';
        }
        url.pathname = path;
        const data = await get.bind(this)(url.href, post_params, true);
        this.emit('internal.verbose', `sign ${cmd} result(${Date.now() - time}ms): ${JSON.stringify(data)}`, base_client_1.VerboseLevel.Debug);
        if (data.code === 0) {
            const Data = data.data || {};
            params = this.generateSignPacket(Data.sign, Data.token, Data.extra);
            const list = Data.ssoPacketList || Data.requestCallback || [];
            if (list.length < 1 && cmd.includes('wtlogin')) {
                this.requestToken();
            }
            else {
                this.ssoPacketListHandler(list);
            }
        }
        else {
            this.emit('internal.verbose', `签名api异常： ${cmd} result(${Date.now() - time}ms): ${JSON.stringify(data)}`, base_client_1.VerboseLevel.Error);
        }
    }
    return params;
}
exports.getSign = getSign;
async function requestSignToken() {
    if (!this.sig.sign_api_addr) {
        return [];
    }
    const qImei36 = this.device.qImei36 || this.device.qImei16;
    if (qImei36 && this.apk.qua) {
        const time = Date.now();
        const post_params = {
            ver: this.apk.ver,
            qua: this.apk.qua,
            uin: this.uin,
            androidId: this.device.android_id,
            qimei36: qImei36,
            guid: this.device.guid.toString('hex'),
        };
        const url = new URL(this.sig.sign_api_addr);
        let path = url.pathname;
        if (path.substring(path.length - 1) === '/') {
            path += 'request_token';
        }
        else {
            path = path.replace(/\/sign$/, '/request_token');
        }
        url.pathname = path;
        const data = await get.bind(this)(url.href, post_params, true);
        this.emit('internal.verbose', `requestSignToken result(${Date.now() - time}ms): ${JSON.stringify(data)}`, base_client_1.VerboseLevel.Debug);
        if (data.code === 0) {
            const ssoPacketList = data.data?.ssoPacketList || data.data?.requestCallback || data.data;
            if (!ssoPacketList || ssoPacketList.length < 1)
                return [];
            return ssoPacketList;
        }
    }
    return [];
}
exports.requestSignToken = requestSignToken;
async function submitSsoPacket(cmd, callbackId, body) {
    if (!this.sig.sign_api_addr) {
        return [];
    }
    const qImei36 = this.device.qImei36 || this.device.qImei16;
    if (qImei36 && this.apk.qua) {
        const time = Date.now();
        const post_params = {
            ver: this.apk.ver,
            qua: this.apk.qua,
            uin: this.uin,
            cmd: cmd,
            callbackId: callbackId,
            androidId: this.device.android_id,
            qimei36: qImei36,
            buffer: body.toString('hex'),
            guid: this.device.guid.toString('hex'),
        };
        const url = new URL(this.sig.sign_api_addr);
        let path = url.pathname;
        if (path.substring(path.length - 1) === '/') {
            path += 'submit';
        }
        else {
            path = path.replace(/\/sign$/, '/submit');
        }
        url.pathname = path;
        const data = await get.bind(this)(url.href, post_params, true);
        this.emit('internal.verbose', `submitSsoPacket result(${Date.now() - time}ms): ${JSON.stringify(data)}`, base_client_1.VerboseLevel.Debug);
        if (data.code === 0) {
            const ssoPacketList = data.data?.ssoPacketList || data.data?.requestCallback || data.data;
            if (!ssoPacketList || ssoPacketList.length < 1)
                return [];
            return ssoPacketList;
        }
    }
    return [];
}
exports.submitSsoPacket = submitSsoPacket;
async function getApiQQVer() {
    let QQVer = this.config.ver;
    if (!this.sig.sign_api_addr) {
        return QQVer;
    }
    const apks = (0, device_1.getApkInfoList)(this.config.platform);
    const packageName = this.apk.id;
    const url = new URL(this.sig.sign_api_addr);
    let path = url.pathname;
    if (path.substring(path.length - 1) === '/') {
        path += 'ver';
    }
    else {
        path = path.replace(/\/sign$/, '/ver');
    }
    url.pathname = path;
    const data = await get.bind(this)(url.href);
    if (data.code === 0) {
        const vers = data?.data[packageName];
        if (vers && vers.length > 0) {
            for (const ver of vers) {
                if (apks.find(val => val.ver === ver)) {
                    QQVer = ver;
                    break;
                }
            }
        }
    }
    return QQVer;
}
exports.getApiQQVer = getApiQQVer;
async function get(url, params = {}, post = false) {
    const config = {
        timeout: 20000,
        headers: {
            'User-Agent': `icqq@${this.pkg.version} (Released on ${this.pkg.upday})`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };
    let data = { code: -1 };
    let num = 0;
    while (data.code == -1 && num < 3) {
        if (num > 0)
            await new Promise(resolve => setTimeout(resolve, 2000));
        num++;
        if (post) {
            data = await axios_1.default
                .post(url, params, config)
                .catch(err => ({ data: { code: -1, msg: err?.message } }));
        }
        else {
            config.params = params;
            data = await axios_1.default
                .get(url, config)
                .catch(err => ({ data: { code: -1, msg: err?.message } }));
        }
        data = data.data;
    }
    return data;
}
