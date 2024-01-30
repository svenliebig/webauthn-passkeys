import { useEffect, useState } from 'react'

export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ')
}

// https://web.dev/articles/passkey-registration#feature_detection
export async function supportsWebauthn(): Promise<boolean> {
  if (
    window.PublicKeyCredential &&
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
    PublicKeyCredential.isConditionalMediationAvailable
  ) {
    // Check if user verifying platform authenticator is available.
    const results = await Promise.all([
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
      PublicKeyCredential.isConditionalMediationAvailable()
    ])

    if (results.every((r) => r === true)) {
      return true
    }
  }

  return false
}

export function useSupportsWebauthn() {
  const [supported, setSupportsWebauthn] = useState<boolean | null>(null)

  useEffect(() => {
    supportsWebauthn().then(setSupportsWebauthn)
  }, [supported])

  return supported
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return window.btoa(binary)
}

export function base64ToArrayBuffer(base64: string) {
  console.log('converting to array')
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  console.log('done')
  return bytes
}
