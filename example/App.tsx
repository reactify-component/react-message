import React from 'react'
import { message } from '~'

export default function () {
  return (
    <div
      className="m-auto bottom-0"
      style={{
        position: 'absolute',
        minHeight: '100vh',
        width: 'calc(100vw - 16px)',
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div className="px-4 d-grid gap-3 text-center pb-5">
        <h1 className="mb-4">React Message Demo</h1>
        <button
          type="button"
          className="btn btn-success"
          onClick={async () => {
            message.success('成功', 4000)
          }}
        >
          Success
        </button>

        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            message.error('失败了', 4000)
          }}
        >
          Error
        </button>
        <button
          type="button"
          className="btn btn-warning"
          onClick={() => {
            message.warn('警告⚠️', 4000)
          }}
        >
          Warning
        </button>
        <button
          type="button"
          className="btn btn-info"
          onClick={() => {
            message.info('小提示~', 4000)
          }}
        >
          Info
        </button>

        <button
          type="button"
          className="btn btn-light"
          onClick={() => {
            message.loading('Loading...', 4000).then(({ destory }) => {
              setTimeout(() => {
                destory()
                message.success('成功', 4000)
              }, 2000)
            })
          }}
        >
          Loading
        </button>

        <button
          type="button"
          className="btn btn-light"
          onClick={() => {
            message.info(
              'Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.Too long Too simple.',
              Infinity,
            )
          }}
        >
          Too long message.
        </button>

        <div className="row">
          <div className="col-sm">
            <button
              type="button"
              className="btn btn-success"
              onClick={async () => {
                const { next } = await message.success('欢迎光临~', 4000)
                setTimeout(() => {
                  next('你是今天第 1 个访问的人，欢迎你的到来~')
                }, 1000)
              }}
            >
              Text switching 1
            </button>
          </div>
          <div className="col-sm">
            <button
              type="button"
              className="btn btn-warning"
              onClick={async () => {
                const { next } = await message.loading(
                  '你是今天第 1 个访问的人，欢迎你的到来~',
                  4000,
                )
                setTimeout(() => {
                  next('玩得愉快！', 'success')
                }, 1000)
              }}
            >
              Text switching 2
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-sm">
            <button
              type="button"
              className="btn btn-warning"
              onClick={async () => {
                const { next } = await message.success(
                  '你是今天第 1 个访问的人，欢迎你的到来~你是今天第 1 个访问的人，欢迎你的到来~你是今天第 1 个访问的人，欢迎你的到来~你是今天第 1 个访问的人，欢迎你的到来~你是今天第 1 个访问的人，欢迎你的到来~',
                  4000,
                )
                setTimeout(() => {
                  next('玩得愉快！')
                }, 1000)
              }}
            >
              Text switching 3
            </button>
          </div>

          <div className="col-sm">
            <button
              type="button"
              className="btn btn-warning"
              onClick={async () => {
                const { next } = await message.success(
                  '你是今天第 1 个访问的人，',
                  4000,
                )
                setTimeout(() => {
                  next(
                    '玩得愉快！欢迎你的到来~你是今天第 1 个访问的人，欢迎你的到来~你是今天第 1 个访问的人，欢迎你的到来~你是今天第 1 个访问的人，欢迎你的到来~你是今天第 1 个访问的人，欢迎你的到来~',
                  )
                }, 1000)
              }}
            >
              Text switching 4
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
