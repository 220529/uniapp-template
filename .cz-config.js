module.exports = {
  types: [
    { value: 'feat', name: '✨ feat:     新功能' },
    { value: 'fix', name: '🐛 fix:      修复bug' },
    { value: 'docs', name: '📝 docs:     文档变更' },
    { value: 'style', name: '💄 style:    代码格式（不影响代码运行）' },
    { value: 'refactor', name: '♻️ refactor: 重构（既不是新功能也不是修复bug）' },
    { value: 'perf', name: '⚡ perf:     性能优化' },
    { value: 'test', name: '✅ test:     添加测试' },
    { value: 'chore', name: '🔧 chore:    构建过程或辅助工具的变动' },
    { value: 'ci', name: '👷 ci:       CI配置文件和脚本的变更' },
    { value: 'build', name: '📦 build:    影响构建系统或外部依赖的更改' },
    { value: 'revert', name: '⏪ revert:   回滚之前的commit' },
  ],

  messages: {
    type: '选择提交类型:',
    subject: '写一个简短的变化描述:',
    confirmCommit: '确认提交?',
  },

  skipQuestions: ['scope', 'body', 'breaking', 'footer'],
  subjectLimit: 100,
};
