import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ProductCategories from './Components/Add.jsx';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ProductCategories/>
    </>
  )
}

export default App
