# Claude Hooks Setup

🚀 Automatically setup Claude Code with intelligent git hooks and configuration for seamless AI-powered development workflow.

## ✨ Features

- **Intelligent Commit Messages**: Automatically generates git commit messages from your Claude assistant interactions
- **Zero Configuration**: One command setup - finds your `.claude` directory automatically  
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Smart Text Processing**: Cleans up commit messages by removing unnecessary punctuation and formatting
- **Git Integration**: Only commits when there are actual changes and you're in a git repository
- **Safe Operations**: Includes safeguards to prevent commit loops and errors

## 🚀 Quick Start

### Installation

```bash
npm install -g claude-hooks-setup
```

### Setup

```bash
claude-hooks-setup
```

That's it! The tool will:

1. 🔍 Find your Claude Code configuration directory
2. 📝 Create/update the stop hook for automatic commits  
3. ⚙️ Configure your `settings.json` with recommended settings
4. ✅ Validate the setup

## 📋 How It Works

### Automatic Commit Messages

When you finish an interaction with Claude Code, the hook will:

1. **Extract** the last assistant message from your session
2. **Clean** the text by removing unnecessary formatting (stars, extra commas, etc.)
3. **Generate** a commit message with format: `feat: [cleaned message content]`
4. **Commit** your changes automatically (only if you're in a git repo with changes)

### Example

If Claude's last message was:
```
已优化 `testBasicSetters` 方法，**主要改进包括：**
1. **配置化测试数据** - 使用 `testConfig` 对象集中管理测试参数
2. **详细日志记录** - 每个设置操作都有独立的成功日志
```

The generated commit message will be:
```
feat: 已优化 testBasicSetters 方法，主要改进包括： 1. 配置化测试数据 - 使用 testConfig 对象集中管理测试参数 2. 详细日志记录 - 每个设置操作都有独立的成功日志
```

## 🔧 Configuration

The tool automatically configures your Claude Code `settings.json` with:

```json
{
  "hooks": {
    "stop": "hooks/stop-hook-anthropic.js"
  },
  "editor": {
    "auto_save": true,
    "format_on_save": true
  },
  "git": {
    "auto_commit": true,
    "commit_on_stop": true
  },
  "ui": {
    "show_token_count": true,
    "confirm_before_exit": false
  },
  "logging": {
    "level": "info",
    "enable_hooks_logging": true
  }
}
```

## 📁 Directory Structure

After setup, your `.claude` directory will look like:

```
~/.claude/
├── settings.json          # Claude Code configuration
├── hooks/
│   └── stop-hook-anthropic.js  # Auto-commit hook
└── ... (other Claude files)
```

## 🛠️ Manual Configuration

If you prefer manual setup or need to customize:

### Find Your Claude Directory

The tool searches for `.claude` in these locations:

**macOS:**
- `~/.claude`
- `~/Library/Application Support/Claude`
- `~/Library/Application Support/claude`

**Windows:**
- `%APPDATA%\\Claude`
- `%APPDATA%\\claude`
- `%LOCALAPPDATA%\\Claude`
- `%LOCALAPPDATA%\\claude`

**Linux:**
- `~/.claude`
- `~/.config/claude`
- `~/.local/share/claude`

### Environment Variable

Set `CLAUDE_CONFIG_PATH` to specify a custom location:

```bash
export CLAUDE_CONFIG_PATH=/path/to/your/claude/config
claude-hooks-setup
```

## 🔄 Upgrading

To update to the latest version:

```bash
npm update -g claude-hooks-setup
claude-hooks-setup  # Re-run to update hooks
```

## 🚫 Disabling

To temporarily disable auto-commits, edit your `settings.json`:

```json
{
  "hooks": {
    "stop": ""
  }
}
```

Or remove the entire `hooks` section.

## 🐛 Troubleshooting

### Hook Not Triggering

1. **Check Claude Code restart**: Restart Claude Code after setup
2. **Verify settings**: Ensure `settings.json` has the correct hook path
3. **Check permissions**: Ensure the hook file is executable (Unix systems)

### Commit Issues

1. **Git repository**: The hook only works in git repositories
2. **Git configuration**: Ensure git user name/email are configured
3. **File changes**: The hook only commits when there are actual changes

### Directory Not Found

1. **Manual path**: Use `CLAUDE_CONFIG_PATH` environment variable
2. **Create manually**: Create `~/.claude` directory if needed
3. **Permissions**: Ensure you have write access to the directory

## 📝 CLI Options

```bash
claude-hooks-setup --help     # Show help
claude-hooks-setup --version  # Show version
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup

```bash
git clone https://github.com/xzj-abc/claude-hooks-setup.git
cd claude-hooks-setup
npm install
npm link  # For local testing
```

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related

- [Claude Code Documentation](https://docs.anthropic.com/claude/docs)
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

---

Made with ❤️ for the Claude Code community