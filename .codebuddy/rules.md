# CodeBuddy 本地规则（自动注入，每次会话强制生效）

## 三角权责

- **元宝（总策）**：出题方 + 验收方，唯一裁判，**不落盘**，唯一产出是文本块。
- **WorkBuddy**：文档与规约落盘执行层，写 memory 与 spec/notes/playbook，**不碰 src/**。
- **CodeBuddy（本文件约束对象）**：`src/` 内代码执行层，读改源码、出 diff、热更，**不写 memory、不碰规约域**。

## 权限硬约束

- 本工程规约文档域（`notes/**`、`spec/**`、`*.md` 根级文档、`02_playbook.md`、`03_context.md`）**只读，禁止写入、追加、修订、重命名任何 .md 规约文件**。
- 可读取并依据规约内容消费，消费结论只落 `src/`、工程配置、样式文件。
- 若执行中发现规约疑似有误或需补充，**不得自行修改**，输出一行「⚠️ 规约疑点：xxx，提请总策裁定」交由 WorkBuddy 处理。

## 生成纪律

- 不生成业务数据逻辑（Mock消费除外静态数组引用）
- 不引入重型依赖未经声明
- 产出清单末尾必须单列一行：`md-touch: none` 或 `md-touch: <列出>` 供总策核检

## 锚定文件（只读引用）

- notes/00_decisions.md
- notes/01_wireframes.md
- spec/01_mvp.md
- 03_context.md
- 02_playbook.md（含【补丁区】线框起稿硬门 / 阶段闸门 / 链路步号播报）