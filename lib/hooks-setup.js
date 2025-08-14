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

        // 写入stop-hook-anthropic.js
        await this.writeStopHook();

        console.log('✅ Hooks setup completed');
    }

    /**
     * 写入stop hook文件
     */
    async writeStopHook() {
        const stopHookPath = path.join(this.hooksDir, 'auto-commit-hook.js');
        
        const stopHookContent = `#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

// 读取 stdin 中的 JSON 数据
let inputData = "";

process.stdin.setEncoding("utf8");

process.stdin.on("data", (chunk) => {
    inputData += chunk;
});

process.stdin.on("end", async () => {
    try {
        // 解析 JSON 数据
        const data = JSON.parse(inputData);

        console.log("Stop hook triggered");

        // 提取最后一条助手消息作为提交信息
        let commitMessage = "feat: 自动提交代码变更";
        
        if (data && data.transcript_path) {
            try {
                const transcriptContent = fs.readFileSync(data.transcript_path, 'utf8');
                const lines = transcriptContent.split('\\n');
                
                // 查找所有 assistant 消息
                const assistantMessages = [];
                
                lines.forEach((line, index) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine) {
                        try {
                            const record = JSON.parse(trimmedLine);
                            
                            if (record.type === 'assistant' && 
                                record.message && 
                                record.message.type === 'message' &&
                                record.message.content) {
                                
                                const content = record.message.content;
                                if (Array.isArray(content) && content[0] && content[0].text) {
                                    assistantMessages.push({
                                        text: content[0].text
                                    });
                                }
                            }
                        } catch (parseError) {
                            // 忽略解析错误
                        }
                    }
                });
                
                // 提取最后一条助手消息作为提交信息
                let extractedCommitMessage = null;
                if (assistantMessages.length > 0) {
                    const lastMsg = assistantMessages[assistantMessages.length - 1];
                    let cleanedText = lastMsg.text.replace(/优化完成。?/, "").trim();
                    
                    // 清理多余的逗号和星号
                    cleanedText = cleanedText.replace(/,+/g, ' ').replace(/\\*+/g, '').replace(/\\s+/g, ' ').trim();

                    if (cleanedText) {
                        extractedCommitMessage = \`feat: \${cleanedText}\`;
                    }
                }
                
                // 检查 stop_hook_active 字段，防止重复触发
                if (data && data.stop_hook_active === false) {
                    await checkAndCommitChanges(extractedCommitMessage);
                }
            } catch (readError) {
                // 忽略读取错误，使用默认提交信息
                if (data && data.stop_hook_active === false) {
                    await checkAndCommitChanges(null);
                }
            }
        } else {
            // 没有transcript_path时，仍需检查是否要提交
            if (data && data.stop_hook_active === false) {
                await checkAndCommitChanges(null);
            }
        }
    } catch (error) {
        console.log("Stop");
        console.log(
            "Error parsing JSON data, skipping auto-commit to prevent loops"
        );
    }
});

async function checkAndCommitChanges(extractedCommitMessage) {
    try {
        // 检查是否在git仓库中
        execSync("git rev-parse --git-dir", { encoding: "utf8", stdio: 'ignore' });
        
        // 检查是否有代码变动
        const gitStatus = execSync("git status --porcelain", { encoding: "utf8" });

        if (gitStatus.trim() === "") {
            return; // 无变动，直接返回
        }

        // 使用提取的提交信息或默认信息
        const commitMessage = extractedCommitMessage || "feat: 自动提交代码变更";

        execSync("git add .", { encoding: "utf8" });
        execSync(\`git commit -m "\${commitMessage}" --no-verify\`, { encoding: "utf8" });
        
        console.log("代码提交成功!");
    } catch (error) {
        // 忽略错误（可能不在git仓库中或没有变动）
    }
}
`;

        fs.writeFileSync(stopHookPath, stopHookContent);
        
        // 设置执行权限 (Unix系统)
        try {
            fs.chmodSync(stopHookPath, 0o755);
        } catch (chmodError) {
            // Windows系统可能不支持chmod，忽略错误
        }

        console.log(`📝 Created auto-commit hook: ${stopHookPath}`);
    }
}

module.exports = HooksSetup;