import React, { useState } from 'react';

function App() {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    alert('Submitted: ' + inputValue);
  };

  const handleCancel = () => {
    setInputValue('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="text"
        placeholder="Enter text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px' }}
      />
      <div>
        <button onClick={handleSubmit} style={{ marginRight: '10px' }}>
          Submit
        </button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default App;
