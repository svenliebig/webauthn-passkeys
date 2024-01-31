import { User, createUser, useUsers } from 'data/user'
import { ComponentProps, useState } from 'react'
import { arrayBufferToBase64, useSupportsWebauthn } from 'utils'
import { base64URL } from 'utils/base'

export function Webauthn() {
  const { refetch, users } = useUsers()
  const supported = useSupportsWebauthn()

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        {supported && (
          <CreatePasskeyButton username="jonsnow" refetch={refetch} />
        )}
        {supported && (
          <CreatePasskeyButton username="pikachu" refetch={refetch} />
        )}
        {supported && (
          <CreatePasskeyButton username="bowser" refetch={refetch} />
        )}
        <LoginButton />
      </div>

      <Users users={users} refetch={refetch} />
    </>
  )
}

declare global {
  interface Credential {
    rawId: ArrayBuffer
    response: {
      clientDataJSON: ArrayBuffer
      attestationObject: ArrayBuffer
      getPublicKey: () => ArrayBuffer | null
      getTransports: () => string[]
      getPublicKeyAlgorithm: () => string
      getAuthenticatorData: () => ArrayBuffer
      signature: ArrayBuffer
      userHandle: ArrayBuffer
    }
  }
}

// https://w3c.github.io/webauthn/#iface-authenticatorattestationresponse

function CreatePasskeyButton({
  username,
  refetch
}: {
  username: string
  refetch: () => void
}) {
  const [loading, setLoading] = useState(false)

  function onClick() {
    setLoading(true)
    const publicKey = createCredentialPublicKey(username)
    const result = navigator.credentials.create({ publicKey })

    result.then((r) => {
      if (!r) {
        return
      }

      const { response, id } = r

      const publicKey = response.getPublicKey()

      const data = {
        id,
        user: username,
        publicKey: publicKey ? arrayBufferToBase64(publicKey) : null
      }

      createUser(data as never)
        .then(refetch)
        .finally(() => setLoading(false))
    })
  }

  return (
    <Button loading={loading} onClick={onClick}>
      Create Passkey <i>({username})</i>
    </Button>
  )
}

function createCredentialPublicKey(
  username: string
): Required<CredentialCreationOptions>['publicKey'] {
  return {
    challenge: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
    rp: {
      name: 'Webauthn Passkeys',
      id: 'localhost'
    },
    user: {
      id: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
      displayName: username,
      name: username
    },
    pubKeyCredParams: [
      {
        type: 'public-key',
        alg: -7
      },
      { alg: -257, type: 'public-key' }
    ]
  }
}

function Users({
  refetch,
  users
}: {
  users: Array<User>
  refetch: () => void
}) {
  if (users.length === 0) {
    return
  }

  return (
    <>
      <h2
        className="my-3 text-2xl font-bold tracking-tight text-gray-900"
        onClick={refetch}
      >
        Users
      </h2>
      <ul className="flex w-1/2 flex-col gap-3">
        {users.map((user) => (
          <UserListItem key={user.id} user={user} />
        ))}
      </ul>
    </>
  )
}

function UserListItem({ user }: { user: User }) {
  return (
    <li className="flex items-center rounded-lg border border-solid border-gray-400 p-3 shadow-lg">
      <div className="grow">
        <h3 className="font-bold text-gray-900">{user.user}</h3>
        <p className="text-ellipsis">
          <strong>ID:</strong> {user.id}
        </p>
        <p className="w-96 overflow-hidden text-ellipsis text-nowrap">
          <strong>Key:</strong> {user.publicKey}
        </p>
      </div>
      <div>
        <LoginButton userId={user.id} />
      </div>
    </li>
  )
}

function Button({
  children,
  loading,
  ...properties
}: ComponentProps<'button'> & { loading?: boolean }) {
  return (
    <button
      {...properties}
      className="flex flex-row text-nowrap rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
    >
      {loading ? (
        <svg className="mr-3 size-5 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : null}
      {children}
    </button>
  )
}

function LoginButton({ userId }: { userId?: string }) {
  const [loading, setLoading] = useState(false)

  const login = () => {
    setLoading(true)

    const publicKey = createCredentialPublicKey('')

    const result = navigator.credentials.get({
      publicKey: {
        // TODO get challenge from server
        challenge: publicKey.challenge,
        rpId: publicKey?.rp?.id,
        allowCredentials: userId
          ? [
              {
                id: base64URL.decode(userId),
                type: 'public-key',
                transports: ['usb', 'nfc', 'ble']
              }
            ]
          : []
      }
    })

    result
      .then((r) => {
        if (!r) {
          return
        }

        console.log(r.response.signature)
        console.log(base64URL.encode(r.response.signature))

        // TODO send to server to verify
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Button loading={loading} onClick={login}>
      Login
    </Button>
  )
}
