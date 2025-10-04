import React from 'react'
import { Alert, Button } from '@mui/material'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error){
    return { hasError: true, error }
  }
  componentDidCatch(error, info){
    // Optional: send to logging endpoint later
    if (console && console.error) console.error('Unhandled UI Error:', error, info)
  }
  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }
  render(){
    if (this.state.hasError){
      return (
        <div style={{ padding: 24, direction:'rtl' }}>
          <Alert severity="error" sx={{ mb:2 }}>خطای غیرمنتظره در رابط کاربری رخ داد.</Alert>
          <pre style={{ whiteSpace:'pre-wrap', background:'#f8f8f8', padding:12, borderRadius:8, direction:'ltr' }}>{String(this.state.error)}</pre>
          <Button variant='contained' onClick={this.handleReload}>بارگذاری مجدد</Button>
        </div>
      )
    }
    return this.props.children
  }
}
