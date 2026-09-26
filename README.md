# Stateful Sales Agent

一个使用 TypeScript + Node.js 从零实现的有状态销售 Agent 学习项目。

项目不依赖 Agent 框架，直接使用 OpenAI 兼容 API、Tool Calling、Zod 和 JSON Store，手动实现 Structured Output、Agent Loop、长期 Memory 与 Context Selection。

## 已实现能力

- Structured Output 与 Zod 运行时校验
- 模型自主选择 Tool
- Tool 参数解析、校验与执行
- Observation 回填与多轮 Agent Loop
- 长期 Memory 的提取、过滤、合并和持久化
- Memory Metadata、来源追踪与冲突处理
- Memory Freshness 与 Context Selection
- 不调用模型的自动化测试

## 整体架构

```text
User Message
     │
     ▼
Load Full Memory
     │
     ▼
Freshness Check + Memory Selection
     │
     ▼
Context Builder
     │
     ▼
LLM ────────────────┐
 │                  │
 │ Tool Call        │ Final Answer
 ▼                  │
Validate Arguments  │
 │                  │
 ▼                  │
Execute Tool        │
 │                  │
 ▼                  │
Observation         │
 │                  │
 └──── Agent Loop ──┘
                     │
                     ▼
              Memory Extraction
                     │
                     ▼
           Normalize + Schema Validation
                     │
                     ▼
          Write Policy + Conflict Resolution
                     │
                     ▼
                Memory Store
```

## 学习进度

### Day 1 - Structured Output

把模型输出从自然语言转换为程序能够理解的数据：

```text
User Input
    ↓
LLM JSON Output
    ↓
JSON.parse()
    ↓
Zod Schema Validation
    ↓
Business Logic
```

### Day 2 - Tool Calling 与 Agent Loop

模型负责选择下一步行动，Node.js 程序负责校验和执行：

```text
User Goal
    ↓
LLM Tool Selection
    ↓
JSON Parse + Zod Validation
    ↓
Tool Execution
    ↓
Observation 写回 Context
    ↓
LLM 决定下一步
```

Agent Loop 最多执行 5 轮，避免模型持续调用工具造成无限循环。

### Day 3 - Stateful Agent 与长期 Memory

Agent 会把未来任务仍可能有价值的信息保存为结构化 Memory：

```text
User Message
    ↓
Memory Extraction
    ↓
Candidate
    ↓
Normalize
    ↓
Schema + Write Policy
    ↓
Conflict Resolution + Merge
    ↓
JSON Store
```

下一次运行时，系统会加载完整 Memory，但只把当前任务真正需要且尚未过期的信息放入 Context。

## Context、State 与 Memory

### Context

当前这一轮 LLM 能看到的信息，包括 System Prompt、用户消息、相关 Memory、Tool Call 和 Tool Result。

### State

Agent 当前执行到哪一步，例如当前轮数、已经执行的工具以及工具返回的 Observation。本项目中的短期 State 主要存在于 Agent Loop 和 `messages` 数组中。

### Memory

系统保存并能在未来重新取出的长期信息。真正记住数据的是应用程序和 Memory Store，不是 LLM 本身。

```text
Memory Store
    ↓ Retrieve
Memory Selector
    ↓
Context
    ↓
LLM
```

## 可信 Memory

当前 `contactTime` 使用带 Metadata 的结构：

```ts
{
  value: "evening",
  confidence: 0.98,
  source: "user_explicit",
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-27T10:00:00.000Z"
}
```

它回答了五个问题：

- 保存了什么？
- 系统有多确定？
- 信息来自哪里？
- 首次记录是什么时候？
- 最近一次更新是什么时候？

当前来源权威性规则：

```text
user_explicit
> tool_result
> user_inferred
> system
```

联系偏好暂定 180 天有效。过期 Memory 仍保存在 Store 中，但不会被 Selector 注入 Context。

目前只有 `contactTime` 已升级为完整 Metadata；姓名、兴趣和顾虑仍使用第一版简单结构。

## Memory Selection

第一版 Selector 使用可解释的关键词规则：

- 联系、回访、提醒任务：选择姓名和联系偏好
- 课程、资料、学习任务：选择姓名和兴趣
- 担心、顾虑相关任务：选择姓名和历史顾虑
- 无关任务：只保留基本身份

