import { createContext, useContext, useEffect, useState } from "react"
import LoadingModal from "../Components/LoadingModal"
import { loadingStore } from "../stores/loadingstore"



const LoadingContext = createContext()

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)

  // 🔥 จุดสำคัญที่สุด
  useEffect(() => {
    loadingStore.set(setLoading)
  }, [])

  return (
    <LoadingContext.Provider value={{ loading }}>
      {children}
      <LoadingModal />
    </LoadingContext.Provider>
  )
}

export const useLoading = () => useContext(LoadingContext)
