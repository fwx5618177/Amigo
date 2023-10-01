import { Command } from 'commander';
import { version } from '../../package.json';
import Main from './services/main';

const program = new Command();
const main = new Main();

program.addHelpText('beforeAll', `It's a framework for robot.`);

program
    .usage('<command> [options]')
    .description('An enhanced CLI for resume template parsing and processing.');

program.version(version, '-v, --version', 'Amigo CLI version').name('amigo bot');

// run bot
program
    .command('run')
    .description('Run the bot')
    .action(() => {
        main.execute('run');
    });

// init new plugin
program
    .command('init <name>')
    .description('Initialize a new package')
    .action(name => {
        console.log('Initializing new package:', name);
    });

program
    .command('add-plugin <name>')
    .description('Add a new plugin')
    .action(name => {
        console.log('Adding new plugin:', name);
        // 调用相关逻辑
    });

// Parse program arguments or show help by default
const args = process.argv;
if (args.length <= 2) {
    program.outputHelp(); // Show help if no arguments
    process.exit();
}

program.parse(process.argv);
