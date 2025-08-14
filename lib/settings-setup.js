const fs = require('fs');
const path = require('path');

class SettingsSetup {
    constructor(claudeDir) {
        this.claudeDir = claudeDir;
        this.settingsPath = path.join(claudeDir, 'settings.json');
    }

    /**
     * 设置settings.json配置
     */
    async setup() {
        console.log('⚙️  Setting up settings.json...');

        let settings = {};

        // 如果已存在settings.json，先读取
        if (fs.existsSync(this.settingsPath)) {
            try {
                const existingContent = fs.readFileSync(this.settingsPath, 'utf8');
                settings = JSON.parse(existingContent);
                console.log('📖 Found existing settings.json');
            } catch (error) {
                console.log('⚠️  Existing settings.json is invalid, creating new one');
                settings = {};
            }
        }

        // 合并新的hook配置
        this.mergeHookSettings(settings);

        // 写入配置文件
        fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2));
        
        console.log(`✅ Settings updated: ${this.settingsPath}`);
    }

    /**
     * 合并hook相关设置
     */
    mergeHookSettings(settings) {
        // 确保hooks对象存在
        if (!settings.hooks) {
            settings.hooks = {};
        }

        // 确保Stop hooks数组存在
        if (!settings.hooks.Stop) {
            settings.hooks.Stop = [];
        }

        // 检查是否已存在我们的hook配置
        const hookCommand = "node ~/.claude/hooks/auto-commit-hook.js";
        const existingHookIndex = settings.hooks.Stop.findIndex(stopHook => {
            return stopHook.hooks && stopHook.hooks.some(hook => 
                hook.type === "command" && hook.command === hookCommand
            );
        });

        if (existingHookIndex === -1) {
            // 如果不存在，添加新的hook配置
            const newHookConfig = {
                hooks: [
                    {
                        type: "command",
                        command: hookCommand
                    }
                ]
            };
            settings.hooks.Stop.push(newHookConfig);
            console.log('🔗 Added auto-commit hook to Stop hooks');
        } else {
            console.log('✅ Auto-commit hook already configured');
        }

        // 设置其他推荐配置
        if (!settings.editor) {
            settings.editor = {};
        }

        // 推荐的编辑器设置
        settings.editor.auto_save = true;
        settings.editor.format_on_save = true;

        // Git相关设置
        if (!settings.git) {
            settings.git = {};
        }

        settings.git.auto_commit = true;
        settings.git.commit_on_stop = true;

        // 其他有用的设置
        if (!settings.ui) {
            settings.ui = {};
        }

        settings.ui.show_token_count = true;
        settings.ui.confirm_before_exit = false;

        // 日志设置
        if (!settings.logging) {
            settings.logging = {};
        }

        settings.logging.level = "info";
        settings.logging.enable_hooks_logging = true;

        console.log('📝 Added recommended Claude Code settings');
    }

    /**
     * 备份现有设置文件
     */
    backupExistingSettings() {
        if (fs.existsSync(this.settingsPath)) {
            const backupPath = `${this.settingsPath}.backup.${Date.now()}`;
            fs.copyFileSync(this.settingsPath, backupPath);
            console.log(`💾 Backed up existing settings to: ${backupPath}`);
            return backupPath;
        }
        return null;
    }

    /**
     * 验证设置文件
     */
    validateSettings() {
        try {
            if (!fs.existsSync(this.settingsPath)) {
                throw new Error('Settings file does not exist');
            }

            const content = fs.readFileSync(this.settingsPath, 'utf8');
            const settings = JSON.parse(content);

            // 验证必要的配置
            if (!settings.hooks || !settings.hooks.Stop || !Array.isArray(settings.hooks.Stop)) {
                throw new Error('Stop hooks not configured properly');
            }

            // 检查是否有我们的hook配置
            const hookCommand = "node ~/.claude/hooks/auto-commit-hook.js";
            const hasOurHook = settings.hooks.Stop.some(stopHook => {
                return stopHook.hooks && stopHook.hooks.some(hook => 
                    hook.type === "command" && hook.command === hookCommand
                );
            });

            if (!hasOurHook) {
                throw new Error('Auto-commit hook not found in Stop hooks');
            }

            // 验证hook文件是否存在
            const hookPath = path.join(this.claudeDir, 'hooks', 'auto-commit-hook.js');
            if (!fs.existsSync(hookPath)) {
                throw new Error(`Hook file not found: ${hookPath}`);
            }

            console.log('✅ Settings validation passed');
            return true;
        } catch (error) {
            console.error('❌ Settings validation failed:', error.message);
            return false;
        }
    }
}

module.exports = SettingsSetup;