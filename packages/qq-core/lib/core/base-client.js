"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClient = exports.QrcodeResult = exports.ApiRejection = exports.VerboseLevel = void 0;
const triptrap_1 = require("triptrap");
const crypto_1 = __importStar(require("crypto"));
const stream_1 = require("stream");
const network_1 = __importDefault(require("./network"));
const ecdh_1 = __importDefault(require("./ecdh"));
const writer_1 = __importDefault(require("./writer"));
const tlv = __importStar(require("./tlv"));
const tea = __importStar(require("./tea"));
const pb = __importStar(require("./protobuf"));
const jce = __importStar(require("./jce"));
const constants_1 = require("./constants");
const device_1 = require("./device");
const log4js = __importStar(require("log4js"));
const path = __importStar(require("path"));
const FN_NEXT_SEQ = Symbol('FN_NEXT_SEQ');
const FN_SEND = Symbol('FN_SEND');
const FN_SEND_LOGIN = Symbol('FN_SEND_LOGIN');
const HANDLERS = Symbol('HANDLERS');
const NET = Symbol('NET');
const ECDH = Symbol('ECDH');
const IS_ONLINE = Symbol('IS_ONLINE');
const LOGIN_LOCK = Symbol('LOGIN_LOCK');
const HEARTBEAT = Symbol('HEARTBEAT');
var VerboseLevel;
(function (VerboseLevel) {
    VerboseLevel[VerboseLevel["Fatal"] = 0] = "Fatal";
    VerboseLevel[VerboseLevel["Mark"] = 1] = "Mark";
    VerboseLevel[VerboseLevel["Error"] = 2] = "Error";
    VerboseLevel[VerboseLevel["Warn"] = 3] = "Warn";
    VerboseLevel[VerboseLevel["Info"] = 4] = "Info";
    VerboseLevel[VerboseLevel["Debug"] = 5] = "Debug";
})(VerboseLevel || (exports.VerboseLevel = VerboseLevel = {}));
class ApiRejection {
    constructor(code, message = 'unknown') {
        this.code = code;
        this.message = message;
        this.code = Number(this.code);
        this.message = this.message?.toString() || 'unknown';
    }
}
exports.ApiRejection = ApiRejection;
var QrcodeResult;
(function (QrcodeResult) {
    QrcodeResult[QrcodeResult["OtherError"] = 0] = "OtherError";
    QrcodeResult[QrcodeResult["Timeout"] = 17] = "Timeout";
    QrcodeResult[QrcodeResult["WaitingForScan"] = 48] = "WaitingForScan";
    QrcodeResult[QrcodeResult["WaitingForConfirm"] = 53] = "WaitingForConfirm";
    QrcodeResult[QrcodeResult["Canceled"] = 54] = "Canceled";
})(QrcodeResult || (exports.QrcodeResult = QrcodeResult = {}));
class BaseClient extends triptrap_1.Trapper {
    constructor(p = device_1.Platform.Android, d, config) {
        super();
        this.config = config;
        this[_a] = false;
        this[_b] = false;
        this[_c] = new ecdh_1.default();
        this[_d] = new network_1.default();
        // 回包的回调函数
        this[_e] = new Map();
        this.sig = {
            seq: (0, crypto_1.randomBytes)(4).readUInt32BE() & 0xfff,
            session: (0, crypto_1.randomBytes)(4),
            randkey: (0, crypto_1.randomBytes)(16),
            tgtgt: (0, crypto_1.randomBytes)(16),
            tgt: constants_1.BUF0,
            skey: constants_1.BUF0,
            d2: constants_1.BUF0,
            d2key: constants_1.BUF0,
            t103: constants_1.BUF0,
            t104: constants_1.BUF0,
            t106: constants_1.BUF0,
            t174: constants_1.BUF0,
            qrsig: constants_1.BUF0,
            t543: constants_1.BUF0,
            t546: constants_1.BUF0,
            t547: constants_1.BUF0,
            /** 大数据上传通道 */
            bigdata: {
                ip: '',
                port: 0,
                sig_session: constants_1.BUF0,
                session_key: constants_1.BUF0,
            },
            /** 心跳包 */
            hb480: (() => {
                const buf = Buffer.alloc(9);
                buf.writeUInt32BE(this.uin);
                buf.writeInt32BE(0x19e39, 5);
                return pb.encode({
                    1: 1152,
                    2: 9,
                    4: buf,
                });
            })(),
            /** 上次cookie刷新时间 */
            emp_time: 0,
            time_diff: 0,
            requestTokenTime: 0,
        };
        this.pkg = require('../../package.json');
        this.pskey = {};
        this.pt4token = {};
        /** 心跳间隔(秒) */
        this.interval = 60;
        /** 随心跳一起触发的函数，可以随意设定 */
        this.heartbeat = constants_1.NOOP;
        /** 数据统计 */
        this.statistics = {
            start_time: (0, constants_1.timestamp)(),
            lost_times: 0,
            recv_pkt_cnt: 0,
            sent_pkt_cnt: 0,
            lost_pkt_cnt: 0,
            recv_msg_cnt: 0,
            sent_msg_cnt: 0,
            msg_cnt_per_min: 0,
            remote_ip: '',
            sign_api_addr: '',
            sign_api_init: false,
            remote_port: 0,
        };
        this.signLoginCmd = ['wtlogin.login', 'wtlogin.exchange_emp'];
        this.signCmd = [
            'MessageSvc.PbSendMsg',
            'trpc.o3.ecdh_access.EcdhAccess.SsoEstablishShareKey',
            'trpc.o3.ecdh_access.EcdhAccess.SsoSecureA2Establish',
            'trpc.o3.ecdh_access.EcdhAccess.SsoSecureA2Access',
        ];
        this.ssoPacketList = [];
        if (config.log_config)
            log4js.configure(config.log_config);
        this.apk = (0, device_1.getApkInfo)(p, config.ver);
        this.device = new device_1.Device(this.apk, d);
        this[NET].on('error', err => this.emit('internal.verbose', err.message, VerboseLevel.Error));
        this[NET].on('close', () => {
            this.statistics.remote_ip = '';
            this.statistics.remote_port = 0;
            this[NET].remoteAddress &&
                this.emit('internal.verbose', `${this[NET].remoteAddress}:${this[NET].remotePort} closed`, VerboseLevel.Mark);
        });
        this[NET].on('connect2', () => {
            this.statistics.remote_ip = this[NET].remoteAddress;
            this.statistics.remote_port = this[NET].remotePort;
            this.emit('internal.verbose', `${this[NET].remoteAddress}:${this[NET].remotePort} connected`, VerboseLevel.Mark);
            syncTimeDiff.call(this);
        });
        this[NET].on('packet', packetListener.bind(this));
        this[NET].on('lost', lostListener.bind(this));
        this.on('internal.online', onlineListener);
        this.on('internal.sso', ssoListener);
        Object.defineProperty(this, 'apk', { writable: false });
        (0, constants_1.lock)(this, 'device');
        (0, constants_1.lock)(this, 'sig');
        (0, constants_1.lock)(this, 'pskey');
        (0, constants_1.lock)(this, 'pt4token');
        (0, constants_1.lock)(this, 'statistics');
        (0, constants_1.hide)(this, 'heartbeat');
        (0, constants_1.hide)(this, 'interval');
    }
    /** 设置连接服务器，不设置则自动搜索 */
    setRemoteServer(host, port) {
        if (host && port) {
            this[NET].host = host;
            this[NET].port = port;
            this[NET].auto_search = false;
        }
        else {
            this[NET].auto_search = true;
        }
    }
    async setSignServer(addr) {
        if (!addr)
            return;
        (0, constants_1.unlock)(this, 'sig');
        this.sig.sign_api_init = false;
        if (!/http(s)?:\/\//.test(addr))
            addr = `http://${addr}`;
        this.sig.sign_api_addr = addr;
        const url = new URL(this.sig.sign_api_addr);
        let module;
        if (url.searchParams.get('key')) {
            module = await Promise.resolve().then(() => __importStar(require('./qsign')));
        }
        else {
            module = await Promise.resolve().then(() => __importStar(require('./sign')));
        }
        this.getApiQQVer = module.getApiQQVer.bind(this);
        this.getT544 = module.getT544.bind(this);
        this.getSign = module.getSign.bind(this);
        this.requestSignToken = module.requestSignToken.bind(this);
        this.submitSsoPacket = module.submitSsoPacket.bind(this);
        this.sig.sign_api_init = true;
        (0, constants_1.lock)(this, 'sig');
    }
    on(matcher, listener) {
        return this.trap(matcher, listener);
    }
    once(matcher, listener) {
        return this.trapOnce(matcher, listener);
    }
    off(matcher) {
        return this.offTrap(matcher);
    }
    emit(matcher, ...args) {
        return this.trip(matcher, ...args);
    }
    /** 是否为在线状态 (可以收发业务包的状态) */
    isOnline() {
        return this[IS_ONLINE];
    }
    async switchQQVer(ver = '') {
        if (this.config.sign_api_addr && !this.sig.sign_api_init) {
            await this.setSignServer(this.config.sign_api_addr);
        }
        if (this.config.ver)
            return false;
        const old_ver = this.config.ver;
        this.config.ver = !ver ? await this.getApiQQVer() : ver;
        if (old_ver != this.config.ver) {
            const new_apk = (0, device_1.getApkInfo)(this.config.platform, this.config.ver);
            if (new_apk.ver === this.config.ver) {
                Object.defineProperty(this, 'apk', { writable: true });
                this.apk = new_apk;
                Object.defineProperty(this, 'apk', { writable: false });
                this.device.apk = this.apk;
                return true;
            }
        }
        return false;
    }
    async getApiQQVer() {
        return this.config.ver;
    }
    async getT544(cmd) {
        return this.generateT544Packet(cmd, constants_1.BUF0);
    }
    async getSign(cmd, seq, body) {
        return constants_1.BUF0;
    }
    generateT544Packet(cmd, sign) {
        const t = tlv.getPacker(this);
        const getLocalT544 = (cmd) => {
            switch (cmd) {
                case '810_2':
                    return t(0x544, 0, 2);
                case '810_7':
                    return t(0x544, 0, 7);
                case '810_9':
                    return t(0x544, 2, 9);
            }
            return constants_1.BUF0;
        };
        if (!sign || sign.length < 1) {
            return getLocalT544(cmd);
        }
        return t(0x544, -1, -1, sign);
    }
    generateSignPacket(sign, token, extra) {
        if (!sign) {
            return constants_1.BUF0;
        }
        const qImei36 = this.device.qImei36 || this.device.qImei16;
        const pbdata = {
            9: 1,
            12: qImei36,
            14: 0,
            16: this.uin,
            18: 0,
            19: 1,
            20: 1,
            21: 0,
            24: {
                1: Buffer.from(sign, 'hex'),
                2: Buffer.from(token, 'hex'),
                3: Buffer.from(extra, 'hex'),
            },
            28: 3,
        };
        return Buffer.from(pb.encode(pbdata));
    }
    async ssoPacketListHandler(list) {
        const handle = (list) => {
            const new_list = [];
            for (const val of list) {
                try {
                    const data = pb.decode(Buffer.from(val.body, 'hex'));
                    val.type = data[1].toString();
                }
                catch (err) { }
                new_list.push(val);
            }
            return new_list;
        };
        if (list === null && this.isOnline()) {
            if (this.ssoPacketList.length > 0) {
                list = this.ssoPacketList;
                this.ssoPacketList = [];
            }
        }
        if (!list || !list.length)
            return;
        if (!this.isOnline()) {
            list = handle(list);
            if (this.ssoPacketList.length > 0) {
                const list1 = this.ssoPacketList;
                this.ssoPacketList = [];
                for (const val of list) {
                    const ssoPacket = list1.find((data) => {
                        return data.cmd === val.cmd && data.type === val.type;
                    });
                    if (ssoPacket) {
                        ssoPacket.body = val.body;
                    }
                    else {
                        list1.push(val);
                    }
                }
            }
            else {
                this.ssoPacketList = this.ssoPacketList.concat(list);
            }
            return;
        }
        for (const ssoPacket of list) {
            const cmd = ssoPacket.cmd;
            const body = Buffer.from(ssoPacket.body, 'hex');
            const callbackId = ssoPacket.callbackId;
            const payload = await this.sendUni(cmd, body);
            this.emit('internal.verbose', `sendUni ${cmd} result: ${payload.toString('hex')}`, VerboseLevel.Debug);
            if (callbackId > -1) {
                await this.submitSsoPacket(cmd, callbackId, payload);
            }
        }
    }
    async requestToken() {
        if (Date.now() - this.sig.requestTokenTime >= 60 * 60 * 1000) {
            this.sig.requestTokenTime = Date.now();
            const list = await this.requestSignToken();
            await this.ssoPacketListHandler(list);
        }
    }
    async requestSignToken() {
        return [];
    }
    async submitSsoPacket(cmd, callbackId, body) {
        return [];
    }
    calcPoW(data) {
        if (!data || data.length === 0)
            return Buffer.alloc(0);
        const stream = stream_1.Readable.from(data, { objectMode: false });
        const version = stream.read(1).readUInt8();
        const typ = stream.read(1).readUInt8();
        const hashType = stream.read(1).readUInt8();
        let ok = stream.read(1).readUInt8() === 0;
        const maxIndex = stream.read(2).readUInt16BE();
        const reserveBytes = stream.read(2);
        const src = stream.read(stream.read(2).readUInt16BE());
        const tgt = stream.read(stream.read(2).readUInt16BE());
        const cpy = stream.read(stream.read(2).readUInt16BE());
        if (hashType !== 1) {
            this.emit('internal.verbose', `Unsupported tlv546 hash type ${hashType}`, VerboseLevel.Warn);
            return Buffer.alloc(0);
        }
        let inputNum = BigInt('0x' + src.toString('hex'));
        switch (typ) {
            case 1:
                // TODO
                // See https://github.com/mamoe/mirai/blob/cc7f35519ea7cc03518a57dc2ee90d024f63be0e/mirai-core/src/commonMain/kotlin/network/protocol/packet/login/wtlogin/WtLoginExt.kt#L207
                this.emit('internal.verbose', `Unsupported tlv546 algorithm type ${typ}`, VerboseLevel.Warn);
                break;
            case 2:
                // Calc SHA256
                let dst;
                let elp = 0, cnt = 0;
                if (tgt.length === 32) {
                    const start = Date.now();
                    let hash = (0, crypto_1.createHash)('sha256')
                        .update(Buffer.from(inputNum.toString(16).padStart(256, '0'), 'hex'))
                        .digest();
                    while (Buffer.compare(hash, tgt) !== 0) {
                        inputNum++;
                        hash = (0, crypto_1.createHash)('sha256')
                            .update(Buffer.from(inputNum.toString(16).padStart(256, '0'), 'hex'))
                            .digest();
                        cnt++;
                        if (cnt > 6000000) {
                            this.emit('internal.verbose', 'Calculating PoW cost too much time, maybe something wrong', VerboseLevel.Error);
                            throw new Error('Calculating PoW cost too much time, maybe something wrong');
                        }
                    }
                    ok = true;
                    dst = Buffer.from(inputNum.toString(16).padStart(256, '0'), 'hex');
                    elp = Date.now() - start;
                    this.emit('internal.verbose', `Calculating PoW of plus ${cnt} times cost ${elp} ms`, VerboseLevel.Debug);
                }
                if (!ok)
                    return Buffer.alloc(0);
                const body = new writer_1.default()
                    .writeU8(version)
                    .writeU8(typ)
                    .writeU8(hashType)
                    .writeU8(ok ? 1 : 0)
                    .writeU16(maxIndex)
                    .writeBytes(reserveBytes)
                    .writeTlv(src)
                    .writeTlv(tgt)
                    .writeTlv(cpy);
                if (dst)
                    body.writeTlv(dst);
                body.writeU32(elp).writeU32(cnt);
                return body.read();
            default:
                this.emit('internal.verbose', `Unsupported tlv546 algorithm type ${typ}`, VerboseLevel.Warn);
                break;
        }
        return Buffer.alloc(0);
    }
    /** 下线 (keepalive: 是否保持tcp连接) */
    async logout(keepalive = false) {
        await register.call(this, true);
        if (!keepalive && this[NET].connected) {
            this.terminate();
            await new Promise(resolve => this[NET].once('close', resolve));
        }
    }
    /** 关闭连接 */
    terminate() {
        this[IS_ONLINE] = false;
        this[NET].destroy();
    }
    /** 使用接收到的token登录 */
    async tokenLogin(token) {
        if (!this.device.qImei36 || !this.device.qImei16) {
            await this.device.getQIMEI();
        }
        this.sig.session = (0, crypto_1.randomBytes)(4);
        this.sig.randkey = (0, crypto_1.randomBytes)(16);
        this[ECDH] = new ecdh_1.default();
        try {
            const stream = stream_1.Readable.from(token, { objectMode: false });
            this.sig.d2key = stream.read(stream.read(2).readUInt16BE());
            this.sig.d2 = stream.read(stream.read(2).readUInt16BE());
            this.sig.tgt = stream.read(stream.read(2).readUInt16BE());
            this.sig.ticket_key = stream.read(stream.read(2).readUInt16BE());
            this.sig.sig_key = stream.read(stream.read(2).readUInt16BE());
            this.sig.srm_token = stream.read(stream.read(2).readUInt16BE());
            this.sig.tgt = stream.read(stream.read(2).readUInt16BE());
            this.sig.md5Pass = stream.read(stream.read(2).readUInt16BE());
            this.sig.device_token = stream.read(stream.read(2).readUInt16BE());
            try {
                this.sig.t543 = stream.read(stream.read(2).readUInt16BE()) || constants_1.BUF0;
            }
            catch { }
        }
        catch {
            this.emit('internal.verbose', '旧版token于当前版本不兼容，请手动删除token后重新运行', VerboseLevel.Error);
            this.emit('internal.verbose', '若非无法登录，请勿随意升级版本', VerboseLevel.Warn);
            return this.emit('internal.error.login', 123456, `token不兼容`);
        }
        this.sig.tgtgt = (0, constants_1.md5)(this.sig.d2key);
        const t = tlv.getPacker(this);
        const tlv_count = 18;
        const writer = new writer_1.default()
            .writeU16(11)
            .writeU16(tlv_count)
            .writeBytes(t(0x100, 100))
            .writeBytes(t(0x10a))
            .writeBytes(t(0x116))
            .writeBytes(t(0x108))
            .writeBytes(t(0x144))
            //.writeBytes(t(0x112))
            .writeBytes(t(0x143))
            .writeBytes(t(0x142))
            .writeBytes(t(0x154))
            .writeBytes(t(0x18))
            .writeBytes(t(0x141))
            .writeBytes(t(0x8))
            .writeBytes(t(0x147))
            .writeBytes(t(0x177))
            .writeBytes(t(0x187))
            .writeBytes(t(0x188))
            .writeBytes(t(0x194))
            .writeBytes(t(0x511))
            .writeBytes(t(0x202));
        const body = writer.read();
        this[FN_SEND_LOGIN]('wtlogin.exchange_emp', body);
    }
    /**
     * 使用密码登录
     * @param uin 登录账号
     * @param md5pass 密码的md5值
     */
    async passwordLogin(uin, md5pass) {
        if (!this.device.qImei36 || !this.device.qImei16) {
            await this.device.getQIMEI();
        }
        this.uin = uin;
        this.sig.session = (0, crypto_1.randomBytes)(4);
        this.sig.randkey = (0, crypto_1.randomBytes)(16);
        this.sig.tgtgt = (0, crypto_1.randomBytes)(16);
        this[ECDH] = new ecdh_1.default();
        const t = tlv.getPacker(this);
        let tlv_count = this.device.qImei16 ? 25 : 26;
        if (this.apk.ssover < 12)
            tlv_count--;
        const writer = new writer_1.default()
            .writeU16(9)
            .writeU16(tlv_count)
            .writeBytes(t(0x18))
            .writeBytes(t(0x1))
            .writeBytes(t(0x106, md5pass))
            .writeBytes(t(0x116))
            .writeBytes(t(0x100))
            .writeBytes(t(0x107))
            //.writeBytes(t(0x108))
            .writeBytes(t(0x142))
            .writeBytes(t(0x144))
            .writeBytes(t(0x145))
            .writeBytes(t(0x147))
            .writeBytes(t(0x154))
            .writeBytes(t(0x141))
            .writeBytes(t(0x8))
            .writeBytes(t(0x511))
            .writeBytes(t(0x187))
            .writeBytes(t(0x188))
            .writeBytes(t(0x191))
            .writeBytes(t(0x177))
            .writeBytes(t(0x516))
            .writeBytes(t(0x521, 0))
            .writeBytes(t(0x525))
            .writeBytes(t(0x548))
            .writeBytes(t(0x542));
        if (!this.device.qImei16)
            writer.writeBytes(t(0x194));
        if (!this.device.qImei16)
            writer.writeBytes(t(0x202));
        if (this.device.qImei16)
            writer.writeBytes(t(0x545, this.device.qImei16));
        if (this.apk.ssover >= 12) {
            writer.writeBytes(await this.getT544('810_9'));
        }
        this[FN_SEND_LOGIN]('wtlogin.login', writer.read());
    }
    /** 收到滑动验证码后，用于提交滑动验证码 */
    async submitSlider(ticket) {
        try {
            if (this.sig.t546.length)
                this.sig.t547 = this.calcPoW(this.sig.t546);
        }
        catch (err) { }
        ticket = String(ticket).trim();
        const t = tlv.getPacker(this);
        let tlv_count = this.sig.t547.length ? 6 : 5;
        if (this.apk.ssover < 12)
            tlv_count--;
        const writer = new writer_1.default()
            .writeU16(2)
            .writeU16(tlv_count)
            .writeBytes(t(0x193, ticket))
            .writeBytes(t(0x8))
            .writeBytes(t(0x104))
            .writeBytes(t(0x116));
        if (this.sig.t547.length)
            writer.writeBytes(t(0x547));
        if (this.apk.ssover >= 12) {
            writer.writeBytes(await this.getT544('810_2'));
        }
        this[FN_SEND_LOGIN]('wtlogin.login', writer.read());
    }
    /** 收到设备锁验证请求后，用于发短信 */
    async sendSmsCode() {
        const t = tlv.getPacker(this);
        const tlv_count = 6;
        const writer = new writer_1.default()
            .writeU16(8)
            .writeU16(tlv_count)
            .writeBytes(t(0x8))
            .writeBytes(t(0x104))
            .writeBytes(t(0x116))
            .writeBytes(t(0x174))
            .writeBytes(t(0x17a))
            .writeBytes(t(0x197));
        this[FN_SEND_LOGIN]('wtlogin.login', writer.read());
    }
    /** 提交短信验证码 */
    async submitSmsCode(code) {
        code = String(code).trim();
        if (Buffer.byteLength(code) !== 6)
            code = '123456';
        const t = tlv.getPacker(this);
        let tlv_count = 8;
        if (this.apk.ssover < 12)
            tlv_count--;
        const writer = new writer_1.default()
            .writeU16(7)
            .writeU16(tlv_count)
            .writeBytes(t(0x8))
            .writeBytes(t(0x104))
            .writeBytes(t(0x116))
            .writeBytes(t(0x174))
            .writeBytes(t(0x17c, code))
            .writeBytes(t(0x401))
            .writeBytes(t(0x198));
        if (this.apk.ssover >= 12) {
            writer.writeBytes(await this.getT544('810_7'));
        }
        this[FN_SEND_LOGIN]('wtlogin.login', writer.read());
    }
    /** 获取登录二维码 */
    async fetchQrcode() {
        const t = tlv.getPacker(this);
        const body = new writer_1.default()
            .writeU16(0)
            .writeU32(16)
            .writeU64(0)
            .writeU8(8)
            .writeTlv(constants_1.BUF0)
            .writeU16(6)
            .writeBytes(t(0x16))
            .writeBytes(t(0x1b))
            .writeBytes(t(0x1d))
            .writeBytes(t(0x1f))
            .writeBytes(t(0x33))
            .writeBytes(t(0x35, this.apk.device_type))
            .read();
        const pkt = await buildCode2dPacket.call(this, 0x31, 0x11100, body);
        this[FN_SEND](pkt)
            .then(payload => {
            payload = tea.decrypt(payload.slice(16, -1), this[ECDH].share_key);
            const stream = stream_1.Readable.from(payload, { objectMode: false });
            stream.read(54);
            const retcode = stream.read(1)[0];
            const qrsig = stream.read(stream.read(2).readUInt16BE());
            stream.read(2);
            const t = readTlv(stream);
            if (!retcode && t[0x17]) {
                this.sig.qrsig = qrsig;
                this.emit('internal.qrcode', t[0x17]);
            }
            else {
                this.emit('internal.error.qrcode', retcode, '获取二维码失败，请重试');
            }
        })
            .catch(() => this.emit('internal.error.network', -2, 'server is busy'));
    }
    /** 扫码后调用此方法登录 */
    async qrcodeLogin() {
        const { retcode, uin, t106, t16a, t318, tgtgt } = await this.queryQrcodeResult();
        if (retcode < 0) {
            this.emit('internal.error.network', -2, 'server is busy');
        }
        else if (retcode === 0 && t106 && t16a && t318 && tgtgt) {
            if (this.apk.qua != '' && (!this.device.qImei36 || !this.device.qImei16)) {
                await this.device.getQIMEI();
            }
            this.uin = uin;
            this.sig.qrsig = constants_1.BUF0;
            this.sig.tgtgt = tgtgt;
            let tlv_count = this.device.qImei16 ? 24 : 25;
            if (this.apk.ssover < 12)
                tlv_count--;
            const t = tlv.getPacker(this);
            const writer = new writer_1.default()
                .writeU16(9)
                .writeU16(tlv_count)
                .writeBytes(t(0x18))
                .writeBytes(t(0x1))
                .writeU16(0x106)
                .writeTlv(t106)
                .writeBytes(t(0x116))
                .writeBytes(t(0x100))
                .writeBytes(t(0x107))
                .writeBytes(t(0x142))
                .writeBytes(t(0x144))
                .writeBytes(t(0x145))
                .writeBytes(t(0x147))
                .writeBytes(t(0x16a, t16a))
                .writeBytes(t(0x154))
                .writeBytes(t(0x141))
                .writeBytes(t(0x8))
                .writeBytes(t(0x511))
                .writeBytes(t(0x187))
                .writeBytes(t(0x188))
                .writeBytes(t(0x191))
                .writeBytes(t(0x177))
                .writeBytes(t(0x516))
                .writeBytes(t(0x521, this.apk.device_type))
                .writeU16(0x318)
                .writeTlv(t318);
            if (!this.device.qImei16)
                writer.writeBytes(t(0x194));
            if (!this.device.qImei16)
                writer.writeBytes(t(0x202));
            if (this.device.qImei16)
                writer.writeBytes(t(0x545, this.device.qImei16));
            if (this.apk.ssover >= 12) {
                writer.writeBytes(await this.getT544('810_9'));
            }
            this[FN_SEND_LOGIN]('wtlogin.login', writer.read());
        }
        else {
            let message;
            switch (retcode) {
                case QrcodeResult.Timeout:
                    message = '二维码超时，请重新获取';
                    break;
                case QrcodeResult.WaitingForScan:
                    message = '二维码尚未扫描';
                    break;
                case QrcodeResult.WaitingForConfirm:
                    message = '二维码尚未确认';
                    break;
                case QrcodeResult.Canceled:
                    message = '二维码被取消，请重新获取';
                    break;
                default:
                    message = '扫码遇到未知错误，请重新获取';
                    break;
            }
            this.sig.qrsig = constants_1.BUF0;
            this.emit('internal.error.qrcode', retcode, message);
        }
    }
    /** 获取扫码结果(可定时查询，retcode为0则调用qrcodeLogin登录) */
    async queryQrcodeResult() {
        let retcode = -1, uin, t106, t16a, t318, tgtgt;
        if (!this.sig.qrsig.length)
            return { retcode, uin, t106, t16a, t318, tgtgt };
        const body = new writer_1.default()
            .writeU16(5)
            .writeU8(1)
            .writeU32(8)
            .writeU32(16)
            .writeTlv(this.sig.qrsig)
            .writeU64(0)
            .writeU8(8)
            .writeTlv(constants_1.BUF0)
            .writeU16(0)
            .read();
        const pkt = await buildCode2dPacket.call(this, 0x12, 0x6200, body);
        try {
            let payload = await this[FN_SEND](pkt);
            payload = tea.decrypt(payload.slice(16, -1), this[ECDH].share_key);
            const stream = stream_1.Readable.from(payload, { objectMode: false });
            stream.read(48);
            let len = stream.read(2).readUInt16BE();
            if (len > 0) {
                len--;
                if (stream.read(1)[0] === 2) {
                    stream.read(8);
                    len -= 8;
                }
                if (len > 0)
                    stream.read(len);
            }
            stream.read(4);
            retcode = stream.read(1)[0];
            if (retcode === 0) {
                stream.read(4);
                uin = stream.read(4).readUInt32BE();
                stream.read(6);
                const t = readTlv(stream);
                t106 = t[0x18];
                t16a = t[0x19];
                t318 = t[0x65];
                tgtgt = t[0x1e];
            }
        }
        catch { }
        return { retcode, uin, t106, t16a, t318, tgtgt };
    }
    [(_a = IS_ONLINE, _b = LOGIN_LOCK, _c = ECDH, _d = NET, _e = HANDLERS, FN_NEXT_SEQ)]() {
        if (++this.sig.seq >= 0x8000)
            this.sig.seq = 1;
        return this.sig.seq;
    }
    [FN_SEND](pkt, timeout = 5) {
        this.statistics.sent_pkt_cnt++;
        const seq = this.sig.seq;
        return new Promise((resolve, reject) => {
            const id = setTimeout(() => {
                this[HANDLERS].delete(seq);
                this.statistics.lost_pkt_cnt++;
                reject(new ApiRejection(-2, `packet timeout (${seq})`));
            }, timeout * 1000);
            this[NET].join(() => {
                this[NET].write(pkt, () => {
                    this[HANDLERS].set(seq, payload => {
                        clearTimeout(id);
                        this[HANDLERS].delete(seq);
                        resolve(payload);
                    });
                });
            });
        });
    }
    async [FN_SEND_LOGIN](cmd, body) {
        if (this[IS_ONLINE] || this[LOGIN_LOCK])
            return;
        const pkt = await buildLoginPacket.call(this, cmd, body);
        try {
            this[LOGIN_LOCK] = true;
            decodeLoginResponse.call(this, await this[FN_SEND](pkt));
        }
        catch (e) {
            this[LOGIN_LOCK] = false;
            this.emit('internal.error.network', -2, 'server is busy');
            this.emit('internal.verbose', e.message, VerboseLevel.Error);
            this.emit('internal.verbose', e.stack, VerboseLevel.Debug);
        }
    }
    /** 发送一个业务包不等待返回 */
    async writeUni(cmd, body, seq = 0) {
        this.statistics.sent_pkt_cnt++;
        let pkt;
        if (this.signCmd.includes(cmd)) {
            pkt = await buildUniPktSign.call(this, cmd, body, seq);
        }
        else {
            pkt = buildUniPkt.call(this, cmd, body, seq);
        }
        if (pkt.length > 0)
            this[NET].write(pkt);
    }
    /** dont use it if not clear the usage */
    sendOidb(cmd, body, timeout = 5) {
        const sp = cmd //OidbSvc.0x568_22
            .replace('OidbSvc.', '')
            .replace('oidb_', '')
            .split('_');
        const type1 = parseInt(sp[0], 16), type2 = parseInt(sp[1]);
        body = pb.encode({
            1: type1,
            2: isNaN(type2) ? 1 : type2,
            3: 0,
            4: body,
            6: 'android ' + this.apk.ver,
        });
        return this.sendUni(cmd, body, timeout);
    }
    async sendPacket(type, cmd, body) {
        if (type === 'Uni')
            return await this.sendUni(cmd, body);
        else
            return await this.sendOidb(cmd, body);
    }
    /** 发送一个业务包并等待返回 */
    async sendUni(cmd, body, timeout = 5) {
        if (!this[IS_ONLINE])
            throw new ApiRejection(-1, `client not online`);
        let pkt;
        if (this.signCmd.includes(cmd)) {
            pkt = await buildUniPktSign.call(this, cmd, body);
        }
        else {
            pkt = buildUniPkt.call(this, cmd, body);
        }
        if (pkt.length < 1)
            return Buffer.from(pb.encode({
                1: -1,
                2: '签名api异常',
                3: {},
            }));
        return this[FN_SEND](pkt, timeout);
    }
    async sendOidbSvcTrpcTcp(cmd, body) {
        const sp = cmd //OidbSvcTrpcTcp.0xf5b_1
            .replace('OidbSvcTrpcTcp.', '')
            .split('_');
        const type1 = parseInt(sp[0], 16), type2 = parseInt(sp[1]);
        body = pb.encode({
            1: type1,
            2: type2,
            4: body,
            6: 'android ' + this.apk.ver,
        });
        const payload = await this.sendUni(cmd, body);
        //log(payload)
        const rsp = pb.decode(payload);
        if (rsp[3] === 0)
            return rsp[4];
        throw new ApiRejection(rsp[3], rsp[5]);
    }
}
exports.BaseClient = BaseClient;
async function buildUniPktSign(cmd, body, seq = 0) {
    const BodySign = await this.getSign(cmd, this.sig.seq, Buffer.from(body));
    if (BodySign == constants_1.BUF0 && this.sig.sign_api_addr && this.apk.qua)
        return constants_1.BUF0;
    return buildUniPkt.call(this, cmd, body, seq, BodySign);
}
function buildUniPkt(cmd, body, seq = 0, BodySign = constants_1.BUF0) {
    seq = seq || this[FN_NEXT_SEQ]();
    this.emit('internal.verbose', `send:${cmd} seq:${seq}`, VerboseLevel.Debug);
    let len = cmd.length + 20;
    const sso = new writer_1.default()
        .writeWithLength(new writer_1.default()
        .writeWithLength(cmd)
        .writeWithLength(this.sig.session)
        .writeWithLength(BodySign || constants_1.BUF0)
        .read())
        .writeWithLength(body)
        .read();
    const encrypted = tea.encrypt(sso, this.sig.d2key);
    const uin = String(this.uin);
    len = encrypted.length + uin.length + 18;
    const pkt = Buffer.allocUnsafe(len);
    pkt.writeUInt32BE(len, 0);
    pkt.writeUInt32BE(0x0b, 4);
    pkt.writeUInt8(1, 8); //type
    pkt.writeInt32BE(seq, 9);
    pkt.writeUInt8(0, 13);
    pkt.writeUInt32BE(uin.length + 4, 14);
    pkt.fill(uin, 18);
    pkt.fill(encrypted, uin.length + 18);
    return pkt;
}
const EVENT_KICKOFF = Symbol('EVENT_KICKOFF');
function ssoListener(cmd, payload, seq) {
    switch (cmd) {
        case 'StatSvc.ReqMSFOffline':
        case 'MessageSvc.PushForceOffline':
            {
                const nested = jce.decodeWrapper(payload);
                const msg = nested[4] ? `[${nested[4]}]${nested[3]}` : `[${nested[1]}]${nested[2]}`;
                this.emit(EVENT_KICKOFF, msg);
            }
            break;
        case 'QualityTest.PushList':
        case 'OnlinePush.SidTicketExpired':
            this.writeUni(cmd, constants_1.BUF0, seq);
            break;
        case 'ConfigPushSvc.PushReq':
            {
                if (payload[0] === 0)
                    payload = payload.slice(4);
                const nested = jce.decodeWrapper(payload);
                if (nested[1] === 2 && nested[2]) {
                    const buf = jce.decode(nested[2])[5][5];
                    const decoded = pb.decode(buf)[1281];
                    try {
                        this.sig.bigdata.sig_session = decoded[1].toBuffer();
                        this.sig.bigdata.session_key = decoded[2].toBuffer();
                        for (const v of decoded[3]) {
                            if (v[1] === 10) {
                                this.sig.bigdata.port = v[2][0][3];
                                this.sig.bigdata.ip = (0, constants_1.int32ip2str)(v[2][0][2]);
                            }
                        }
                    }
                    catch {
                        this.sig.bigdata.sig_session = Buffer.from('');
                        this.sig.bigdata.session_key = Buffer.from('');
                        this.sig.bigdata.port = 0;
                        this.sig.bigdata.ip = '';
                    }
                }
            }
            break;
    }
}
function onlineListener() {
    if (!this.listeners(EVENT_KICKOFF).length) {
        this.trapOnce(EVENT_KICKOFF, (msg) => {
            this[IS_ONLINE] = false;
            clearInterval(this[HEARTBEAT]);
            this.emit('internal.kickoff', msg);
        });
    }
}
function lostListener() {
    clearInterval(this[HEARTBEAT]);
    if (this[IS_ONLINE]) {
        this[IS_ONLINE] = false;
        this.statistics.lost_times++;
        setTimeout(register.bind(this), 50);
    }
}
async function parseSso(buf) {
    const headlen = buf.readUInt32BE();
    const seq = buf.readInt32BE(4);
    const retcode = buf.readInt32BE(8);
    if (retcode !== 0) {
        this.emit('internal.error.token', retcode);
        throw new Error('unsuccessful retcode: ' + retcode);
    }
    let offset = buf.readUInt32BE(12) + 12;
    let len = buf.readUInt32BE(offset); // length of cmd
    const cmd = String(buf.slice(offset + 4, offset + len));
    offset += len;
    len = buf.readUInt32BE(offset); // length of session_id
    offset += len;
    const flag = buf.readInt32BE(offset);
    let payload;
    if (flag === 0)
        payload = buf.slice(headlen + 4);
    else if (flag === 1)
        payload = await (0, constants_1.unzip)(buf.slice(headlen + 4));
    else if (flag === 8)
        payload = buf.slice(headlen);
    else
        throw new Error('unknown compressed flag: ' + flag);
    return {
        seq,
        cmd,
        payload,
    };
}
async function packetListener(pkt) {
    this.statistics.recv_pkt_cnt++;
    this[LOGIN_LOCK] = false;
    try {
        const flag = pkt.readUInt8(4);
        const encrypted = pkt.slice(pkt.readUInt32BE(6) + 6);
        let decrypted;
        switch (flag) {
            case 0:
                decrypted = encrypted;
                break;
            case 1:
                decrypted = tea.decrypt(encrypted, this.sig.d2key);
                break;
            case 2:
                decrypted = tea.decrypt(encrypted, constants_1.BUF16);
                break;
            default:
                this.emit('internal.error.token');
                throw new Error('unknown flag:' + flag);
        }
        const sso = await parseSso.call(this, decrypted);
        this.emit('internal.verbose', `recv:${sso.cmd} seq:${sso.seq}`, VerboseLevel.Debug);
        if (this[HANDLERS].has(sso.seq))
            this[HANDLERS].get(sso.seq)?.(sso.payload);
        else
            this.emit('internal.sso', sso.cmd, sso.payload, sso.seq);
    }
    catch (e) {
        this.emit('internal.verbose', e, VerboseLevel.Error);
    }
}
async function register(logout = false, reflush = false) {
    this[IS_ONLINE] = false;
    clearInterval(this[HEARTBEAT]);
    let err;
    for (let count = 0; count < 3; count++) {
        err = false;
        const pb_buf = pb.encode({
            1: [
                { 1: 46, 2: (0, constants_1.timestamp)() },
                { 1: 283, 2: 0 },
            ],
        });
        const d = this.device;
        const SvcReqRegister = jce.encodeStruct([
            this.uin,
            logout ? 0 : 7,
            0,
            '',
            logout ? 21 : 11,
            0,
            0,
            0,
            0,
            0,
            logout ? 44 : 0,
            d.version.sdk,
            1,
            '',
            0,
            null,
            d.guid,
            2052,
            0,
            d.model,
            d.model,
            d.version.release,
            1,
            0,
            0,
            null,
            0,
            0,
            '',
            0,
            d.brand,
            d.brand,
            '',
            pb_buf,
            0,
            null,
            0,
            null,
            1000,
            98,
        ]);
        const body = jce.encodeWrapper({ SvcReqRegister }, 'PushService', 'SvcReqRegister');
        const pkt = await buildLoginPacket.call(this, 'StatSvc.register', body, 1);
        try {
            const payload = await this[FN_SEND](pkt, 10);
            if (logout)
                return;
            const rsp = jce.decodeWrapper(payload);
            const result = !!rsp[9];
            if (!result && !reflush) {
                this.emit('internal.error.token');
            }
            else {
                this[IS_ONLINE] = true;
                this[HEARTBEAT] = setInterval(async () => {
                    syncTimeDiff.call(this);
                    if (typeof this.heartbeat === 'function')
                        await this.heartbeat();
                    const heartbeat_cmd = [device_1.Platform.Tim].includes(this.config.platform)
                        ? 'OidbSvc.0x480_9'
                        : 'OidbSvc.0x480_9_IMCore';
                    this.sendUni(heartbeat_cmd, this.sig.hb480)
                        .catch(() => {
                        this.emit('internal.verbose', 'heartbeat timeout', VerboseLevel.Warn);
                        this.sendUni(heartbeat_cmd, this.sig.hb480).catch(() => {
                            this.emit('internal.verbose', 'heartbeat timeout x 2', VerboseLevel.Error);
                            this[NET].destroy();
                        });
                    })
                        .then(async () => {
                        await this[FN_SEND](await buildLoginPacket.call(this, 'Heartbeat.Alive', constants_1.BUF0, 0), 5).catch(() => {
                            this.emit('internal.verbose', 'Heartbeat.Alive timeout', VerboseLevel.Warn);
                        });
                        await refreshToken.bind(this)();
                        this.requestToken();
                    });
                }, this.interval * 1000);
            }
            break;
        }
        catch {
            err = true;
        }
    }
    if (!logout && err)
        this.emit('internal.error.network', -3, 'server is busy(register)');
}
async function syncTimeDiff() {
    const pkt = await buildLoginPacket.call(this, 'Client.CorrectTime', constants_1.BUF4, 0);
    this[FN_SEND](pkt)
        .then(buf => {
        try {
            this.sig.time_diff = buf.readInt32BE() - (0, constants_1.timestamp)();
        }
        catch { }
    })
        .catch(constants_1.NOOP);
}
async function refreshToken() {
    if (!this.isOnline() || (0, constants_1.timestamp)() - this.sig.emp_time < 43000)
        return;
    const t = tlv.getPacker(this);
    const tlv_count = 16;
    const writer = new writer_1.default()
        .writeU16(11)
        .writeU16(tlv_count)
        .writeBytes(t(0x100))
        .writeBytes(t(0x10a))
        .writeBytes(t(0x116))
        .writeBytes(t(0x144))
        .writeBytes(t(0x143))
        .writeBytes(t(0x142))
        .writeBytes(t(0x154))
        .writeBytes(t(0x18))
        .writeBytes(t(0x141))
        .writeBytes(t(0x8))
        .writeBytes(t(0x147))
        .writeBytes(t(0x177))
        .writeBytes(t(0x187))
        .writeBytes(t(0x188))
        .writeBytes(t(0x202))
        .writeBytes(t(0x511));
    const body = writer.read();
    const pkt = await buildLoginPacket.call(this, 'wtlogin.exchange_emp', body);
    try {
        let payload = await this[FN_SEND](pkt);
        payload = tea.decrypt(payload.slice(16, payload.length - 1), this[ECDH].share_key);
        const stream = stream_1.Readable.from(payload, { objectMode: false });
        stream.read(2);
        const type = stream.read(1).readUInt8();
        stream.read(2);
        const t = readTlv(stream);
        this.emit('internal.verbose', 'refresh token type: ' + type, VerboseLevel.Debug);
        if (type === 0) {
            const { token } = decodeT119.call(this, t[0x119]);
            await register.call(this, false, true);
            if (this[IS_ONLINE])
                this.emit('internal.token', token);
        }
    }
    catch (e) {
        this.emit('internal.verbose', 'refresh token error: ' + e?.message, VerboseLevel.Error);
    }
}
function readTlv(r) {
    const t = {};
    while (r.readableLength > 2) {
        const k = r.read(2).readUInt16BE();
        t[k] = r.read(r.read(2).readUInt16BE());
    }
    return t;
}
async function buildLoginPacket(cmd, body, type = 2) {
    var _f;
    this[FN_NEXT_SEQ]();
    this.emit('internal.verbose', `send:${cmd} seq:${this.sig.seq}`, VerboseLevel.Debug);
    let uin = this.uin, cmdid = 0x810, subappid = this.apk.subid;
    if (cmd === 'wtlogin.trans_emp') {
        uin = 0;
        cmdid = 0x812;
        //subappid = getApkInfo(Platform.Watch).subid
    }
    if (type === 2) {
        body = new writer_1.default()
            .writeU8(0x02)
            .writeU8(0x01)
            .writeBytes(this.sig.randkey)
            .writeU16(0x131)
            .writeU16(0x01)
            .writeTlv(this[ECDH].public_key)
            .writeBytes(tea.encrypt(body, this[ECDH].share_key))
            .read();
        body = new writer_1.default()
            .writeU8(0x02)
            .writeU16(29 + body.length) // 1 + 27 + body.length + 1
            .writeU16(8001) // protocol ver
            .writeU16(cmdid) // command id
            .writeU16(1) // const
            .writeU32(uin)
            .writeU8(3) // const
            .writeU8(0x87) // encrypt type 7:0 69:emp 0x87:4
            .writeU8(0) // const
            .writeU32(2) // const
            .writeU32(0) // app client ver
            .writeU32(0) // const
            .writeBytes(body)
            .writeU8(0x03)
            .read();
    }
    let BodySign = constants_1.BUF0;
    if (this.signLoginCmd.includes(cmd)) {
        BodySign = await this.getSign(cmd, this.sig.seq, Buffer.from(body));
    }
    const ksid = ((_f = this.sig).ksid || (_f.ksid = Buffer.from(`|${this.device.imei}|` + this.apk.name)));
    let sso = new writer_1.default()
        .writeWithLength(new writer_1.default()
        .writeU32(this.sig.seq)
        .writeU32(subappid)
        .writeU32(subappid)
        .writeBytes(Buffer.from([
        0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00,
    ]))
        .writeWithLength(this.sig.tgt)
        .writeWithLength(cmd)
        .writeWithLength(this.sig.session)
        .writeWithLength(this.device.imei)
        .writeU32(4)
        .writeU16(ksid.length + 2)
        .writeBytes(ksid)
        .writeWithLength(BodySign)
        .read())
        .writeWithLength(body)
        .read();
    if (type === 1)
        sso = tea.encrypt(sso, this.sig.d2key);
    else if (type === 2)
        sso = tea.encrypt(sso, constants_1.BUF16);
    return new writer_1.default()
        .writeWithLength(new writer_1.default()
        .writeU32(0x0a)
        .writeU8(type)
        .writeWithLength(this.sig.d2)
        .writeU8(0)
        .writeWithLength(String(uin))
        .writeBytes(sso)
        .read())
        .read();
}
function buildCode2dPacket(cmdid, head, body) {
    body = new writer_1.default()
        .writeU32(head)
        .writeU32(0x1000)
        .writeU16(0)
        .writeU32(0x72000000)
        .writeU32((0, constants_1.timestamp)())
        .writeU8(2)
        .writeU16(44 + body.length)
        .writeU16(cmdid)
        .writeBytes(Buffer.alloc(21))
        .writeU8(3)
        .writeU16(0)
        .writeU16(50)
        .writeU32(this.sig.seq + 1)
        .writeU64(0)
        .writeBytes(body)
        .writeU8(3)
        .read();
    return buildLoginPacket.call(this, 'wtlogin.trans_emp', body);
}
function decodeT119(t119) {
    const r = stream_1.Readable.from(tea.decrypt(t119, this.sig.tgtgt), { objectMode: false });
    r.read(2);
    const t = readTlv(r);
    this.sig.t543 = t[0x543] || this.sig.t543;
    this.sig.tgt = t[0x10a] || this.sig.tgt;
    this.sig.tgt_key = t[0x10d] || this.sig.tgt_key;
    this.sig.st_key = t[0x10e] || this.sig.st_key;
    this.sig.t103 = t[0x103] || this.sig.t103;
    this.sig.t106 = t[0x106] || this.sig.t106;
    this.sig.srm_token = t[0x16a] || this.sig.srm_token;
    this.sig.skey = t[0x120] || this.sig.skey;
    this.sig.d2 = t[0x143] || this.sig.d2;
    this.sig.d2key = t[0x305] || this.sig.d2key;
    this.sig.tgtgt = t[0x10c] || (0, constants_1.md5)(this.sig.d2key);
    this.sig.ksid = t[0x108] || Buffer.from(`|${this.device.imei}|` + this.apk.name);
    this.sig.sig_key = t[0x133] || this.sig.sig_key;
    this.sig.ticket_key = t[0x134] || this.sig.ticket_key;
    this.sig.device_token = t[0x322] || this.sig.device_token;
    this.sig.emp_time = (0, constants_1.timestamp)();
    this.uid = this.sig.t543.length > 6 ? this.sig.t543.slice(6).toString() : '';
    if (t[0x512]) {
        const r = stream_1.Readable.from(t[0x512], { objectMode: false });
        let len = r.read(2).readUInt16BE();
        while (len-- > 0) {
            const domain = String(r.read(r.read(2).readUInt16BE()));
            this.pskey[domain] = r.read(r.read(2).readUInt16BE());
            this.pt4token[domain] = r.read(r.read(2).readUInt16BE());
        }
    }
    const token = new writer_1.default()
        .writeTlv(this.sig.d2key)
        .writeTlv(this.sig.d2)
        .writeTlv(this.sig.tgt)
        .writeTlv(this.sig.ticket_key)
        .writeTlv(this.sig.sig_key)
        .writeTlv(this.sig.srm_token || constants_1.BUF0)
        .writeTlv(this.sig.tgt)
        .writeTlv(this.sig.md5Pass || constants_1.BUF0)
        .writeTlv(this.sig.device_token || constants_1.BUF0)
        .writeTlv(this.sig.t543 || constants_1.BUF0)
        .read();
    const age = t[0x11a].slice(2, 3).readUInt8();
    const gender = t[0x11a].slice(3, 4).readUInt8();
    const nickname = String(t[0x11a].slice(5));
    return { token, nickname, gender, age };
}
function decodeLoginResponse(payload) {
    payload = tea.decrypt(payload.slice(16, payload.length - 1), this[ECDH].share_key);
    const r = stream_1.Readable.from(payload, { objectMode: false });
    r.read(2);
    const type = r.read(1).readUInt8();
    r.read(2);
    const t = readTlv(r);
    if (t[0x402]) {
        this.sig.dPwd = crypto_1.default.randomBytes(16);
        this.sig.t402 = t[0x402];
        this.sig.g = (0, constants_1.md5)(Buffer.concat([
            Buffer.concat([Buffer.from(this.device.guid), this.sig.dPwd]),
            this.sig.t402,
        ]));
    }
    if (t[0x546])
        this.sig.t546 = t[0x546];
    if (type === 204) {
        this.sig.t104 = t[0x104];
        this.emit('internal.verbose', 'unlocking...', VerboseLevel.Mark);
        const tt = tlv.getPacker(this);
        const body = new writer_1.default()
            .writeU16(20)
            .writeU16(4)
            .writeBytes(tt(0x8))
            .writeBytes(tt(0x104))
            .writeBytes(tt(0x116))
            .writeBytes(tt(0x401))
            .read();
        return this[FN_SEND_LOGIN]('wtlogin.login', body);
    }
    if (type === 0) {
        this.sig.t104 = constants_1.BUF0;
        this.sig.t174 = constants_1.BUF0;
        if (t[0x403]) {
            this.sig.randomSeed = t[0x403];
        }
        const { token, nickname, gender, age } = decodeT119.call(this, t[0x119]);
        return register.call(this).then(() => {
            if (this[IS_ONLINE]) {
                this.emit('internal.online', token, nickname, gender, age);
                this.ssoPacketListHandler(null);
            }
        });
    }
    if (type === 15 || type === 16) {
        return this.emit('internal.error.token');
    }
    if (type === 2) {
        this.sig.t104 = t[0x104];
        if (t[0x192])
            return this.emit('internal.slider', String(t[0x192]));
        return this.emit('internal.error.login', type, '[登陆失败]未知格式的验证码');
    }
    if (type === 40) {
        return this.emit('internal.error.login', type, '账号被冻结');
    }
    if (type === 160 || type === 162 || type === 239) {
        if (!t[0x204] && !t[0x174])
            return this.emit('internal.verbose', '已向密保手机发送短信验证码', VerboseLevel.Mark);
        let phone = '';
        if (t[0x174] && t[0x178]) {
            this.sig.t104 = t[0x104];
            this.sig.t174 = t[0x174];
            phone = String(t[0x178]).substr(t[0x178].indexOf('\x0b') + 1, 11);
        }
        return this.emit('internal.verify', t[0x204]?.toString() || '', phone);
    }
    if (type === 235) {
        const dir = path.resolve(this.config.data_dir);
        const device_path = path.join(dir, `device.json`);
        //fs.unlink(device_path)
        //this.log('warn',`[${type}]当前设备信息被拉黑，已为您重置设备信息，请重新登录！`)
        return this.emit('internal.error.login', type, `[登陆失败](${type})当前设备信息被拉黑，建议删除"${device_path}"后重新登录！`);
    }
    if (type === 237) {
        return this.emit('internal.error.login', type, `[登陆失败](${type})当前QQ登录频繁，暂时被限制登录，建议更换QQ或稍后再尝试登录！`);
    }
    if (t[0x149]) {
        const stream = stream_1.Readable.from(t[0x149], { objectMode: false });
        stream.read(2);
        const title = stream.read(stream.read(2).readUInt16BE()).toString();
        const content = stream.read(stream.read(2).readUInt16BE()).toString();
        return this.emit('internal.error.login', type, `[${title}]${content}`);
    }
    if (t[0x146]) {
        const stream = stream_1.Readable.from(t[0x146], { objectMode: false });
        const version = stream.read(4);
        const title = stream.read(stream.read(2).readUInt16BE()).toString();
        const content = stream.read(stream.read(2).readUInt16BE()).toString();
        const message = `[${title}]${content}`;
        this.emit('internal.verbose', 'token失效: ' + message + '(错误码：' + type + ')', VerboseLevel.Warn);
        return this.emit('internal.error.login', type, message);
    }
    this.emit('internal.error.login', type, `[登陆失败]未知错误`);
}
