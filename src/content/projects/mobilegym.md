---
title: MobileGym Test Platform
subtitle: GUI Agent 测试与评测平台
category: 测试平台
projectType: 开源扩展
status: 阶段验证完成，持续演进
featured: true
order: 1
summary: 在开源移动仿真环境基础上扩展的测试与评测控制面：执行计划、串并行执行、版本配对比较与质量门禁，并用可复现的失败测试驱动修复。
highlights:
  - FastAPI + SQLite 控制面：项目 / 目标 / 工作流 / 执行配置管理
  - 不可变执行计划，串行与并行执行、取消与事件流
  - 版本配对比较与初始状态可比性检查
  - 失败诊断、报告聚合与质量门禁
flowSteps:
  - 计划：定义目标与工作流，生成不可变执行计划
  - 执行：串行或并行调度，事件流实时上报
  - 比较：版本配对对比，先做初始状态可比性检查
  - 报告：失败诊断与聚合报告，质量门禁给出结论
repository: https://github.com/zhusihan-python/mobilegym
publicSource: true
links:
  - label: 公开仓库（个人 fork，含平台扩展）
    href: https://github.com/zhusihan-python/mobilegym
  - label: 案例 evidence：多进程缺失结果（2026-07-11）
    href: https://github.com/zhusihan-python/mobilegym/blob/main/docs/test-platform/evidence/2026-07-11-tp-h01-multiprocess-missing-result.md
---

## 项目关系

MobileGym Test Platform 基于 Purewhiter/mobilegym 的移动仿真环境，在个人 fork 中扩展了测试与评测控制面。上游提供的仿真器、模拟应用、论文与 RL 结果不是我的原创工作；我做的部分是围绕它构建的执行、比较与评测基础设施。

## 关键实现

- **控制面服务**：FastAPI 接口 + SQLite 持久化，管理项目、目标、工作流与执行配置。
- **执行引擎**：不可变执行计划；支持串行与多进程并行执行、执行中取消、事件流上报终态。
- **评测比较**：版本配对比较，比较前先做初始状态可比性检查，避免拿不可比的运行直接对比。
- **质量与诊断**：失败诊断信息、报告聚合与质量门禁；仓库中包含 pytest 单元测试、前端测试与 E2E 记录，测试覆盖随功能扩展。

## 分析与验证案例：一个分片的结果类型与错误码不一致

多进程执行中出现一个分片缺失结果：合成崩溃结果的非取消返回被错误缩进到取消分支的 return 之后而不可达，缺失分片以 None 进入落库，同时套用了 `WORKER_CRASH` 错误码，持久化后出现 `outcome=FAIL`、`error_code=WORKER_CRASH` 的矛盾组合。我先写了一个会失败的测试来复现问题（结果类型期望 `ERROR`，实际落库 `FAIL`），确认根因后把非取消的规范错误返回移回可达的默认路径，落库修正为 `ERROR / WORKER_CRASH`，并连带验证 SQLite 落库、终态事件、报告聚合、重试选择四条链路在新语义下一致，同时保留取消语义不被破坏。该修复于 2026-07-11 完成验证并留下 evidence 文档。

真实模型接入的 Retry 流程同样有"发现问题 → 修复 → 复测"的记录，而不是只改代码不复验。

## 当前状态

- 平台已完成阶段性验证，仍在持续演进。
- 新的策略演进处于设计与契约阶段。
- 测试覆盖以仓库内实际测试为准。
