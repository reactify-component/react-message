import { Message, MessageContainer } from 'components/message'
import React from 'react'
import ReactDOM from 'react-dom'
import { MessageContainerPrefixId } from '~/constants'
import { MessageInstance, MessageReturnType } from '~/interfaces'

const isServerSide = typeof window === 'undefined'
let containerNode: HTMLElement | null
// @ts-ignore
const getContainerNode: () => HTMLElement = () => {
  if (isServerSide) {
    return
  }
  if (!containerNode) {
    const $root = document.getElementById(MessageContainerPrefixId)
    if ($root) {
      containerNode = $root
      return $root
    }
    const $f = document.createDocumentFragment()
    ReactDOM.render(<MessageContainer />, $f)
    document.body.appendChild($f)

    containerNode = document.getElementById(MessageContainerPrefixId)
    return containerNode
  }
  return containerNode
}

//@ts-ignore

const message: MessageInstance = {}
;(['success', 'error', 'warn', 'info', 'loading'] as const).forEach((type) => {
  message[type] = (content, duration = 2500) => {
    return new Promise<Awaited<MessageReturnType>>((resolve) => {
      if (isServerSide) {
        return {
          // mock ssr server
          destroy() {
            return true
          },
        }
      }

      requestAnimationFrame(() => {
        let message: string
        const configDuration =
          typeof content === 'string' ? duration : content.duration ?? duration
        const reallyduration =
          typeof configDuration === 'function'
            ? configDuration()
            : configDuration
        if (typeof content === 'string') {
          message = content
        } else {
          message = content.content
        }
        if (!message) {
          throw new Error('message content is required')
        }
        const container = getContainerNode()

        const fragment = document.createElement('div')

        ReactDOM.render(
          <Message type={type} duration={reallyduration} message={message} />,
          fragment,
        )

        let isDestroyed = false
        const destory = () => {
          if (isDestroyed) {
            return false
          }
          // react dom can not remove document fragment
          // NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
          ReactDOM.unmountComponentAtNode(fragment)
          container.removeChild(fragment)
          isDestroyed = true
          return true
        }
        setTimeout(() => {
          destory()
          // 加 500ms 动画时间
        }, reallyduration + 500)
        container.appendChild(fragment)

        resolve({
          destory,
        })
      })
    })
  }
})
Object.defineProperty(message, 'warning', {
  get() {
    return message.warn
  },
})
export { message }
if ('window' in globalThis) {
  // @ts-ignore
  window.message = message
}
