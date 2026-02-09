import { BrowserRouter } from 'react-router-dom'
import Router from './router'
import './index.css'

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Router />
    </BrowserRouter>
  )
}

export default App
