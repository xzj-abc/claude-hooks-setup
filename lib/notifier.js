const os = require('os');

class ClaudeNotifier {
    constructor() {
        this.platform = os.platform();
    }

    /**
     * 发送系统通知
     * @param {string} title - 通知标题
     * @param {string} message - 通知内容
     * @param {object} options - 额外选项
     */
    async notify(title, message, options = {}) {
        try {
            if (this.platform === 'darwin') {
                // macOS 使用 node-mac-notifier
                await this.notifyMac(title, message, options);
            } else if (this.platform === 'win32') {
                // Windows 使用原生方式
                await this.notifyWindows(title, message, options);
            } else {
                // Linux 使用 notify-send
                await this.notifyLinux(title, message, options);
            }
        } catch (error) {
            console.warn('⚠️ Notification failed:', error.message);
            // 通知失败不应该阻止主要功能
        }
    }

    /**
     * macOS 通知
     */
    async notifyMac(title, message, options) {
        try {
            const notifier = require('node-mac-notifier');
            
            await notifier({
                bundleId: 'com.anthropic.claude',
                title: title,
                subtitle: options.subtitle || '',
                message: message,
                sound: options.sound || 'default',
                icon: options.icon || null,
                timeout: options.timeout || 5
            });
        } catch (error) {
            // 如果 node-mac-notifier 失败，尝试使用系统 osascript
            const { exec } = require('child_process');
            const escapedTitle = title.replace(/"/g, '\\"');
            const escapedMessage = message.replace(/"/g, '\\"');
            
            exec(`osascript -e 'display notification "${escapedMessage}" with title "${escapedTitle}"'`, 
                (error) => {
                    if (error) {
                        console.warn('⚠️ macOS notification fallback failed:', error.message);
                    }
                }
            );
        }
    }

    /**
     * Windows 通知
     */
    async notifyWindows(title, message, options) {
        const { exec } = require('child_process');
        
        // 使用 PowerShell 显示 Windows 10/11 原生通知
        const powershellScript = `
            Add-Type -AssemblyName System.Windows.Forms
            $notification = New-Object System.Windows.Forms.NotifyIcon
            $notification.Icon = [System.Drawing.SystemIcons]::Information
            $notification.BalloonTipTitle = "${title}"
            $notification.BalloonTipText = "${message}"
            $notification.Visible = $true
            $notification.ShowBalloonTip(${options.timeout || 5000})
            Start-Sleep -Seconds ${Math.ceil((options.timeout || 5000) / 1000)}
            $notification.Dispose()
        `;
        
        exec(`powershell -Command "${powershellScript.replace(/\n/g, '; ')}"`, 
            (error) => {
                if (error) {
                    console.warn('⚠️ Windows notification failed:', error.message);
                }
            }
        );
    }

    /**
     * Linux 通知
     */
    async notifyLinux(title, message, options) {
        const { exec } = require('child_process');
        
        // 使用 notify-send (大部分 Linux 发行版都有)
        exec(`notify-send "${title}" "${message}" --expire-time=${options.timeout || 5000}`, 
            (error) => {
                if (error) {
                    console.warn('⚠️ Linux notification failed:', error.message);
                }
            }
        );
    }

    /**
     * 发送 Git 提交成功通知
     */
    async notifyCommitSuccess(commitMessage, repoName) {
        const shortMessage = commitMessage.length > 50 
            ? commitMessage.substring(0, 47) + '...' 
            : commitMessage;

        await this.notify(
            '🎉 Claude 自动提交成功',
            `${repoName ? `[${repoName}] ` : ''}${shortMessage}`,
            {
                subtitle: 'Git commit completed',
                sound: 'default',
                timeout: 4000
            }
        );
    }

    /**
     * 发送错误通知
     */
    async notifyError(errorMessage, context = '') {
        await this.notify(
            '❌ Claude Hook 错误',
            `${context ? `${context}: ` : ''}${errorMessage}`,
            {
                subtitle: 'Hook execution failed',
                sound: 'default',
                timeout: 6000
            }
        );
    }

    /**
     * 发送信息通知
     */
    async notifyInfo(message, title = '💡 Claude 信息') {
        await this.notify(
            title,
            message,
            {
                sound: 'default',
                timeout: 3000
            }
        );
    }
}

module.exports = ClaudeNotifier;