const fs = require('fs');
const path = require('path');

class HooksSetup {
    constructor(claudeDir) {
        this.claudeDir = claudeDir;
        this.hooksDir = path.join(claudeDir, 'hooks');
    }

    /**
     * 设置hooks配置
     */
    async setup() {
        console.log('🔧 Setting up hooks...');

        // 确保hooks目录存在
        if (!fs.existsSync(this.hooksDir)) {
            fs.mkdirSync(this.hooksDir, { recursive: true });
        }

        // 写入auto-commit-hook.js
        await this.writeAutoCommitHook();
        
        // 写入notification-hook.js
        await this.writeNotificationHook();
        
        // 复制notifier.js库文件
        await this.copyNotifierLib();

        console.log('✅ Hooks setup completed');
    }

    /**
     * 写入auto-commit hook文件
     */
    async writeAutoCommitHook() {
        const hookPath = path.join(this.hooksDir, 'auto-commit-hook.js');
        const templatePath = path.join(__dirname, '../templates/auto-commit-hook.js');
        
        // 读取模板文件
        const hookContent = fs.readFileSync(templatePath, 'utf8');
        
        // 写入hook文件（覆盖已有文件）
        fs.writeFileSync(hookPath, hookContent);
        
        // 设置执行权限 (Unix系统)
        try {
            fs.chmodSync(hookPath, 0o755);
        } catch (chmodError) {
            // Windows系统可能不支持chmod，忽略错误
        }

        console.log(`📝 Created auto-commit hook: ${hookPath}`);
    }

    /**
     * 写入notification hook文件
     */
    async writeNotificationHook() {
        const hookPath = path.join(this.hooksDir, 'notification-hook.js');
        const templatePath = path.join(__dirname, '../templates/notification-hook.js');
        
        // 读取模板文件
        const hookContent = fs.readFileSync(templatePath, 'utf8');
        
        // 写入hook文件（覆盖已有文件）
        fs.writeFileSync(hookPath, hookContent);
        
        // 设置执行权限 (Unix系统)
        try {
            fs.chmodSync(hookPath, 0o755);
        } catch (chmodError) {
            // Windows系统可能不支持chmod，忽略错误
        }

        console.log(`🔔 Created notification hook: ${hookPath}`);
    }

    /**
     * 复制notifier.js库文件
     */
    async copyNotifierLib() {
        const libPath = path.join(this.hooksDir, 'notifier.js');
        const templatePath = path.join(__dirname, 'notifier.js');
        
        // 读取模板文件
        const libContent = fs.readFileSync(templatePath, 'utf8');
        
        // 写入库文件（覆盖已有文件）
        fs.writeFileSync(libPath, libContent);

        console.log(`📚 Copied notifier library: ${libPath}`);
    }
}

module.exports = HooksSetup;