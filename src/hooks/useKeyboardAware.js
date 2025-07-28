import { useState, useEffect } from 'react'

/**
 * Custom hook for handling virtual keyboard events and viewport adjustments
 * Detects keyboard show/hide on mobile devices and provides dynamic height calculations
 */
export const useKeyboardAware = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)
  const [availableHeight, setAvailableHeight] = useState(window.innerHeight)

  useEffect(() => {
    let initialViewportHeight = window.innerHeight
    let initialVisualViewportHeight = window.visualViewport?.height || window.innerHeight

    const handleResize = () => {
      const currentHeight = window.innerHeight
      const visualHeight = window.visualViewport?.height || currentHeight
      
      setViewportHeight(currentHeight)
      
      // Detect keyboard based on significant height reduction
      const heightDifference = initialVisualViewportHeight - visualHeight
      const isKeyboardVisible = heightDifference > 150 // Threshold for keyboard detection
      
      setKeyboardVisible(isKeyboardVisible)
      setKeyboardHeight(isKeyboardVisible ? heightDifference : 0)
      setAvailableHeight(visualHeight)
    }

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const visualHeight = window.visualViewport.height
        const heightDifference = initialVisualViewportHeight - visualHeight
        const isKeyboardVisible = heightDifference > 150

        setKeyboardVisible(isKeyboardVisible)
        setKeyboardHeight(isKeyboardVisible ? heightDifference : 0)
        setAvailableHeight(visualHeight)
      }
    }

    // Listen to both window resize and visual viewport change
    window.addEventListener('resize', handleResize)
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange)
    }

    // Initial check
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange)
      }
    }
  }, [])

  // Calculate dynamic heights for modals
  const getModalStyles = () => {
    if (keyboardVisible) {
      return {
        maxHeight: `${availableHeight * 0.9}px`,
        transform: 'translate(-50%, -50%)',
        top: `${availableHeight * 0.5}px`,
        left: '50%',
        position: 'fixed'
      }
    }
    
    return {
      maxHeight: '80vh',
      transform: 'translate(-50%, -50%)',
      top: '50%',
      left: '50%',
      position: 'fixed'
    }
  }

  // Get appropriate viewport height unit
  const getViewportHeightUnit = () => {
    // Use dynamic viewport height (dvh) if supported, fallback to vh
    if (CSS.supports('height', '100dvh')) {
      return 'dvh'
    }
    return 'vh'
  }

  return {
    keyboardVisible,
    keyboardHeight,
    viewportHeight,
    availableHeight,
    getModalStyles,
    getViewportHeightUnit,
    // Helper functions
    isKeyboardDetectionSupported: typeof window !== 'undefined' && 'visualViewport' in window,
    // CSS custom properties for dynamic height
    cssCustomProperties: {
      '--keyboard-aware-height': `${availableHeight}px`,
      '--keyboard-height': `${keyboardHeight}px`,
      '--viewport-height': `${viewportHeight}px`
    }
  }
}

/**
 * Hook specifically for modal/dialog positioning with keyboard awareness
 */
export const useModalKeyboardAware = () => {
  const keyboardData = useKeyboardAware()
  
  const getModalContainerStyles = () => {
    const baseStyles = {
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'grid',
      placeItems: 'center',
      padding: '1rem'
    }

    if (keyboardData.keyboardVisible) {
      return {
        ...baseStyles,
        alignItems: 'start',
        paddingTop: '2rem',
        height: `${keyboardData.availableHeight}px`,
        top: 0
      }
    }

    return baseStyles
  }

  const getModalContentStyles = () => {
    const baseStyles = {
      width: '100%',
      maxWidth: 'calc(100% - 2rem)',
      position: 'relative'
    }

    if (keyboardData.keyboardVisible) {
      return {
        ...baseStyles,
        maxHeight: `${keyboardData.availableHeight - 100}px`,
        overflowY: 'auto'
      }
    }

    return {
      ...baseStyles,
      maxHeight: '80vh',
      overflowY: 'auto'
    }
  }

  return {
    ...keyboardData,
    getModalContainerStyles,
    getModalContentStyles
  }
}