import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";

type ExcelDataType = {
  Name: string;
  Mail: string;
  DOB: string;
  GEN: string;
  ADDRESS: string;
  City: string;
  State: string;
  University: string;
  Cmpany: string;
};

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [excelData, setExcelData] = useState<Partial<ExcelDataType>[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        setExcelData(parsedData as any);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  async function generatePDF(data: Partial<ExcelDataType>) {
    try {
      const response = await fetch("http://localhost:3001/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: data.Name, email: data.Mail }),
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
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ bgcolor: "#cfe8fc", height: "100vh" }}>
          <h1>Excel Data to HTML in React</h1>
          <input type="file" accept=".xlsx" onChange={handleFileUpload} />
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left">Name</TableCell>
                  <TableCell align="center">Email</TableCell>
                  <TableCell align="center">University</TableCell>
                  <TableCell align="center">Company</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {excelData.map((row) => (
                  <TableRow
                    key={Math.random()}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.Name}
                    </TableCell>
                    <TableCell align="right">{row.Mail}</TableCell>
                    <TableCell align="right">{row.University}</TableCell>
                    <TableCell align="right">{row.Cmpany}</TableCell>
                    <TableCell align="right">
                      <Button
                        onClick={() => generatePDF(row)}
                        variant="outlined"
                      >
                        Export PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </>
  );
}

export default App;
