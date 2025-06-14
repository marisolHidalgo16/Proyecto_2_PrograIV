package cr.ac.una.backendprogra.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import cr.ac.una.backendprogra.entity.Persona;
import cr.ac.una.backendprogra.entity.RegistroEntradaSalida;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReporteService {

    private static final DateTimeFormatter FECHA_FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

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

    public byte[] generarPDFRegistros(List<RegistroEntradaSalida> registros) throws IOException, DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, baos);

        document.open();

        com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD);
        Paragraph title = new Paragraph("Reporte de Entradas y Salidas", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        com.itextpdf.text.Font infoFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 10, com.itextpdf.text.Font.NORMAL);
        Paragraph info = new Paragraph("Generado el: " + java.time.LocalDateTime.now().format(FECHA_FORMATO) +
                " | Total de registros: " + registros.size(), infoFont);
        info.setAlignment(Element.ALIGN_CENTER);
        document.add(info);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);

        float[] columnWidths = {10f, 25f, 20f, 15f, 15f, 10f, 25f};
        table.setWidths(columnWidths);

        com.itextpdf.text.Font headerFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 10, com.itextpdf.text.Font.BOLD);
        com.itextpdf.text.Font cellFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 9, com.itextpdf.text.Font.NORMAL);

        String[] headers = {"ID", "Persona", "Oficina", "Tipo", "Fecha/Hora", "Usuario", "Observaciones"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(BaseColor.DARK_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(8f);
            table.addCell(cell);
        }

        for (RegistroEntradaSalida registro : registros) {

            PdfPCell idCell = new PdfPCell(new Phrase(String.valueOf(registro.getId()), cellFont));
            idCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(idCell);

            table.addCell(new Phrase(registro.getPersona().getNombre(), cellFont));

            table.addCell(new Phrase(registro.getOficina().getNombre(), cellFont));

            PdfPCell tipoCell = new PdfPCell(new Phrase(registro.getTipoMovimiento().toString(), cellFont));
            if (registro.getTipoMovimiento() == RegistroEntradaSalida.TipoMovimiento.ENTRADA) {
                tipoCell.setBackgroundColor(new BaseColor(144, 238, 144));
            } else {
                tipoCell.setBackgroundColor(new BaseColor(255, 182, 193));
            }
            tipoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(tipoCell);

            PdfPCell fechaCell = new PdfPCell(new Phrase(registro.getFechaHora().format(FECHA_FORMATO), cellFont));
            fechaCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(fechaCell);

            table.addCell(new Phrase(registro.getUsuarioRegistro() != null ? registro.getUsuarioRegistro() : "", cellFont));

            table.addCell(new Phrase(registro.getObservaciones() != null ? registro.getObservaciones() : "", cellFont));
        }

        document.add(table);
        document.close();

        return baos.toByteArray();
    }

    public byte[] generarExcelRegistros(List<RegistroEntradaSalida> registros) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Registros Entrada-Salida");

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle entradaStyle = workbook.createCellStyle();
            entradaStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            entradaStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            entradaStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle salidaStyle = workbook.createCellStyle();
            salidaStyle.setFillForegroundColor(IndexedColors.ROSE.getIndex());
            salidaStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            salidaStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle fechaStyle = workbook.createCellStyle();
            fechaStyle.setAlignment(HorizontalAlignment.CENTER);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Persona", "ID Usuario", "Oficina", "Tipo Movimiento",
                    "Fecha y Hora", "Usuario Registro", "Observaciones"};

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (RegistroEntradaSalida registro : registros) {
                Row row = sheet.createRow(rowNum++);

                Cell idCell = row.createCell(0);
                idCell.setCellValue(registro.getId());

                row.createCell(1).setCellValue(registro.getPersona().getNombre());

                row.createCell(2).setCellValue(registro.getPersona().getIdUsuario());

                row.createCell(3).setCellValue(registro.getOficina().getNombre());

                Cell tipoCell = row.createCell(4);
                tipoCell.setCellValue(registro.getTipoMovimiento().toString());
                if (registro.getTipoMovimiento() == RegistroEntradaSalida.TipoMovimiento.ENTRADA) {
                    tipoCell.setCellStyle(entradaStyle);
                } else {
                    tipoCell.setCellStyle(salidaStyle);
                }

                Cell fechaCell = row.createCell(5);
                fechaCell.setCellValue(registro.getFechaHora().format(FECHA_FORMATO));
                fechaCell.setCellStyle(fechaStyle);

                row.createCell(6).setCellValue(registro.getUsuarioRegistro() != null ?
                        registro.getUsuarioRegistro() : "");

                row.createCell(7).setCellValue(registro.getObservaciones() != null ?
                        registro.getObservaciones() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);

                if (i == 1 || i == 3 || i == 5 || i == 7) {
                    int currentWidth = sheet.getColumnWidth(i);
                    sheet.setColumnWidth(i, Math.max(currentWidth, 4000));
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }
}