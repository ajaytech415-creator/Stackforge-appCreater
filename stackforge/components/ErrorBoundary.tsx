'use client'
import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface State { hasError: boolean; error?: Error }
interface Props { children: ReactNode }

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error } }
  override componentDidCatch(error: Error, info: unknown) { console.error('ErrorBoundary caught', error, info) }
  reset = () => this.setState({ hasError: false, error: undefined })
  override render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <svg className="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
          <p className="mt-2 text-sm text-white/50">{this.state.error?.message ?? 'Unexpected error'}</p>
          <Button className="mt-6" onClick={this.reset}>Try again</Button>
        </div>
      )
    }
    return this.props.children
  }
}
