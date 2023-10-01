import { createClient, Client } from '@amigobot/qq-core';

class Login {
    private client: Client;
    private account: number;
    private pwd: string;

    constructor(account: number, pwd: string) {
        console.log('Start Login');
        this.client = createClient({
            platform: 3,
        });
        this.account = account;
        this.pwd = pwd;
    }

    run() {
        this.client.on('system.login.slider', e => {
            console.log('输入滑块地址获取的ticket后继续。\n滑块地址:    ' + e.url);

            console.log('\n请输入滑块ticket:');
            process.stdin.once('data', data => {
                this.client.submitSlider(data.toString().trim());
            });
        });

        this.client.on('system.login.qrcode', () => {
            console.log('扫码完成后回车继续:    ');
            process.stdin.once('data', () => {
                this.client.login();
            });
        });

        this.client.on('system.login.device', e => {
            console.log('请选择验证方式:(1：短信验证   其他：扫码验证)');
            process.stdin.once('data', data => {
                if (data.toString().trim() === '1') {
                    this.client.sendSmsCode();
                    console.log('请输入手机收到的短信验证码:');
                    process.stdin.once('data', res => {
                        this.client.submitSmsCode(res.toString().trim());
                    });
                } else {
                    console.log('扫码完成后回车继续：' + e.url);
                    process.stdin.once('data', () => {
                        this.client.login();
                    });
                }
            });
        });

        this.client.login(this.account, this.pwd);
    }
}

export default Login;
