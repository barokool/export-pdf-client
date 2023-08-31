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
import { v4 as uuidv4 } from "uuid";

type ExcelDataType = {
  id: string;
  Name: string;
  Mail: string;
  DOB: string;
  GEN: string;
  ADDRESS: string;
  City: string;
  State: string;
  University: string;
  Cmpany: string;
  Phone: string;
};

function App() {
  const [exportedData, setExportedData] = useState<string[]>([]);
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
        const newParsedWithId = parsedData.map((item: any) => {
          return {
            ...item,
            id: uuidv4(),
          };
        });

        console.log(newParsedWithId);
        setExcelData(newParsedWithId as any);
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
        body: JSON.stringify({
          name: data.Name,
          email: data.Mail,
          phone: data.Phone,
          city: data.City,
          state: data.State,
          address: data.ADDRESS,
          dob: data.DOB,
        }),
      });

      if (response.ok) {
        const pdfBlob = await response.blob();
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "output.pdf";
        a.click();
        setExportedData([...exportedData, data.id as string]);
      } else {
        console.error("PDF generation failed.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function generatePDFs() {
    if (exportedData.length > 0) {
      return;
    }
    for (const data of excelData) {
      await generatePDF(data);
    }
    setExportedData(excelData.map((item) => item.id as string));
  }

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ bgcolor: "#cfe8fc", height: "100vh" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "10px",
            }}
          >
            <Box>
              <h1>Excel Data to PDF</h1>
              {exportedData.length === excelData.length ? (
                <h2 style={{ color: "red", textTransform: "uppercase" }}>
                  Please upload new excel file, the current is done
                </h2>
              ) : (
                ""
              )}
              <input type="file" accept=".xlsx" onChange={handleFileUpload} />
            </Box>
            <Box>
              <Button variant="contained" onClick={() => generatePDFs()}>
                Export all PDFs
              </Button>
            </Box>
          </Box>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left">Name</TableCell>
                  <TableCell align="center">Email</TableCell>
                  <TableCell align="center">Action</TableCell>
                  <TableCell align="center">Is exported</TableCell>
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
                    <TableCell align="center">{row.Mail}</TableCell>
                    <TableCell align="center">
                      <Button
                        onClick={() => generatePDF(row)}
                        variant="outlined"
                        disabled={exportedData.includes(row.id as string)}
                      >
                        Export PDF
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      {exportedData.includes(row.id as string) ? (
                        <span role="img" aria-label="check">
                          ✅
                        </span>
                      ) : (
                        <span role="img" aria-label="cross">
                          ❌
                        </span>
                      )}
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
