import React, { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function generatePDF() {
    try {
      const response = await fetch("http://localhost:3001/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        // Convert the response to a Blob and create a download link
        const pdfBlob = await response.blob();
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "output.pdf";
        a.click();
      } else {
        console.error("PDF generation failed.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="App">
      <h1>PDF Generation Example</h1>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  );
}

export default App;
