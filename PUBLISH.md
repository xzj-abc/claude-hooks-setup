# 发布指南

## 📦 发布到npm

### 1. 准备发布

```bash
cd /Users/bilibili/.claude/hooks/claude-hooks-setup

# 检查包结构
npm pack --dry-run

# 本地测试
node test-local.js
```

### 2. 登录npm (如果还没有登录)

```bash
npm login
```

### 3. 发布

```bash
# 首次发布
npm publish

# 如果包名被占用，可以使用scoped name
npm publish --access public
```

## 🧪 本地测试全流程

### 1. 本地链接测试

```bash
# 在包目录中
npm link

# 现在可以全局使用
claude-hooks-setup --help
claude-hooks-setup
```

### 2. 测试安装流程

```bash
# 创建测试目录
mkdir /tmp/claude-test
cd /tmp/claude-test

# 模拟从npm安装
npm install -g /Users/bilibili/.claude/hooks/claude-hooks-setup

# 测试命令
claude-hooks-setup
```

### 3. 清理测试

```bash
# 取消全局链接
npm unlink -g claude-hooks-setup

# 或者卸载测试版本
npm uninstall -g claude-hooks-setup
```

## 📝 版本管理

### 更新版本

```bash
# 小更新 (1.0.0 -> 1.0.1)
npm version patch

# 功能更新 (1.0.0 -> 1.1.0)  
npm version minor

# 重大更新 (1.0.0 -> 2.0.0)
npm version major
```

### 推送到git（如果有repo）

```bash
git add .
git commit -m "feat: Claude hooks setup npm package"
git push origin main
git push --tags
```

## 🎯 使用场景

用户使用流程：

```bash
# 1. 全局安装
npm install -g claude-hooks-setup

# 2. 运行配置
claude-hooks-setup

# 3. 重启Claude Code
# 4. 开始享受自动提交功能！
```

## 🔧 包命名建议

如果 `claude-hooks-setup` 被占用，可以考虑：

- `@yourusername/claude-hooks-setup`
- `claude-code-hooks`
- `claude-auto-commit`
- `claude-git-hooks`
- `ai-code-hooks`

## 📊 发布检查清单

- [ ] package.json 信息正确
- [ ] README.md 完整
- [ ] CLI 命令可执行
- [ ] 本地测试通过  
- [ ] 支持跨平台
- [ ] 错误处理完善
- [ ] 版本号正确
- [ ] 许可证文件存在
- [ ] .npmignore 配置正确