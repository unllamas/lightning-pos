declare global {
  interface Window {
    Android?: {
      print: (orderJson: string) => void
    }
  }
}

export {}
