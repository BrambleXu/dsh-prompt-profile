# dsh-prompt-profile

![dsh-prompt-profile hero](assets/hero.png)

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/BrambleXu/dsh-prompt-profile?style=flat-square" alt="MIT license"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%5E22.19%20%7C%20%3E%3D24-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js ^22.19 or >=24"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.9"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/tests-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Tests with Vitest"></a>
</p>

<p align="center">
  <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin#development--runtime"><img src="https://img.shields.io/static/v1?label=awesome%20%C2%B7%20DSH%20plugin&amp;message=development&amp;color=5B4CF0&amp;style=flat-square" alt="awesome · DSH plugin · development"></a>
</p>

<p align="center"><a href="README.md">English</a> | 中文</p>

为 DeepSeek Harness 提供可复用的 Markdown prompt profile。一个 profile 可以为单轮对话选择 provider、model 和 reasoning effort，将命令参数渲染到 prompt 正文中，并在对话结束后恢复之前的选择。

## 为什么存在 💡

不同会话中经常需要重复选择模型和输入审查指令。`dsh-prompt-profile` 将这些组合保存为小型、可复用的 Markdown profile，可以应用于单轮对话，并在结束后保留 Agent 之前的模型选择。

## 功能 ✨

- 从用户目录和项目目录发现 profile，项目 profile 优先。
- 使用 shell 风格占位符将位置参数替换到 profile 正文中。
- 为单轮对话选择 provider、model 和 reasoning effort。
- 默认自动恢复 Agent 之前的选择，也可以按 profile 关闭恢复。
- 列出可用 profile，并通过斜杠分隔的名称调用嵌套 profile。

## 安装 📦

```sh
dsh plugin --profile demo add ./dsh-prompt-profile
```

在 `~/.dsh/prompt-profiles/` 下创建用户 profile，或在 `<repo>/.dsh/prompt-profiles/` 下创建项目 profile：

```markdown
---
description: Deep code review
provider: deepseek
model: deepseek-reasoner
reasoningEffort: high
restore: true
---
Review $1 for correctness, regressions, and missing tests. Extra context: ${@:2}
```

项目 profile 会覆盖相同相对名称的用户 profile。

## 使用 🚀

```text
/prompt-profile list
/prompt-profile review src/index.ts "focus on cancellation"
```

嵌套文件使用斜杠分隔的名称。例如，`.dsh/prompt-profiles/review/security.md` 对应的名称是 `review/security`。

支持的占位符：

| 占位符 | 值 |
| --- | --- |
| `$1`、`$2`、… | 一个位置参数 |
| `$@`、`@$`、`$ARGUMENTS` | 全部参数 |
| `${@:N}` | 从第 N 个位置开始的参数 |
| `${@:N:L}` | 从第 N 个位置开始的 L 个参数 |

## Frontmatter 🧾

| 字段 | 要求 | 含义 |
| --- | --- | --- |
| `description` | 否 | `/prompt-profile list` 中显示的文本 |
| `provider` | 与 `model` 一起使用 | Harness provider 路由 |
| `model` | 与 `provider` 一起使用 | provider 所属的 model ID |
| `reasoningEffort` | 与 `provider` 和 `model` 一起使用 | adapter 所属的 reasoning effort ID |
| `restore` | 否 | 本轮结束后恢复之前的选择；默认为 `true` |

同时省略 `provider` 和 `model`，即可使用当前 Agent 的选择。

## 配置 ⚙️

```yaml
- id: dsh-prompt-profile
  name: dsh-prompt-profile
  config:
    userDirectory: ~/.dsh/prompt-profiles
    projectDirectory: .dsh/prompt-profiles
```

## 开发 🧑‍💻

```sh
pnpm install
pnpm run check
```

## 范围 🎯

0.1 版本有意不包含 prompt chain、循环、skill 注入、subagent、worktree 和 best-of-N 编排。只有当 Harness 扩展点能够保留其生命周期和持久会话语义时，才应添加这些功能。

## 许可证 📄

MIT

## 致谢 🙏

核心思路来自 [`pi-prompt-template-model`](https://github.com/nicobailon/pi-prompt-template-model)。首个 Harness 原生版本专注于最小可用单元：确定性发现、参数替换、作用域内的模型路由和恢复。
