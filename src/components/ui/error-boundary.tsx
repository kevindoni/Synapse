'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex items-center justify-center min-h-[200px] p-8">
          <div className="text-center space-y-3">
            <div className="text-destructive text-sm font-medium">Something went wrong</div>
            <p className="text-xs text-muted-foreground max-w-md">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
