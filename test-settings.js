#!/usr/bin/env node

// 测试settings.json配置格式
const SettingsSetup = require('./lib/settings-setup');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing settings.json configuration...');

// 创建临时测试目录
const testDir = '/tmp/claude-test';
if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
}

const hooksDir = path.join(testDir, 'hooks');
if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
}

// 创建测试hook文件
const hookPath = path.join(hooksDir, 'auto-commit-hook.js');
fs.writeFileSync(hookPath, '// Test hook file');

async function runTests() {
try {
    // 测试1: 空settings.json
    console.log('\n📝 Test 1: Empty settings.json');
    const settingsSetup1 = new SettingsSetup(testDir);
    await settingsSetup1.setup();
    
    const settings1 = JSON.parse(fs.readFileSync(path.join(testDir, 'settings.json'), 'utf8'));
    console.log('Generated settings:', JSON.stringify(settings1.hooks, null, 2));
    
    // 测试2: 已有Stop hooks的settings.json
    console.log('\n📝 Test 2: Existing Stop hooks');
    const existingSettings = {
        hooks: {
            Stop: [
                {
                    hooks: [
                        {
                            type: "command",
                            command: "echo 'existing hook'"
                        }
                    ]
                }
            ]
        }
    };
    
    fs.writeFileSync(path.join(testDir, 'settings.json'), JSON.stringify(existingSettings, null, 2));
    
    const settingsSetup2 = new SettingsSetup(testDir);
    await settingsSetup2.setup();
    
    const settings2 = JSON.parse(fs.readFileSync(path.join(testDir, 'settings.json'), 'utf8'));
    console.log('Updated settings:', JSON.stringify(settings2.hooks, null, 2));
    console.log('Number of Stop hooks:', settings2.hooks.Stop.length);
    
    // 测试3: 验证设置
    console.log('\n📝 Test 3: Validation');
    const isValid = settingsSetup2.validateSettings();
    console.log('Validation result:', isValid ? '✅ Valid' : '❌ Invalid');
    
    console.log('\n🎉 All tests completed!');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
} finally {
    // 清理测试文件
    fs.rmSync(testDir, { recursive: true, force: true });
}
}

runTests();