export interface ArgsProps {
  content: string
  duration?: number | null
  key?: string | number
}
type JointContent = ConfigContent | ArgsProps
type ConfigContent = string
type ConfigDuration = number | (() => number)
export interface MessageInstance {
  info(content: JointContent, duration?: ConfigDuration): MessageReturnType
  success(content: JointContent, duration?: ConfigDuration): MessageReturnType
  error(content: JointContent, duration?: ConfigDuration): MessageReturnType
  warning(content: JointContent, duration?: ConfigDuration): MessageReturnType
  warn(content: JointContent, duration?: ConfigDuration): MessageReturnType
  loading(content: JointContent, duration?: ConfigDuration): MessageReturnType
}

export type MessageReturnType = Promise<{
  destory(): boolean
}>
