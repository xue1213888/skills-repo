# 架构说明：元数据与缓存分离

## 概述

本项目采用**元数据与文件分离**的架构：

- `skills/` 目录：只存储 `.x_skill.yaml` 元信息文件
- `.cache/skills/` 目录：构建时从源仓库拉取的实际文件（被 gitignore）

这样做的好处：
1. **仓库保持精简**：不存储大量skill文件，只存元数据
2. **文件始终最新**：每次构建时从源仓库拉取最新文件
3. **可审计**：所有skill的来源都在元数据中记录

---

## 目录结构

```
skills-repo/
├── skills/                          # 只存元数据
│   ├── development/
│   │   └── my-skill/
│   │       └── .x_skill.yaml        # 元信息（提交到仓库）
│   └── design/
│       └── another-skill/
│           └── .x_skill.yaml
├── .cache/                          # 构建缓存（gitignore）
│   └── skills/
│       ├── my-skill/
│       │   ├── SKILL.md             # 从源仓库拉取
│       │   ├── scripts/
│       │   └── .cache-meta.json     # 缓存元数据
│       └── another-skill/
│           └── ...
└── registry/                        # 构建输出
    ├── index.json
    └── categories.json
```

---

## 构建流程

### 1. 导入 (import-from-issue.mjs)

当用户提交issue并添加`import-approved`标签时：

```bash
# CI运行脚本
node scripts/import-from-issue.mjs
```

**脚本行为**：
1. 从源仓库克隆代码
2. 读取 `SKILL.md` 提取 description
3. **只创建 `skills/<category>/<id>/.x_skill.yaml`**
4. **不复制任何其他文件**

### 2. 同步 (sync-skill-files.mjs)

构建前从源仓库拉取文件到缓存：

```bash
npm run sync:skills
# 或自动包含在
npm run build:registry
```

**脚本行为**：
1. 扫描所有 `.x_skill.yaml` 文件
2. 根据 `source.repo`, `source.ref`, `source.path` 信息
3. 从源仓库克隆并复制文件到 `.cache/skills/<id>/`
4. 如果已有相同ref的缓存，跳过下载

### 3. 构建 (build-registry.mjs)

```bash
npm run build:registry
```

**流程**：
1. 先运行 `sync-skill-files.mjs` 同步文件
2. 扫描 `skills/` 目录的元数据
3. 从 `.cache/skills/` 读取 SKILL.md 和文件列表
4. 生成 `registry/index.json` 等输出

---

## .x_skill.yaml 结构

```yaml
specVersion: 2
id: my-skill
title: My Awesome Skill
description: A brief description
category: development
tags:
  - automation
  - productivity
source:
  repo: https://github.com/owner/skill-repo
  path: .
  ref: main
  syncedCommit: abc123def456
```

**关键字段**：
- `source.repo`: 源仓库URL（必填）
- `source.path`: 仓库内skill目录路径（必填）
- `source.ref`: Git分支或标签（必填）
- `source.syncedCommit`: 导入时的commit SHA

---

## npm 脚本

| 脚本 | 说明 |
|------|------|
| `npm run sync:skills` | 从源仓库同步文件到缓存 |
| `npm run build:registry` | 同步 + 构建registry |
| `npm run build:registry:no-sync` | 只构建registry（不同步） |
| `npm run validate` | 验证元数据格式 |

---

## 缓存机制

### 缓存目录结构

```
.cache/skills/<skill-id>/
├── SKILL.md                 # 从源仓库复制
├── scripts/                 # 源仓库的其他文件
├── prompts/
└── .cache-meta.json         # 缓存元数据
```

### 缓存元数据

```json
{
  "repo": "https://github.com/owner/repo",
  "ref": "main",
  "path": ".",
  "syncedAt": "2024-01-15T10:30:00.000Z"
}
```

### 缓存策略

- **命中条件**：`repo` + `ref` + `path` 全部匹配
- **未命中**：重新从源仓库克隆
- **清理**：手动删除 `.cache/` 目录即可

---

## 前端读取逻辑

`scripts/lib/registry.mjs` 中的 `scanSkills()` 函数：

```javascript
// 优先从缓存读取
const skillCacheDir = path.join(cacheDir, skillId);
const skillMdCachePath = path.join(skillCacheDir, 'SKILL.md');
const skillMdLocalPath = path.join(skillDir, 'SKILL.md');

let skillMdPath = await fileExists(skillMdCachePath)
  ? skillMdCachePath
  : skillMdLocalPath;
```

**读取顺序**：
1. `.cache/skills/<id>/SKILL.md` （缓存）
2. `skills/<category>/<id>/SKILL.md` （本地回退）

---

## CI/CD 配置

### GitHub Actions 示例

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build registry (includes sync)
        run: npm run build:registry

      - name: Build site
        run: npm run build:site
```

### 缓存加速（可选）

```yaml
- name: Cache skill files
  uses: actions/cache@v3
  with:
    path: .cache/skills
    key: skills-${{ hashFiles('skills/**/.x_skill.yaml') }}
    restore-keys: |
      skills-
```

---

## 优势

1. **仓库体积小**：只存元数据，不存大量skill文件
2. **始终最新**：每次构建从源仓库拉取
3. **可追溯**：通过 `source` 字段追踪文件来源
4. **灵活缓存**：支持增量更新，避免重复下载
5. **易于维护**：技能更新只需修改源仓库，无需更新本仓库
