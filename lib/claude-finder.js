const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * 查找Claude Code的.claude目录
 * 支持多种常见位置
 */
class ClaudeFinder {
    constructor() {
        this.possiblePaths = this.generatePossiblePaths();
    }

    /**
     * 生成可能的.claude目录路径
     */
    generatePossiblePaths() {
        const homeDir = os.homedir();
        const platform = os.platform();
        
        const paths = [
            // 用户主目录（最常见）
            path.join(homeDir, '.claude'),
            
            // macOS特有路径
            ...(platform === 'darwin' ? [
                path.join(homeDir, 'Library', 'Application Support', 'Claude'),
                path.join(homeDir, 'Library', 'Application Support', 'claude'),
            ] : []),
            
            // Windows特有路径
            ...(platform === 'win32' ? [
                path.join(process.env.APPDATA || '', 'Claude'),
                path.join(process.env.APPDATA || '', 'claude'),
                path.join(process.env.LOCALAPPDATA || '', 'Claude'),
                path.join(process.env.LOCALAPPDATA || '', 'claude'),
            ] : []),
            
            // Linux特有路径
            ...(platform === 'linux' ? [
                path.join(homeDir, '.config', 'claude'),
                path.join(homeDir, '.local', 'share', 'claude'),
            ] : []),
            
            // 通用备选路径
            path.join(homeDir, '.config', 'Claude'),
            path.join(homeDir, 'claude'),
            path.join(homeDir, 'Claude'),
        ];

        return [...new Set(paths)]; // 去重
    }

    /**
     * 检查目录是否存在且是有效的.claude目录
     */
    isValidClaudeDirectory(dirPath) {
        try {
            if (!fs.existsSync(dirPath)) {
                return false;
            }

            const stat = fs.statSync(dirPath);
            if (!stat.isDirectory()) {
                return false;
            }

            // 检查是否包含Claude特征文件/目录
            const contents = fs.readdirSync(dirPath);
            const hasClaudeFeatures = contents.some(item => 
                item === 'settings.json' || 
                item === 'hooks' ||
                item === 'CLAUDE.md'
            );

            return hasClaudeFeatures;
        } catch (error) {
            return false;
        }
    }

    /**
     * 查找Claude目录
     */
    findClaudeDirectory() {
        // 首先检查环境变量
        const envPath = process.env.CLAUDE_CONFIG_PATH;
        if (envPath && this.isValidClaudeDirectory(envPath)) {
            return envPath;
        }

        // 遍历可能的路径
        for (const possiblePath of this.possiblePaths) {
            if (this.isValidClaudeDirectory(possiblePath)) {
                return possiblePath;
            }
        }

        return null;
    }

    /**
     * 获取或创建Claude目录
     */
    getOrCreateClaudeDirectory() {
        let claudeDir = this.findClaudeDirectory();
        
        if (!claudeDir) {
            // 如果找不到，在用户主目录创建
            const homeDir = os.homedir();
            claudeDir = path.join(homeDir, '.claude');
            
            try {
                if (!fs.existsSync(claudeDir)) {
                    fs.mkdirSync(claudeDir, { recursive: true });
                }
                
                // 创建hooks目录
                const hooksDir = path.join(claudeDir, 'hooks');
                if (!fs.existsSync(hooksDir)) {
                    fs.mkdirSync(hooksDir, { recursive: true });
                }
                
                console.log(`Created Claude directory at: ${claudeDir}`);
            } catch (error) {
                throw new Error(`Failed to create Claude directory: ${error.message}`);
            }
        }

        return claudeDir;
    }

    /**
     * 获取settings.json路径
     */
    getSettingsPath(claudeDir = null) {
        const dir = claudeDir || this.getOrCreateClaudeDirectory();
        return path.join(dir, 'settings.json');
    }

    /**
     * 获取hooks目录路径
     */
    getHooksPath(claudeDir = null) {
        const dir = claudeDir || this.getOrCreateClaudeDirectory();
        return path.join(dir, 'hooks');
    }
}

module.exports = ClaudeFinder;