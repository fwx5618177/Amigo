module.exports = {
    branches: ['master'],
    plugins: [
        '@semantic-release/commit-analyzer', // 解析 commit 信息
        '@semantic-release/release-notes-generator',
        [
            '@semantic-release/changelog',
            {
                changelogFile: 'CHANGELOG.md', // 把发布日志写入该文件
            },
        ],
        '@semantic-release/npm',
        '@semantic-release/github',
        [
            '@semantic-release/git',
            {
                assets: ['CHANGELOG.md', 'package.json'], // 前面说到日志记录和版本号是新增修改的，需要 push 回 Git
            },
        ],
        [
            '@semantic-release/exec',
            {
                publishCmd: './set-version.sh ${nextRelease.version}',
            },
        ],
    ],
}
