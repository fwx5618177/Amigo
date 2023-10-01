import { Command } from 'commander';
import { version } from '../../package.json';

const program = new Command();

program.addHelpText('beforeAll', `It's a framework for robot.`);

program
    .usage('<command> [options]')
    .description('An enhanced CLI for resume template parsing and processing.');

program
    .version(version, '-v, --version', 'Output the current version of operculum.')
    .name('operculum');

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

program.parse(process.argv);
