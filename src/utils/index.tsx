import { Message, MessageContainer } from 'components/message'
import React from 'react'
import ReactDOM from 'react-dom'
import { Root, createRoot } from 'react-dom/client'

import { MessageContainerPrefixId } from '~/constants'
import { MessageInstance, MessageReturnType } from '~/interfaces'

const { version } = ReactDOM

const isServerSide = typeof window === 'undefined'
let containerNode: HTMLElement | null
let containerRoot: Root | null

const getContainerNode: () => Promise<[HTMLElement, Root | null]> = () => {
  // eslint-disable-next-line no-async-promise-executor
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

      containerRoot = createRoot($f)

      containerRoot.render(<MessageContainer />)

      document.body.appendChild($f)

      containerNode = document.getElementById(MessageContainerPrefixId)
      if (containerNode) {
        return resolve([containerNode, containerRoot])
      } else {
        const count = 0
        const getContainerNodeNextFrame = (count: number) => {
          if (count > 10) {
            return reject('getContainerNodeNextFrame try max times.')
          }
          requestAnimationFrame(() => {
            const $root = document.getElementById(MessageContainerPrefixId)
            if ($root) {
              containerNode = $root

              return resolve([$root, containerRoot])
            }
            getContainerNodeNextFrame(count + 1)
          })
        }

        return getContainerNodeNextFrame(count)
      }
    }
    return resolve([containerNode!, containerRoot!])
  })
}

// @ts-ignore

const message: MessageInstance = {}
;(['success', 'error', 'warn', 'info', 'loading'] as const).forEach((type) => {
  const is18 = version.startsWith('18')
  if (!is18) {
    throw new TypeError('react version low than 18 is not supported')
  }

  message[type] = (content, duration = 2500) => {
    return new Promise<MessageReturnType>((resolve) => {
      if (isServerSide) {
        return {
          // mock ssr server
          destory() {
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
        if (containerRoot) {
          root = createRoot(fragment)

          root.render(
            <Message type={type} duration={reallyduration} message={message} />,
          )
        }
        let isDestoryed = false
        const destory = () => {
          if (isDestoryed) {
            return false
          }

          root && root.unmount()

          requestAnimationFrame(() => {
            fragment.remove()
          })

          isDestoryed = true
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
