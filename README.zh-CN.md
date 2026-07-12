# Benchmark Atlas

一个面向 LLM benchmark、模型发布对比、独立排行榜和论文图表的组件库。
它强调来源可追溯、图表语法去重、结构化数据驱动和可维护扩展，而不是收集截图。

[在线组件库](https://aidennovak.github.io/llm-benchmark-atlas/) ·
[组件契约](docs/COMPONENT_CONTRACT.md) ·
[来源清单](research/SOURCES.md)

## 当前能力

- 48 个实时 SVG 组件
- 48 个互不重复的图表语法、renderer 和视觉系统编号
- 27 个厂商、榜单、实验室与论文来源谱系
- 8 个图表家族
- 搜索、图表家族/来源/组织筛选、详情放大、JSON 查看、SVG 导出
- 稳定的查询/渲染/扩展注册 API 与机器可读 catalog JSON
- 自动拒绝重复语法、缺失来源、无障碍信息缺失和无效 SVG

仅替换颜色、厂商名、benchmark 名或图片格式，不算新组件。

## 本地运行

```bash
git clone https://github.com/AidenNovak/llm-benchmark-atlas.git
cd llm-benchmark-atlas
npm run validate
npm run serve
```

打开 <http://127.0.0.1:4173/library/>。

## 组件收录门槛

1. 必须给出厂商一手页面、独立榜单或论文来源。
2. 必须说明它最适合讲哪一种 benchmark 故事。
3. 必须拥有新的图表语法、视觉系统编号和纯 SVG renderer。
4. 示意数据必须清晰标注；真实数据必须版本化并保留测试条件。
5. 必须通过自动校验和桌面/移动端视觉验收。

详见 [CONTRIBUTING.md](CONTRIBUTING.md)、[架构说明](docs/ARCHITECTURE.md)
和 [路线图](docs/ROADMAP.md)。

## 声明

本项目与目录中出现的模型厂商、benchmark 组织和研究实验室均无隶属或背书关系。
预览分数均标记为 `DEMO DATA`，用于展示组件结构，不是最新榜单结果。
