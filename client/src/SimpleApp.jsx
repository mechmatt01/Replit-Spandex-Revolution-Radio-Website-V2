import TestPage from "./TestPage";
function SimpleApp() {
    return (<div style={{ padding: '20px', color: 'white', backgroundColor: 'black' }}>
      <h1>Simple App Test</h1>
      <p>If you can see this, the basic React setup is working!</p>
      <TestPage />
    </div>);
}
export default SimpleApp;
