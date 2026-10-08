# 糖康孪生平台 —— 基于数字孪生与大数据的糖尿病智能管控平台

## 📌 项目介绍

**糖康孪生平台**是一款面向糖尿病患者的智能健康管控系统，融合**数字孪生**与**大数据分析**技术，为用户提供从**风险筛查、健康评估、AI 健康咨询到日常健康管理**的一站式服务。

平台通过机器学习模型（scikit-learn / XGBoost）对用户的年龄、性别、BMI、血压、血糖、病史等多项指标进行综合分析，输出个性化的糖尿病风险等级与健康建议；同时配备智能 AI 健康助手（DeepSeek）、桌面健康宠物等交互功能，帮助用户养成科学、可持续的健康管理习惯。

> ⚠️ **声明**：本项目为高校竞赛作品，平台输出的所有健康评估与建议仅供参考，不构成医疗诊断。涉及健康问题请及时就医。

---

## ✨ 功能特性

- **糖尿病风险智能评估**：基于机器学习模型的初筛与详细评估，输出风险等级、风险概率与关键风险因素
- **AI 健康助手**：基于 DeepSeek 大模型的 24 小时多轮健康问答，支持个性化档案注入
- **健康报告**：支持生成 PDF / 高清图片健康评估报告
- **桌面健康桌宠**：可交互的桌面宠物，提供久坐、喝水、用药、测血糖等智能健康提醒
- **健康管理**：健康提醒设置、家族健康管理、健康知识科普、社区论坛等
- **多端适配**：桌面网页端 + 手机端 H5
- **数据看板**：糖尿病患病数据可视化展示

---

## 🧱 技术架构

| 层次 | 技术选型 |
|------|----------|
| 后端算法服务 | Python · Flask · scikit-learn · XGBoost · joblib |
| 后端接口服务 | Node.js · Express · mysql2 · jsonwebtoken · bcryptjs |
| 前端 | HTML5 / CSS3 / JavaScript（HBuilderX 开发）· 原生组件库 |
| 数据库 | MySQL（utf8mb4） |
| AI 能力 | DeepSeek API |
| 依赖管理 | requirements.txt（Python）· package.json（Node） |

### 目录结构

```
源代码/
├── README.md
├── .gitignore
└── 网页所用到的代码/          # 核心源码目录
    ├── app.py                # Flask 后端算法服务
    ├── advanced_model.py     # 机器学习模型与训练
    ├── server.js             # Node.js 接口服务
    ├── 123.py                # 数据处理脚本
    ├── requirements.txt      # Python 依赖清单
    ├── package.json          # Node 依赖清单
    ├── .env.example          # 环境变量模板
    ├── 数据库/
    │   └── 用户.sql           # 数据库初始化脚本
    ├── 糖康孪生_手机版/        # 手机端 H5 页面
    ├── 病例分析（代码）/       # 病例数据分析代码
    └── *.html / *.js / *.css  # 前端页面与组件
```

---

## 🔧 环境配置

### 1. 环境变量模板

项目使用 `.env` 文件保存环境配置。**请复制模板文件并填入你自己的真实配置**：

```bash
cp .env.example .env   # Windows 可手动复制并重命名为 .env
```

模板内容说明（详见 `网页所用到的代码/.env.example`）：

| 变量 | 说明 |
|------|------|
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL 数据库连接配置 |
| `PORT` | 后端接口服务端口（默认 3001） |
| `JWT_SECRET` | JWT 鉴权密钥，生产环境请替换为随机强密钥 |
| `OPENAI_API_KEY` | DeepSeek / OpenAI API 密钥（AI 助手功能，可选） |

> 🔐 **安全提示**：`.env` 文件包含密钥，已被 `.gitignore` 忽略，请勿提交到代码仓库。前端 AI 功能所需密钥请在对应 HTML/JS 文件中替换为你的密钥。

### 2. 依赖清单

- **Python 依赖**：见 `网页所用到的代码/requirements.txt`（Flask、flask-cors、openai、pandas、numpy、scikit-learn、joblib、xgboost、shap、torch、Pillow、python-dotenv）
- **Node 依赖**：见 `网页所用到的代码/package.json`（express、mysql2、jsonwebtoken、bcryptjs、cors、dotenv、nodemon）

---

## 🚀 安装运行指南

### 环境要求

- Python 3.9+
- Node.js 16+
- MySQL 5.7 / 8.0

### 第一步：初始化数据库

1. 启动 MySQL，执行 `网页所用到的代码/数据库/用户.sql` 创建数据库与数据表。
2. 根据本机配置，在 `.env` 中填写正确的数据库账号密码。

### 第二步：启动后端算法服务（Flask）

```bash
cd 网页所用到的代码
pip install -r requirements.txt
python app.py
```

### 第三步：启动 Node 接口服务

```bash
cd 网页所用到的代码
npm install
npm start        # 或 npm run dev（nodemon 开发模式）
```

### 第四步：访问前端页面

使用浏览器直接打开 `网页所用到的代码/index2.html`（或使用 HBuilderX 打开并运行）。手机端页面位于 `网页所用到的代码/糖康孪生_手机版/index.html`。

> 前端页面默认调用 `http://127.0.0.1:5000`（Flask）与 `http://localhost:3001`（Node）接口，请确保两个后端服务均已启动。

---

## 👥 团队信息

> - **团队名称**：广工商大鸿蒙开发队
> - **团队编号**：38436
> - **所属院校**：广东工商职业技术大学
> - **参赛组别**：B组
> - **团队成员**：王璟泽、黄力威、张顺成
> - **指导老师**：梁飞燕、王瑞奇

---

## 📄 许可证与免责声明

本项目为竞赛作品，仅供学习与研究使用。平台内涉及的医疗数据、评估算法与建议仅供参考，不构成医疗诊断或治疗建议；如需医疗帮助，请前往正规医疗机构就诊。

---

© 糖康孪生平台 · 基于数字孪生与大数据的糖尿病智能管控平台
