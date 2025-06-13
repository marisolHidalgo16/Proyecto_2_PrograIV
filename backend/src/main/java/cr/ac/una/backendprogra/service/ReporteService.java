package cr.ac.una.backendprogra.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import cr.ac.una.backendprogra.entity.Persona;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ReporteService {

    public byte[] generarPDFPersonas(List<Persona> personas) throws IOException, DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, baos);

        document.open();

        com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD);
        Paragraph title = new Paragraph("Reporte de Personas", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);

        com.itextpdf.text.Font headerFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 12, com.itextpdf.text.Font.BOLD);
        PdfPCell cell;

        cell = new PdfPCell(new Phrase("ID", headerFont));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase("Nombre", headerFont));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase("Email", headerFont));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase("Dirección", headerFont));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase("Oficina", headerFont));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);

        for (Persona persona : personas) {
            table.addCell(String.valueOf(persona.getIdAuto()));
            table.addCell(persona.getNombre());
            table.addCell(persona.getEmail());
            table.addCell(persona.getDireccion());
            table.addCell(persona.getOficina() != null ? persona.getOficina().getNombre() : "Sin oficina");
        }

        document.add(table);
        document.close();

        return baos.toByteArray();
    }

    public byte[] generarExcelPersonas(List<Persona> personas) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Personas");

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "ID Usuario", "Nombre", "Email", "Dirección", "Fecha Nacimiento", "Oficina"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Persona persona : personas) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(persona.getIdAuto());
                row.createCell(1).setCellValue(persona.getIdUsuario());
                row.createCell(2).setCellValue(persona.getNombre());
                row.createCell(3).setCellValue(persona.getEmail());
                row.createCell(4).setCellValue(persona.getDireccion());
                row.createCell(5).setCellValue(persona.getFechaNacimiento() != null ?
                        persona.getFechaNacimiento().toString() : "");
                row.createCell(6).setCellValue(persona.getOficina() != null ?
                        persona.getOficina().getNombre() : "Sin oficina");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }
}