例如完整 Memory 中还有课程兴趣和就业顾虑，但用户只要求安排回访时，注入 Context 的内容可能只有：

```ts
{
  userId: "customer_001",
  name: "张三",
  preferences: {
    contactTime: "evening"
  }
}
```

## 当前工具

| Tool | 作用 | 参数 |
| --- | --- | --- |
| `search_customer` | 根据姓名查询客户咨询记录 | `name` |
| `create_reminder` | 为一次明确时间的回访创建提醒 | `customerId`, `time` |
| `send_course_info` | 向客户发送课程介绍 | `customerId` |

三个工具目前均使用 Mock 数据，不会访问真实 CRM、创建真实日程或发送真实消息。

## 项目结构

```text
agent-ai-learning/
├── data/
│   └── memory.json              # 本地 Memory 数据，已被 Git 忽略
├── src/
│   ├── agents/
│   │   ├── agent-loop.ts        # Agent 循环与停止条件
│   │   ├── context.ts           # 构建本轮 Context
│   │   ├── lead-agent.ts        # Stateful Agent 入口
│   │   └── lead-analyzer.ts     # Day 1 结构化输出示例
│   ├── llm/
│   │   └── client.ts            # 普通 LLM 与 Tool Calling 请求
│   ├── memory/
│   │   ├── memory.types.ts      # Memory、Candidate 与 Metadata 类型
│   │   ├── memory.store.ts      # JSON Store 与原子写入
│   │   ├── memory.extractor.ts  # 从用户消息提取 Candidate
│   │   ├── memory.normalizer.ts # 统一联系时间格式
│   │   ├── memory.policy.ts     # Memory 写入规则
│   │   ├── memory.conflict.ts   # 来源权威性与冲突处理
│   │   ├── memory.merger.ts     # 合并新旧 Memory
│   │   ├── memory.freshness.ts  # 生命周期判断
│   │   ├── memory.selector.ts   # 按任务选择相关 Memory
│   │   ├── memory.manager.ts    # 加载、合并与保存
│   │   └── memory.writer.ts     # Memory 写入流程入口
│   ├── schemas/
│   │   ├── lead.schema.ts
│   │   ├── tool.schema.ts
│   │   └── memory.schema.ts
│   ├── tools/
│   │   ├── registry.ts
│   │   ├── search-customer.ts
│   │   ├── create-reminder.ts
│   │   └── send-course-info.ts
│   └── index.ts
├── test/                        # 不调用模型的自动化测试
└── package.json
```

## 运行项目

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env`：

```dotenv
OPENAI_API_KEY=your_api_key
AI_BASE_URL=your_openai_compatible_api_base_url
AI_MODEL=your_model_name
```

`OPENAI_API_KEY` 必填。`AI_BASE_URL` 和 `AI_MODEL` 用于配置兼容服务与模型。真实 API Key 不要提交到 Git。

### 3. 启动 Agent

```bash
node --env-file=.env --import tsx src/index.ts
```

### 4. 运行自动化测试

```bash
npm test
```

测试覆盖 Schema、Normalizer、Write Policy、Conflict Resolution、Merge、Manager、Freshness 与 Selector，不读取 `.env`，也不会调用模型 API。

## Memory 与 RAG 的区别

```text
Memory
= Agent 过去需要记住的用户信息和交互事实

RAG
= Agent 当前需要从外部知识库检索的资料
```

“张三希望晚上联系”属于用户 Memory；“PLC 就业班退款规则”属于企业外部知识，更适合通过 RAG 检索。

Vector Database 只是存储与检索技术之一，并不等于 Memory 系统本身。

## 当前边界

- Tool 均为 Mock 实现。
- Agent 每轮只处理模型返回的第一个 Tool Call。
- Tool 参数错误会终止运行，尚未让模型自动修正。
- JSON Store 适合学习和单进程 Demo，尚未实现并发写入锁。
- Memory Extraction 每轮会额外调用一次模型。
- Selector 目前使用关键词规则，不是语义检索。
- 只有联系偏好已实现完整 Metadata、冲突处理和过期机制。
- 尚未实现敏感数据写入策略和人工审核流程。
