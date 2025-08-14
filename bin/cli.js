#!/usr/bin/env node

const ClaudeFinder = require('../lib/claude-finder');
const HooksSetup = require('../lib/hooks-setup');
const SettingsSetup = require('../lib/settings-setup');

async function main() {
    try {
        console.log('🚀 Claude Hooks Setup Tool');
        console.log('==========================');

        // 查找或创建Claude目录
        const finder = new ClaudeFinder();
        const claudeDir = finder.getOrCreateClaudeDirectory();
        
        console.log(`📁 Found Claude directory: ${claudeDir}`);

        // 设置hooks
        const hooksSetup = new HooksSetup(claudeDir);
        await hooksSetup.setup();

        // 设置settings.json
        const settingsSetup = new SettingsSetup(claudeDir);
        await settingsSetup.setup();

        console.log('✅ Setup completed successfully!');
        console.log('');
        console.log('📝 Next steps:');
        console.log('1. Restart Claude Code to load the new configuration');
        console.log('2. Your hooks will automatically trigger on stop events');
        console.log('3. Commit messages will be extracted from your last assistant message');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// 检查命令行参数
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Claude Hooks Setup Tool

Usage:
  claude-hooks-setup [options]

Options:
  --help, -h     Show this help message
  --version, -v  Show version information

Description:
  This tool automatically configures Claude Code with intelligent git hooks
  and settings that enable automatic commit message generation based on
  your assistant interactions.

Features:
  - Automatic git commit with intelligent commit messages
  - Extracts commit messages from Claude assistant responses
  - Configures stop hooks for seamless workflow
  - Cross-platform support (macOS, Windows, Linux)

Example:
  npm install -g claude-hooks-setup
  claude-hooks-setup
`);
    process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
    const packageJson = require('../package.json');
    console.log(packageJson.version);
    process.exit(0);
}

main();