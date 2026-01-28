# Import Issue Schema 文档

## 概述

本文档描述了skill导入流程中涉及的三个schema以及它们之间的关系。

---

## 1. Issue Schema (用户提交的格式)

**来源**: Issue模板 `.github/ISSUE_TEMPLATE/import-request.md`

**格式**:
```yaml
<!-- skillhub-import:v2
sourceRepo: https://github.com/OWNER/REPO
ref: main
items:
  - sourcePath: path/to/skill-dir
    id: your-skill-id
    title: Human readable title
    targetCategory: development
    tags: [tag1, tag2]
    isUpdate: true
-->
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 | 用途 |
|------|------|------|------|------|
| `sourceRepo` | string | ✅ | GitHub仓库URL | 克隆源码用 |
| `ref` | string | ✅ | Git分支/标签 | 克隆时指定版本 |
| `items` | array | ✅ | 要导入的skill列表 | 批量导入多个skill |
| `items[].sourcePath` | string | ✅ | 源仓库中skill目录路径 | 定位SKILL.md位置 |
| `items[].id` | string | ✅ | skill唯一标识(kebab-case) | 生成目标目录名和yaml的id |
| `items[].title` | string | ✅ | skill显示标题 | 写入yaml的title |
| `items[].targetCategory` | string | ✅ | 目标分类ID | 确定`skills/<category>/<id>/`路径 + 写入yaml的category |
| `items[].tags` | array | ❌ | 标签列表 | 写入yaml的tags |
| `items[].isUpdate` | boolean | ❌ | 是否为更新操作 | 允许覆盖已存在的skill |

### 限制

- `items` 最多20个
- `id`、`targetCategory` 必须是slug格式：`^[a-z0-9]+(?:-[a-z0-9]+)*$`
- `sourcePath` 不允许包含 `..`

---

## 2. 脚本解析 & 生成

**来源**: `scripts/import-from-issue.mjs`

### 解析的字段 (parseRequest函数)

```javascript
{
  sourceRepo: string,     // GitHub仓库URL
  ref: string,            // Git分支/标签
  items: [{
    sourcePath: string,   // 源路径
    targetCategory: string, // 目标分类
    id: string,           // skill ID
    title: string,        // 标题
    tags: string[],       // 标签
    isUpdate: boolean     // 是否更新
  }]
}
```

### 生成的 .x_skill.yaml

```yaml
specVersion: 2
id: your-skill-id
title: Human readable title
description: (从SKILL.md提取)
category: development
tags:
  - tag1
  - tag2
links:
  docs: ./SKILL.md
source:
  repo: https://github.com/OWNER/REPO
  path: path/to/skill-dir
  ref: main
  syncedCommit: abc123def456
