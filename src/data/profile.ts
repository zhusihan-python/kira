// 站点统一身份信息：全站展示名、链接与经历统一从这里读取，避免多处散落。
// 姓名与工作经历根据本人提供的简历整理。
export interface ExperienceEntry {
  role: string;
  org: string;
  period: string;
  detail: string;
}

export const profile = {
  displayName: '朱思汉',
  github: 'https://github.com/zhusihan-python',
  siteName: '朱思汉 · 工程记录',
  role: '测试开发工程师',
  email: undefined as string | undefined,
  // 经历为空时关于页隐藏“经历”模块，不显示“待补充”。
  experience: [
    {
      role: '测试开发',
      org: 'Vortextech',
      period: '2026.08–2026.10',
      detail: '负责线上业务系统与后台管理系统测试。',
    },
    {
      role: '软件开发工程师',
      org: 'SpeCVT Technology (Hangzhou) Co., Ltd.',
      period: '2021.10–2026.05',
      detail: '负责上位机软件架构、数据库与 MCU 通信协议设计开发，参与开发、测试、部署及现场问题定位修复。',
    },
    {
      role: '测试开发工程师',
      org: 'ByteDance(Shanghai)',
      period: '2020.04–2021.10',
      detail: '开展广告样式组件功能与接口测试，落地 Python 精准测试，维护 Go 项目的精准测试 CI 集成与字段差异检查，参与测试流水线维护和线上问题响应。',
    },
    {
      role: '后端开发工程师',
      org: 'Hang Zhou Dipath Technology',
      period: '2017.11–2019.10',
      detail: '负责病理图像算法封装与 REST API 开发，开展 Windows Server / Linux 适配部署、接口联调及环境与数据管理。',
    },
    {
      role: '测试工程师',
      org: 'ZTESoft Guangzhou',
      period: '2014.09–2017.09',
      detail: '制定测试计划，编写用例并开展回归与缺陷跟踪，维护测试环境、数据库脚本并支持版本交付。',
    },
    {
      role: '项目经理',
      org: 'Changde Caixin Investment Guarantee',
      period: '2012.05–2014.02',
      detail: '早期职业经历：参与尽职调查、合同与放款跟进、银行协作及投后风险管理。',
    },
  ] satisfies ExperienceEntry[],
};
