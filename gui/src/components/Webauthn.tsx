import { User, createUser, useUsers } from 'data/user'
import { ComponentProps } from 'react'
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
        <BareLogin />
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
  function onClick() {
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

      createUser(data as never).then(refetch)
    })
  }

  return (
    <Button onClick={onClick}>
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
  const login = () => {
    const publicKey = createCredentialPublicKey(user.user)
    const result = navigator.credentials.get({
      publicKey: {
        challenge: publicKey.challenge,
        rpId: publicKey?.rp?.id,
        allowCredentials: [
          {
            id: base64URL.decode(user.id),
            type: 'public-key',
            transports: ['usb', 'nfc', 'ble']
          }
        ]
      }
    })

    result.then((r) => {
      if (!r) {
        return
      }

      console.log(r)
    })
  }

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
        <Button onClick={login}>Login</Button>
      </div>
    </li>
  )
}

function Button(properties: ComponentProps<'button'>) {
  return (
    <button
      {...properties}
      className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
    />
  )
}

function BareLogin() {
  const login = () => {
    const publicKey = createCredentialPublicKey('')
    const result = navigator.credentials.get({
      publicKey: {
        challenge: publicKey.challenge,
        rpId: publicKey?.rp?.id,
        allowCredentials: []
      }
    })

    result.then((r) => {
      if (!r) {
        return
      }

      console.log(r)
    })
  }

  return <Button onClick={login}>Login</Button>
}
