import './App.css'
import H1BDataGrid from './components/H1BDataGrid'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <H1BDataGrid />
      </main>
      <Footer />
    </div>
  )
}

export default App
