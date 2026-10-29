---
title: 执行器崩溃，为什么变成了测试失败？
date: "2026-07-11"
relatedProject: mobilegym
sourceNote: 基于项目公开 evidence 文档整理（验证记录日期 2026-07-11）
summary: 多进程执行中一个分片缺失结果，落库出现 outcome=FAIL 与 error_code=WORKER_CRASH 的矛盾组合——结果类型与错误码不一致。根因是非取消返回被错误缩进到取消分支的 return 之后而不可达，故障被当成了测试失败。
---

## 现象

MobileGym 平台的一次多进程执行后，聚合报告里有一个分片"缺失结果"。跟踪 SQLite 落库发现，这个分片的结果类型（outcome）是 `FAIL`，错误码（error_code）却是 `WORKER_CRASH`——结果类型与错误码不一致。执行器明明是崩溃了，为什么结果类型被落成了测试失败？

## 定位

`_synthetic_crash_result()` 在取消场景返回取消结果，但非取消场景的返回被错误缩进到取消分支的 `return` 之后，实际不可达。于是在非取消的分片结果缺失场景里，它向落库传入了 `None`，调用方又照常套用 `WORKER_CRASH` 错误码覆盖——`None` 结果落库后结果类型成了 `FAIL`，与错误码组合成矛盾状态。取消分支本身没有问题。

## 验证

先写一个会失败的测试复现问题：用真实多进程适配器构造分片崩溃、结果缺失的场景，断言落库结果。测试如预期失败——结果类型期望 `ERROR`，实际观察到 `FAIL`，与现象一致，定位到的不可达返回即根因。把该返回移回可达路径后，测试通过。

## 修复

把已有的非取消规范错误返回移到可达的默认返回路径，取消分支保持不变，落库结果类型修正为 `ERROR`：基础设施故障归 `ERROR`，测试失败才归 `FAIL`。修复不是只改返回值——用两个分片的真实多进程场景验证精确的 `1 PASS + 1 ERROR`，断言 SQLite 落库、`episode.error` 终态事件、聚合报告与 `retry_error` 选择四条链路在新分类下语义一致，并单独确认取消场景仍落 `CANCELLED`。

```text
# 缩进/控制流的简化示意（非原始代码）
# 修复前
def synthetic_crash_result(cancelled):
    if cancelled:
        return cancelled_result()
        return worker_crash_result()   # 缩进在取消分支内、位于其 return 之后，不可达；
                                       # 非取消场景隐式返回 None
# 修复后
def synthetic_crash_result(cancelled):
    if cancelled:
        return cancelled_result()
    return worker_crash_result()       # 移回分支外可达的默认路径
```

## 回归

复现测试保留在回归集中。据 2026-07-11 的验证记录，该修复验证时平台全量回归 267 项通过。修复的完整证据在公开 evidence 文档中。

## 范围

这个案例的结论适用于该平台的执行结果合成链路，不外推到其他执行框架。它提醒的是一类通用问题：**缩进让默认返回不可达时，函数会隐式返回 None，并带着下游套用的错误码一起落库**——调整分支结构后，先确认每条路径的返回都真的可达。
