#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ClaudeNotifier = require('./notifier.js');

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
        const notifier = new ClaudeNotifier();

        console.log("Notification hook triggered");

        // 提取最后一条助手消息用于通知
        let notificationMessage = "Claude 会话已结束";
        
        if (data && data.transcript_path) {
            try {
                const transcriptContent = fs.readFileSync(data.transcript_path, 'utf8');
                const lines = transcriptContent.split('\n');
                
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
                
                // 提取最后一条助手消息用于通知
                if (assistantMessages.length > 0) {
                    const lastMsg = assistantMessages[assistantMessages.length - 1];
                    let cleanedText = lastMsg.text.replace(/优化完成。?/, "").trim();
                    
                    // 清理多余的逗号和星号，截取前100个字符用于通知
                    cleanedText = cleanedText.replace(/,+/g, ' ').replace(/\*+/g, '').replace(/\s+/g, ' ').trim();
                    
                    if (cleanedText) {
                        // 截取合适长度用于通知显示
                        notificationMessage = cleanedText.length > 100 
                            ? cleanedText.substring(0, 97) + '...' 
                            : cleanedText;
                    }
                }
                
                // 发送通知（只在会话结束时触发）
                if (data && data.stop_hook_active === false) {
                    await notifier.notifyInfo(notificationMessage, "🤖 Claude 会话完成");
                }
                
            } catch (readError) {
                console.warn("读取transcript失败:", readError.message);
                // 发送默认通知
                if (data && data.stop_hook_active === false) {
                    await notifier.notifyInfo("Claude 会话已结束", "🤖 Claude 会话完成");
                }
            }
        } else {
            // 没有transcript_path时，发送默认通知
            if (data && data.stop_hook_active === false) {
                await notifier.notifyInfo("Claude 会话已结束", "🤖 Claude 会话完成");
            }
        }
    } catch (error) {
        console.log("Notification hook error:", error.message);
        // 即使出错也尝试发送基本通知
        try {
            const notifier = new ClaudeNotifier();
            await notifier.notifyInfo("Claude 会话已结束", "🤖 Claude");
        } catch (notifyError) {
            console.warn("通知发送失败:", notifyError.message);
        }
    }
});