---
title: 从 .cc 到 MP4，怎样确认音视频都恢复了
date: "2026-11-10"
relatedProject: 音视频包恢复
sourceNote: 根据项目导出记录、音轨复核和同机基准整理
summary: 能读出时长不等于能播放，导出成功也不等于每个包都能解码。这次用 22 门课的导出记录复盘如何逐层验证。
---

## 文件结构与加密

这批 `.cc` 文件保留了可读的 MP4 索引。索引在 `moov` 里，像目录一样记录音视频包的位置、大小和时间。真正的媒体数据在 `mdat` 里，音视频包仍是密文。播放器能读出时长和编码格式，改后缀却播不了。

这批样本有两个层次。**区段**决定一组媒体包用哪一组解密参数，跨到下一段时参数会切换。**媒体包**才是播放器实际处理的单位，SzPlayer 在区段内逐包解密视频和音频。同一段里的画面和声音都要恢复，才有可播放的内容。

起初只凭扩展名和字节分布猜过 EVPlayer 和 AES。确认 SzPlayer 能正常播放后，才顺着它的媒体处理路径找到证据，并用独立模型验证这批样本确实按包做 RC4 处理。

## 三步看懂恢复过程

用三个虚构区段演示。先恢复缓存命中的 A 和 C，再补齐 B，最后把三段一起导出。

<figure class="media-demo">
  <figcaption data-media-caption aria-live="polite">1 / 3 · 缓存命中：先恢复 A 和 C，B 留待补齐。</figcaption>
  <div class="media-demo-row">
    <span class="media-demo-active"><strong>区段 A</strong><span data-media-status>缓存命中</span></span>
    <span><strong>区段 B</strong><span data-media-status>缺段</span></span>
    <span class="media-demo-active"><strong>区段 C</strong><span data-media-status>缓存命中</span></span>
  </div>
  <div class="media-demo-controls" hidden>
    <button type="button" data-media-previous aria-disabled="true">上一步</button>
    <button type="button" data-media-next aria-disabled="false">下一步</button>
  </div>
</figure>

## 缓存和离线恢复

先用已有播放缓存恢复能够确认的区段，再把缺段集中到一轮离线处理。最后将恢复出的 H.264 视频和 AAC 音频直接装进 MP4，无需重新编码。项目记录里，22 门课完整导出，共恢复了 1,279 个区段。

补播几段有时省不了多少时间。只要还有缺段，扫描何时结束就取决于最后一个结果出现在什么位置。这 22 门课实际扫过约 91%–100% 的候选范围。缓存补齐所有缺段时，可以直接进入导出。

## GPU 优化

最初用 C 在 CPU 上并行计算，并复用各候选共有的计算。后来用 Metal 把大批独立任务交给 GPU，CPU 同时处理剩余的小块。两边领取互不重叠的范围，共用一份进度记录，方便中断后继续。

最后一轮把 GPU 循环里重复的索引计算整理成固定周期，并将 CPU 并发从 14 调到 4。同一台机器、同一扫描范围内，吞吐从每秒 5.52 亿提高到 6.76 亿候选值，约快 22.5%，命中结果一致。这是两项改动一起测出的收益。

## 全片解码验收

其中一门课已经导出，音轨仍有 4 个坏包，都靠近区段末尾。定位并重新恢复这 4 个包后，整条音轨的 404,273 个音频包全部通过解码。

那次还发现 FFmpeg 打印了解码错误，退出码却是 `0`。所以最终验收会一起核对时长、音视频包数、全片解码的退出码和错误日志。能打开文件只能证明封装可读，逐包解码才能发现藏在中间的坏包。
