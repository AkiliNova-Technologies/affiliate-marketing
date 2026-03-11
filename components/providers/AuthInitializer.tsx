"use client"

import { useEffect, useRef } from "react"
import { useAppDispatch } from "@/redux/hooks"
import { checkAuth, loadUserFromStorage } from "@/redux/slices/authSlice"
import { attemptSilentRefresh, getAccessToken } from "@/utils/api"

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      dispatch(loadUserFromStorage())

      if (getAccessToken()) {
        dispatch(checkAuth())
        return
      }

      const refreshed = await attemptSilentRefresh()

      if (refreshed) {
        dispatch(checkAuth())
      } else {
        dispatch({ type: "auth/checkAuth/rejected", payload: "Not authenticated" })
      }
    }

    init()
  }, [dispatch])

  return <>{children}</>
}