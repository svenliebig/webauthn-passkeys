import { useState, useEffect } from 'react'

export async function fetchUsers() {
  const response = await fetch('http://localhost:3000/users')
  return response.json() as unknown as Array<User>
}

export async function createUser(data: never) {
  await fetch('http://localhost:3000/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}

export type User = {
  user: string
  id: string
  publicKey: string
}

export function useUsers() {
  const [users, setUsers] = useState<Array<User>>([])
  const [loading, setLoading] = useState(false)

  const refetch = () => {
    setLoading(true)
    fetchUsers().then((users) => {
      setUsers(users)
      setLoading(false)
    })
  }

  useEffect(() => {
    refetch()
  }, [])

  return {
    refetch,
    users,
    loading
  }
}
