import './App.css'
import H1BDataGrid from './components/H1BDataGrid'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>H1B Visa Data Explorer</h1>
        <p>Interactive dashboard for exploring H1B visa data from 2009-2025</p>
      </header>
      <main>
        <H1BDataGrid />
      </main>
    </div>
  )
}

export default App
