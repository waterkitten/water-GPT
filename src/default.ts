export const defaultSetting = {
  continuousDialogue: true,
  archiveSession: false,
  openaiAPIKey: "",
  openaiAPITemperature: 60,
  systemRule: ""
}

export const defaultMessage = `
- 填入自己的 key 才可使用。
- 由 [OpenAI API (gpt-3.5-turbo)](https://platform.openai.com/docs/guides/chat) 和 [Vercel](http://vercel.com/) 提供支持。
- **Shift+Enter** 换行。开头输入 **/** 或者 **空格** 搜索 Prompt 预设。点击输入框滚动到底部。`
