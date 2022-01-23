import React, { FC, useEffect, useRef } from 'react'
import { MessageContainerPrefixId } from '~/constants'
import {
  FaSolidCheckCircle,
  FaSolidExclamationCircle,
  FaSolidInfoCircle,
  FaSolidTimesCircle,
  LoadingIcon,
} from '../icons'
// @ts-ignore
import styles from './index.module.css'

interface MessageProps {
  type: 'success' | 'warn' | 'error' | 'info' | 'loading'
  message: string
  duration?: number
}

const Icon = {
  success: <FaSolidCheckCircle />,
  error: <FaSolidTimesCircle />,
  info: <FaSolidInfoCircle />,
  warn: <FaSolidExclamationCircle />,
  loading: <LoadingIcon className={styles['rotate']} />,
}
export const Message: FC<MessageProps> = (props) => {
  const { type, message, duration } = props

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

  return (
    <div className={styles['wrap']}>
      <div className={styles['inner-wrap']} ref={wrapRef}>
        <div className={styles['icon']}>{Icon[type]}</div>
        <div className={styles['message']}>
          <span>{message}</span>
        </div>
      </div>
    </div>
  )
}

export const MessageContainer = () => {
  return (
    <div className={styles['container']} id={MessageContainerPrefixId}></div>
  )
}
