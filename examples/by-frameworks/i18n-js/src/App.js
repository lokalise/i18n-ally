import './App.css';
import i18n from './locales';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          {i18n.t('home.headline')}
        </h1>
        <p>
          Edit <b>./src/locales/index.js</b> to try different language.
        </p>
      </header>
    </div>
  );
}

export default App;
