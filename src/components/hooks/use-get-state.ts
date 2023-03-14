import { useEffect, useRef } from 'react'

export const useGetState = <T>(state: T) => {
  const ref = useRef(state)
  useEffect(() => {
    ref.current = state
  })
  return () => ref.current
}
