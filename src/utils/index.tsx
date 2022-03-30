import { Message, MessageContainer } from 'components/message'
import React from 'react'
import ReactDOM from 'react-dom'
import type { Root, createRoot as __ } from 'react-dom/client'

import { MessageContainerPrefixId } from '~/constants'
import { MessageInstance, MessageReturnType } from '~/interfaces'

const { version } = ReactDOM

const is18 = version.startsWith('18')

const createRoot = (...rest: Parameters<typeof __>) => {
  if (is18) {
    return new Promise<ReturnType<typeof __>>((resolve) => {
      import('react-dom/client').then((mo) => {
        resolve(mo.createRoot(...rest))
      })
    })
  }
}

const isServerSide = typeof window === 'undefined'
let containerNode: HTMLElement | null
let containerRoot: Root | null

const getContainerNode: () => Promise<[HTMLElement, Root | null]> = () => {
  return new Promise<[HTMLElement, Root | null]>(async (resolve, reject) => {
    if (isServerSide) {
      return
    }
    if (!containerNode) {
      const $root = document.getElementById(MessageContainerPrefixId)
      if ($root) {
        containerNode = $root
        return resolve([$root, containerRoot])
      }
      const $f = document.createElement('div')
      $f.id = MessageContainerPrefixId

      if (is18) {
        containerRoot = (await createRoot($f))!

        containerRoot.render(<MessageContainer />)
      } else {
        ReactDOM.render(<MessageContainer />, $f)
      }

      document.body.appendChild($f)

      containerNode = document.getElementById(MessageContainerPrefixId)
      if (containerNode) {
        return resolve([containerNode, containerRoot])
      } else {
        requestAnimationFrame(() => {
          getContainerNode().then(resolve)
        })
      }
    }
    return resolve([containerNode!, containerRoot!])
  })
}

//@ts-ignore

const message: MessageInstance = {}
;(['success', 'error', 'warn', 'info', 'loading'] as const).forEach((type) => {
  message[type] = (content, duration = 2500) => {
    return new Promise<MessageReturnType>((resolve) => {
      if (isServerSide) {
        return {
          // mock ssr server
          destroy() {
            return true
          },
        }
      }

      requestAnimationFrame(async () => {
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
        const [container, containerRoot] = await getContainerNode()

        const fragment = document.createElement('div')

        let root: Root | null = null
        if (is18 && containerRoot) {
          root = (await createRoot(fragment))!

          root.render(
            <Message type={type} duration={reallyduration} message={message} />,
          )
        } else {
          ReactDOM.render(
            <Message type={type} duration={reallyduration} message={message} />,
            fragment,
          )
        }

        let isDestroyed = false
        const destory = () => {
          if (isDestroyed) {
            return false
          }
          if (is18) {
            root && root.unmount()
          } else {
            // react dom can not remove document fragment
            // NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
            ReactDOM.unmountComponentAtNode(fragment)
            container.removeChild(fragment)
          }

          isDestroyed = true
          return true
        }
        // because Infinity is 0 in timer
        if (reallyduration !== Infinity) {
          setTimeout(() => {
            destory()
            // 加 500ms 动画时间
          }, reallyduration + 500)
        }

        requestAnimationFrame(() => {
          container.appendChild(fragment)
        })

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
