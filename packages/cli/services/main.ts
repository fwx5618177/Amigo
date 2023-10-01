import Login from './login/login';

class Main {
    login = new Login(2409196149, 'fwx5618177');

    public async execute(...args: unknown[]) {
        console.log('args:', args);
        this.login.run();
    }
}

export default Main;
