
# Agent AI Learning

一个使用 TypeScript + Node.js 学习 AI Agent 基础原理的项目。

项目不依赖 Agent 框架，而是直接使用 LLM API、Tool Calling 和 Zod，手动实现一个最小可运行的 Agent Loop。

## 学习进度

### Day 1 - Structured Output

实现销售线索分析器，将模型输出转换为程序可以理解和校验的数据。

```text
User Input
    ↓
LLM
    ↓
Structured Output
    ↓
Zod Schema Validation
    ↓
Business Logic
    ↓
Action
```

### Day 2 - Tool Calling & Agent Loop

实现一个销售线索 Agent。模型可以根据用户目标选择工具，程序负责校验参数并执行工具，再将执行结果放回 Context，由模型决定下一步。

```text
User Goal
    ↓
LLM
    ↓
Tool Selection
    ↓
JSON Parse + Zod Validation
    ↓
Tool Execution
    ↓
Observation (Tool Result)
    ↓
Context
    ↓
LLM decides Next Action
    ↓
Final Answer
```

Agent Loop 最多执行 5 轮，避免模型持续调用工具造成无限循环。

## 当前工具

| Tool | 作用 | 参数 |
| --- | --- | --- |
| `search_customer` | 根据姓名查询客户咨询记录 | `name` |
| `create_reminder` | 创建客户回访提醒 | `customerId`, `time` |
| `send_course_info` | 向客户发送课程介绍 | `customerId` |

目前三个工具均使用 Mock 数据，用于学习 Tool Calling 过程，不会访问真实 CRM 或发送真实消息。

## 项目结构

```text
src/
├── agents/
│   ├── agent-loop.ts       # Agent 的循环与停止条件
│   ├── context.ts          # 创建对话 Context
│   ├── lead-agent.ts       # 销售线索 Agent 入口
│   └── lead-analyzer.ts    # Day 1 结构化线索分析
├── llm/
│   └── client.ts           # LLM 客户端与 Tool Calling 请求
├── schemas/
│   ├── lead.schema.ts      # Day 1 输出 Schema
│   └── tool.schema.ts      # Tool Arguments Schema
├── services/
│   └── sales.service.ts    # 销售业务处理
├── tools/
│   ├── registry.ts         # Tool 描述、Handler 和 Schema 注册表
│   ├── search-customer.ts
│   ├── create-reminder.ts
│   └── send-course-info.ts
└── index.ts                 # 程序入口
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

`OPENAI_API_KEY` 为必填项。`AI_BASE_URL` 用于配置 OpenAI 兼容的 API 地址，`AI_MODEL` 用于指定模型。不要将真实 API Key 提交到 Git 仓库。

### 3. 启动

```bash
node --env-file=.env --import tsx src/index.ts
```

当输入是：

```text
帮我查询张三有没有咨询记录，如果咨询过，明天下午联系他
```

预期 Agent 依次执行：

```text
第 1 轮：search_customer
第 2 轮：create_reminder
第 3 轮：返回最终答案
```

## 核心设计

### Tool Description 与 Tool Handler

- `tools` 是提供给模型的工具说明，帮助模型选择工具并生成参数。
- `toolHandlers` 是 Node.js 程序内部的真正函数。
- `toolArgumentSchemas` 定义每个工具的参数契约。

模型只能提出工具调用请求，真正的函数由 Node.js 程序查找并执行。

### Context 与 Observation

每次工具执行后，程序会把两条消息加入 Context：

1. 模型返回的 Assistant Tool Call。
2. Node.js 执行后生成的 Tool Result。

Tool Result 是 Agent 从环境中获得的新 Observation。模型只有看到它，才能根据前一步结果选择下一个行动。

### 参数校验

```text
arguments string
    ↓ JSON.parse()
unknown value
    ↓ Zod Schema
validated arguments
    ↓
Tool Handler
```

`JSON.parse()` 只能检查字符串是否为合法 JSON；Zod 还会检查必填字段、字段类型、空字符串和多余字段。

## 当前边界

- Tool 使用 Mock 实现，没有连接真实数据库或外部服务。
- Agent Loop 最多执行 5 轮。
- 当前每轮只处理模型返回的第一个 Tool Call。
- 参数校验失败时会终止当前运行，尚未让模型自动修正参数。
