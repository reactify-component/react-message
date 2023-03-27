import {
  Message,
  MessageContainer,
  MessageInstanceRef,
  MessageType,
} from 'components/message'
import React from 'react'
import ReactDOM from 'react-dom'
import { Root, createRoot } from 'react-dom/client'

import { MessageContainerPrefixId } from '~/constants'
import { MessageInstance, MessageReturnType } from '~/interfaces'

const { version } = ReactDOM

const isServerSide = () => typeof window === 'undefined'
let containerNode: HTMLElement | null
let containerRoot: Root | null

const getContainerNode: () => Promise<[HTMLElement, Root | null]> = () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<[HTMLElement, Root | null]>(async (resolve, reject) => {
    if (isServerSide()) {
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

const message$: MessageInstance = {}
;(['success', 'error', 'warn', 'info', 'loading'] as const).forEach((type) => {
  const is18 = version.startsWith('18')
  if (!is18) {
    throw new TypeError('react version low than 18 is not supported')
  }

  message$[type] = (content, duration = 2500) => {
    return new Promise<MessageReturnType>((resolve) => {
      if (isServerSide()) {
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
        const realDuration =
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
        let ins: MessageInstanceRef | null = null

        if (containerRoot) {
          root = createRoot(fragment)

          root.render(
            <Message
              type={type}
              duration={realDuration}
              message={message}
              getInstance={($) => {
                ins = $
              }}
            />,
          )
        }
        let isDestroyed = false
        const destory = () => {
          if (isDestroyed) {
            return false
          }

          root?.unmount()

          requestAnimationFrame(() => {
            fragment.remove()
          })

          isDestroyed = true
          return true
        }

        const setTimer = () => {
          return setTimeout(() => {
            destory()
            // 加 500ms 动画时间
          }, realDuration + 500)
        }

        let timerId: ReturnType<typeof setTimeout> | null = null
        // because Infinity is 0 in timer
        if (realDuration !== Infinity) {
          timerId = setTimer()
        }

        requestAnimationFrame(() => {
          container.appendChild(fragment)
        })

        const getInstance = () => {
          return new Promise<MessageInstanceRef>((resolve) => {
            requestAnimationFrame(() => {
              resolve(ins!)
            })
          })
        }

        resolve({
          destory,
          next(content: string, newType?: MessageType) {
            if (timerId) {
              clearTimeout(timerId)
            }
            getInstance().then((ins) => {
              if (ins.isMount()) {
                ins.next(content, newType)
                timerId = setTimer()
              } else {
                message$[newType || type](content, realDuration)
              }
            })
          },
        })
      })
    })
  }
})
Object.defineProperty(message$, 'warning', {
  get() {
    return message$.warn
  },
})
export { message$ as message }
if ('window' in globalThis) {
  // @ts-ignore
  window.message = message$
}
