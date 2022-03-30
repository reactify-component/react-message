# React Message

![](https://cdn.jsdelivr.net/gh/Innei/fancy@master/2022/0113212709.png)

A simple asynchronous React message popup utility, no needed React Context. So you can use it in anywhere. You just need to install React.

Requirement:

- React 18
- React DOM 18

**NOTE: If you use React 17, please use version 0.2**

## How to use

```bash
npm i react-message-popup
```

```js
import { message } from 'react-message-popup'
message.success('成功', 4000)
// etc.

message.loading('Loading...', 4000).then(({ destory }) => {
  setTimeout(() => {
    destory()
    message.success('成功', 4000)
  }, 2000)
}
```

## Interface

```ts
export interface ArgsProps {
  content: string
  duration?: number | null
  key?: string | number
}
type JointContent = ConfigContent | ArgsProps
type ConfigContent = string
type ConfigDuration = number | (() => number)
export interface MessageInstance {
  info(
    content: JointContent,
    duration?: ConfigDuration,
  ): Promise<MessageReturnType>
  success(
    content: JointContent,
    duration?: ConfigDuration,
  ): Promise<MessageReturnType>
  error(
    content: JointContent,
    duration?: ConfigDuration,
  ): Promise<MessageReturnType>
  warning(
    content: JointContent,
    duration?: ConfigDuration,
  ): Promise<MessageReturnType>
  warn(
    content: JointContent,
    duration?: ConfigDuration,
  ): Promise<MessageReturnType>
  loading(
    content: JointContent,
    duration?: ConfigDuration,
  ): Promise<MessageReturnType>
}

export type MessageReturnType = {
  destory(): boolean
}
```
