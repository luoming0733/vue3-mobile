/**
 * @type {import('cz-customizable').Options}
 */
module.exports = {
  types: [
    {value:'init', name: 'init:     项目初始化' },
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'fix', name: 'fix:      修复bug' },
    { value: 'docs', name: 'docs:     文档变更' },
    { value: 'req', name: 'req:      修改需求(需求变更导致代码修改)' },
    { value: 'style', name: 'style:    代码格式（不影响功能，例如空格、分号等格式修正）' },
    { value: 'refactor', name: 'refactor: 重构（即不是新增功能，也不是修改bug的代码变动）' },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'test', name: 'test:     增加测试' },
    { value: 'build', name: 'build:    依赖相关的内容' },
    { value: 'ci', name: 'ci:       CI配置相关，例如对k8s，docker的配置文件的修改' },
    { value: 'chore', name: 'chore:    改变构建流程、或者增加依赖库、工具等' },
    { value: 'revert', name: 'revert:   回滚到上一个版本' }
  ],
  messages: {
    type: '确保本次提交遵循 Angular 规范！\n选择你要提交的类型：',
    scope: '\n选择一个 scope（可选）：',
    customScope: '请输入自定义的 scope：',
    subject: '填写简短精炼的变更描述：\n',
    body: '填写更加详细的变更描述（可选）。使用 "|" 换行：\n',
    breaking: '列举非兼容性重大的变更（可选）：\n',
    footer: '列举出所有变更的 ISSUES CLOSED（可选）。 例如: #31, #34：\n',
    confirmCommit: '确认提交？'
  },
  allowBreakingChanges: ['feat', 'fix'],
  subjectLimit: 100,
  breaklineChar: '|'
}
