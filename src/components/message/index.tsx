import React, {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { MessageContainerPrefixId } from '~/constants'

import { useGetState } from '../hooks/use-get-state'
import {
  FaSolidCheckCircle,
  FaSolidExclamationCircle,
  FaSolidInfoCircle,
  FaSolidTimesCircle,
  LoadingIcon,
} from '../icons'
// @ts-ignore
import styles from './index.module.css'

export interface MessageInstanceRef {
  next(message: string, type?: MessageType): void

  isMount: () => boolean
}
export type MessageType = 'success' | 'warn' | 'error' | 'info' | 'loading'

interface MessageProps {
  type: MessageType
  message: string
  duration?: number

  getInstance?: (ins: MessageInstanceRef) => void
}

const Icon = {
  success: <FaSolidCheckCircle />,
  error: <FaSolidTimesCircle />,
  info: <FaSolidInfoCircle />,
  warn: <FaSolidExclamationCircle />,
  loading: <LoadingIcon className={styles['rotate']} />,
}
export const Message: FC<MessageProps> = forwardRef((props, ref) => {
  const { type, message: originalMessage, duration, getInstance } = props
  const [currentMessage, setCurrentMessage] = useState(originalMessage)
  const [currentIconType, setCurrentIconType] = useState(type)
  const [nextMessage, setNextMessage] = useState<string | null>(null)
  const [nextIconType, setNextIconType] = useState<undefined | MessageType>()
  const [currentWrapWidth, setCurrentWrapWidth] = useState<undefined | number>(
    undefined,
  )
  const [currentWrapHeight, setCurrentWrapHeight] = useState<
    undefined | number
  >(undefined)
  // const previousWidth = usePrevious(currentWrapWidth)

  const wrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!wrapRef.current || duration === Infinity) {
        return
      }
      wrapRef.current.classList.add(styles['disappear'])
    }, duration || 2500)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  const getCurrentMessage = useGetState(currentMessage)
  const getCurrentIconType = useGetState(currentIconType)
  const getNextMessage = useGetState(nextMessage)
  const getNextIconType = useGetState(nextIconType)

  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const instanceMethodsRef = useRef<MessageInstanceRef>({
    next(message, type) {
      if (message === getCurrentMessage() && type === getCurrentIconType())
        return
      setNextMessage(message)
      setNextIconType(type)
    },

    isMount: () => isMounted.current,
  })

  useEffect(() => {
    if (!getInstance) return
    getInstance(instanceMethodsRef.current)
  }, [getInstance])

  useImperativeHandle(ref, () => instanceMethodsRef.current)

  const fakeHolderRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (getCurrentMessage() === nextMessage) {
      return
    }

    const $ = fakeHolderRef.current as HTMLDivElement

    requestAnimationFrame(() => {
      const rect = $.getBoundingClientRect()

      setCurrentWrapWidth(rect.width)
      setCurrentWrapHeight(rect.height)
    })
  }, [nextMessage])

  const [isTextTransition, setIsTextTransition] = useState(false)

  const messageRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!wrapRef.current) return
    const $wrap = wrapRef.current
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const $message = messageRef.current!

    $wrap.ontransitionstart = () => {
      setIsTextTransition(true)
    }
    $wrap.ontransitionend = () => {
      setIsTextTransition(false)

      const nextMessage = getNextMessage()
      const nextIconType = getNextIconType()
      if (nextMessage) {
        setCurrentMessage(nextMessage)
        setNextMessage(null)
      }
      if (nextIconType) {
        setCurrentIconType(nextIconType)
        setNextIconType(undefined)
      }
    }

    $message.ontransitionstart = (e) => e.stopPropagation()
    $message.ontransitionend = (e) => e.stopPropagation()

    return () => {
      $wrap.ontransitionstart = null
      $wrap.ontransitionend = null

      $message.ontransitionstart = null
      $message.ontransitionend = null
    }
  }, [])

  return (
    <>
      <div className={styles['wrap']}>
        <div
          className={styles['inner-wrap']}
          style={{
            width: currentWrapWidth,
            height: currentWrapHeight,
          }}
          ref={wrapRef}
        >
          <div
            className={`${styles['icon']} ${
              isTextTransition ? styles['op-transition'] : ''
            }`}
          >
            {Icon[currentIconType]}
          </div>
          <div
            className={`${styles['message']} ${
              isTextTransition ? styles['text-transition'] : ''
            }`}
            ref={messageRef}
          >
            <span>{currentMessage}</span>
          </div>
        </div>
      </div>

      <div className={`${styles['wrap']} ${styles['hidden']}`}>
        <div className={styles['inner-wrap']} ref={fakeHolderRef}>
          <div className={styles['icon']}>{Icon[type]}</div>
          <div className={styles['message']}>
            <span>{nextMessage || currentMessage}</span>
          </div>
        </div>
      </div>
    </>
  )
})

export const MessageContainer = () => {
  return (
    <div className={styles['container']} id={MessageContainerPrefixId}></div>
  )
}
