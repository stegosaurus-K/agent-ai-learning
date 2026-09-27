# Stateful Sales Agent

一个使用 TypeScript + Node.js 从零实现的有状态销售 Agent 学习项目。

项目不依赖 Agent 框架，使用 OpenAI 兼容 API、Tool Calling、Zod 和 JSON Store，逐步实现 Structured Output、Agent Loop、长期 Memory、Mini RAG 与请求路由。

## 已实现能力

- Structured Output 与 Zod 运行时校验
- 模型自主选择 Tool
- Tool 参数解析、校验与执行
- Observation 回填与多轮 Agent Loop
- 长期 Memory 的提取、过滤、合并和持久化
- Memory Metadata、来源追踪与冲突处理
- Memory Freshness 与 Context Selection
- 基于 Embedding 和余弦相似度的 Mini RAG
- 按年份过滤资料、按相似度排序并选取 Top K
- Router 按需启用 Memory、RAG 和 Tool
- 不调用模型的自动化测试

## 整体架构

```text
User Message
    ↓
Router：useMemory / useRAG / allowTools
    ├─ useMemory → 加载、筛选未过期的 Memory ─┐
    ├─ useRAG → 按年份过滤并检索文档 ────────┤
    └─ allowTools → 提供工具与当前客户 ID ───┘
                        ↓
                  Context Builder
                        ↓
                  Agent Loop：LLM
                        ├─ Tool Call → 参数校验 → 执行 → Observation 回填 ↩
                        └─ Final Answer
                              ↓
                  若 useMemory=true：提取、校验、合并并保存 Memory
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

当任务需要长期用户信息时，系统会加载完整 Memory，但只把当前任务真正需要且尚未过期的信息放入 Context。

### Day 4 - Mini RAG 与 Router

把企业资料与用户记忆分开：课程、服务和退费制度从知识库检索；用户联系偏好等长期信息从 Memory 读取；创建提醒等外部动作交给 Tool。

Mini RAG 的流程：为模拟文档生成 Embedding 并建立当前进程内的索引；收到查询后生成查询向量，先按年份过滤，再计算余弦相似度、排序并取 Top K；最后把检索结果放入 Context，让模型依据资料回答，资料不足时说明不足。检索函数也支持可选的最低相似度阈值，目前 Agent 尚未启用该阈值。

Router 返回 `useMemory`、`useRAG`、`allowTools` 三个布尔值，可以同时启用多种能力。未启用 Memory 时不加载或更新长期记忆；未启用 RAG 时不生成查询向量；未允许 Tool 时不向模型提供工具。

## Context、State 与 Memory

### Context

当前这一轮 LLM 能看到的信息，包括 System Prompt、用户消息、按需注入的 Memory 与检索资料，以及 Tool Call 和 Tool Result。需要执行工具时，程序还会提供当前会话的客户 ID。

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
│   │   ├── router.ts            # Memory / RAG / Tool 请求路由
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
│   ├── rag/
│   │   ├── documents.ts         # Day 4 模拟企业资料
│   │   ├── embedding.ts         # 文本向量化
│   │   ├── index.ts             # 当前进程内的文档索引
│   │   ├── similarity.ts        # 余弦相似度
│   │   ├── retriever.ts         # 年份过滤、排序与 Top K
│   │   ├── context.ts           # 格式化检索结果
│   │   └── answer.ts            # 独立的资料问答示例
│   ├── schemas/
│   │   ├── lead.schema.ts
│   │   ├── tool.schema.ts
│   │   ├── memory.schema.ts
│   │   └── route.schema.ts
│   ├── tools/
│   │   ├── registry.ts
│   │   ├── search-customer.ts
│   │   ├── create-reminder.ts
│   │   └── send-course-info.ts
│   └── index.ts
├── test/                        # Memory 与路由等自动化测试，不调用模型
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
AI_EMBEDDING_API_KEY=your_embedding_api_key
AI_EMBEDDING_BASE_URL=your_embedding_api_base_url
AI_EMBEDDING_MODEL=your_embedding_model_name
```

对话模型由 `OPENAI_API_KEY`、`AI_BASE_URL`、`AI_MODEL` 配置；`AI_MODEL` 未设置时默认使用 `deepseek-flash`。RAG 使用独立的 Embedding 服务，`AI_EMBEDDING_API_KEY`、`AI_EMBEDDING_BASE_URL`、`AI_EMBEDDING_MODEL` 在触发检索时必填。这里的 OpenAI SDK 是兼容 API 客户端，实际服务由 Base URL 决定。真实 API Key 不要提交到 Git。

### 3. 启动 Agent

```bash
node --env-file=.env --import tsx src/index.ts
```

`src/index.ts` 当前包含两轮 Memory 与提醒示例。要体验 Day 4 路由，可在该文件中将示例消息改为以下任意一条后运行：

- Memory：`我之前说过什么时候联系我比较方便？`
- RAG：`报名后如果不学了，课程退费有什么规定？`
- Tool：`明天下午 3 点提醒我再看一下课程。`

运行时会调用配置的模型；触发 RAG 时还会调用 Embedding 服务。提醒工具目前是 Mock，不会真的在指定时间发送提醒。

### 4. 运行自动化测试

```bash
npm test
```

测试覆盖 Memory 的 Schema、Normalizer、Write Policy、Conflict Resolution、Merge、Manager、Freshness、Selector，以及 Agent 路由后的分支行为。测试不读取 `.env`，也不会调用模型 API。

## Memory 与 RAG 的区别

```text
Memory
= Agent 过去需要记住的用户信息和交互事实

RAG
= Agent 当前需要从外部知识库检索的资料
```

“张三希望晚上联系”属于用户 Memory；“PLC 就业班退款规则”属于企业外部知识，更适合通过 RAG 检索。

本项目的 Mini RAG 使用当前进程内缓存的文档向量，不依赖向量数据库。Vector Database 只是存储与检索技术之一，并不等于 Memory 系统本身。

## 当前边界

- Tool 均为 Mock 实现。
- 知识库文档也是模拟资料，不代表真实课程或退费政策；Agent 目前固定检索 2026 年的文档。
- 文档索引只在当前进程内缓存，重启后会重新生成向量；尚未接入持久化向量数据库。
- Router 由模型判断，可能误判；RAG 检索函数支持最低相似度阈值，但 Agent 当前未传入阈值。
- Agent 每轮只处理模型返回的第一个 Tool Call。
- Tool 参数错误会终止运行，尚未让模型自动修正。
- JSON Store 适合学习和单进程 Demo，尚未实现并发写入锁。
- 仅在 Router 启用 Memory 时，Memory Extraction 才会额外调用一次模型。
- Selector 目前使用关键词规则，不是语义检索。
- 只有联系偏好已实现完整 Metadata、冲突处理和过期机制。
- 尚未实现敏感数据写入策略和人工审核流程。