```

---

## 3. .x_skill.yaml Schema 规范

**规范文件**: `schemas/skill.schema.json`

### 必填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `specVersion` | integer | 必须为 `2` |
| `id` | string | skill唯一标识(kebab-case) |
| `title` | string | 显示标题(1-120字符) |
| `description` | string | skill描述 |
| `category` | string | 分类ID(kebab-case) |
| `source` | object | 源仓库信息 |

### 可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `license` | string | 许可证标识(如MIT, Apache-2.0) |
| `authors` | array | 作者列表 `[{name, url?, email?}]` |
| `tags` | array | 标签列表(kebab-case) |
| `agents` | array | 兼容的AI代理 |
| `runtime` | array | 运行时要求 |
| `links` | object | 外部链接 `{homepage?, docs?, repo?}` |
| `related` | array | 相关skill ID列表 |

### source对象

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `repo` | string | ✅ | GitHub仓库URL |
| `path` | string | ✅ | 仓库内路径 |
| `ref` | string | ✅ | Git分支/标签 |
| `syncedCommit` | string | ❌ | 最后同步的commit SHA |

---

## 4. 数据流转对照表

```
Issue字段              →  脚本处理             →  .x_skill.yaml字段
─────────────────────────────────────────────────────────────────
sourceRepo            →  clone仓库            →  source.repo
ref                   →  checkout版本         →  source.ref
(git rev-parse HEAD)  →  获取commit           →  source.syncedCommit
items[].sourcePath    →  定位目录 + 复制文件   →  source.path
items[].id            →  生成目录名           →  id
items[].title         →  直接传递             →  title
items[].targetCategory →  生成目录路径        →  category
items[].tags          →  过滤空值             →  tags
items[].isUpdate      →  控制是否覆盖         →  (不写入yaml)
(SKILL.md内容)        →  提取description      →  description
(固定值)              →  -                    →  specVersion: 2
(固定值)              →  -                    →  links.docs: "./SKILL.md"
```

---

## 5. 前端UI生成的Issue格式

**来源**: `site/app/import/ImportClient.tsx` 的 `buildIssueBody` 函数

前端UI生成的格式与Issue Schema完全一致：

```typescript
function buildIssueBody(args: {
  sourceRepoUrl: string;
  ref: string;
  items: Array<{
    sourcePath: string;
    id: string;
    title: string;
    targetCategory: string;
    tags: string[];
    isUpdate: boolean;
  }>;
})
```

---

## 6. 一致性验证结果

| 检查项 | 前端UI | Issue模板 | 脚本解析 | Schema规范 | 状态 |
|--------|--------|-----------|----------|------------|------|
| `specVersion: 2` | - | - | ✅生成 | ✅要求 | ✅ |
| `id` | ✅ | ✅ | ✅ | ✅必填 | ✅ |
| `title` | ✅ | ✅ | ✅ | ✅必填 | ✅ |
| `description` | - | - | ✅从SKILL.md提取 | ✅必填 | ✅ |
| `category` | ✅(targetCategory) | ✅ | ✅ | ✅必填 | ✅ |
| `tags` | ✅ | ✅ | ✅ | ✅可选 | ✅ |
| `source.repo` | ✅(sourceRepo) | ✅ | ✅ | ✅必填 | ✅ |
| `source.path` | ✅(sourcePath) | ✅ | ✅ | ✅必填 | ✅ |
| `source.ref` | ✅(ref) | ✅ | ✅ | ✅必填 | ✅ |
| `source.syncedCommit` | - | - | ✅生成 | ✅可选 | ✅ |
| `links.docs` | - | - | ✅固定值 | ✅可选 | ✅ |

**所有字段现已完全一致！** ✅

---

## 7. 规范文件位置汇总

| 文件 | 路径 | 用途 |
|------|------|------|
| Schema规范 | `schemas/skill.schema.json` | .x_skill.yaml的JSON Schema |
| Issue模板 | `.github/ISSUE_TEMPLATE/import-request.md` | 用户提交issue的模板 |
| 导入脚本 | `scripts/import-from-issue.mjs` | 解析issue并生成文件 |
| 前端UI | `site/app/import/ImportClient.tsx` | 生成issue内容 |
| 验证脚本 | `scripts/validate.mjs` | 验证skill符合schema |
| 中文文档 | `docs/importer.zh-CN.md` | 导入流程说明 |
| 英文文档 | `docs/importer.md` | 导入流程说明 |

---

## 8. 示例：完整的导入流程

### Step 1: 用户通过UI或手动创建Issue

```yaml
<!-- skillhub-import:v2
sourceRepo: https://github.com/example/my-skill
ref: v1.0.0
items:
  - sourcePath: .
    id: my-awesome-skill
    title: My Awesome Skill
    targetCategory: development
    tags: [automation, productivity]
-->
```

### Step 2: 维护者添加 `import-approved` 标签

### Step 3: CI/CD执行脚本，生成文件

**目录结构**:
```
skills/
  development/
    my-awesome-skill/
      .x_skill.yaml      # 自动生成
      SKILL.md           # 从源仓库复制
      (其他文件...)      # 从源仓库复制
```

**生成的 .x_skill.yaml**:
```yaml
specVersion: 2
id: my-awesome-skill
title: My Awesome Skill
description: (从SKILL.md自动提取)
category: development
tags:
  - automation
  - productivity
links:
  docs: ./SKILL.md
source:
  repo: https://github.com/example/my-skill
  path: .
  ref: v1.0.0
  syncedCommit: a1b2c3d4e5f6...
```

### Step 4: 脚本创建PR，维护者审核合并

---

## 修复历史

### 2024-XX-XX: Schema一致性修复

**问题**:
1. `specVersion` 生成 `1`，应为 `2`
2. 缺少必填字段 `category`
3. `source.commit` 应为 `source.syncedCommit`

**修复**:
- 更新 `scripts/import-from-issue.mjs` 生成正确的字段
- 移除不在schema中的 `createdAt` 和 `updatedAt` 字段
