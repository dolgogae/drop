package com.drop.domain.gymsync.service;

import com.drop.domain.gymsync.dto.PlaceDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class CsvExportService {

    @Value("${output.directory:./output}")
    private String outputDirectory;

    private static final String[] HEADERS = {
            "place_id", "name", "formatted_address", "phone_number",
            "latitude", "longitude", "rating", "user_ratings_total",
            "website", "types", "region", "collected_at"
    };

    private static final byte[] UTF8_BOM = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
    private static final String CRLF = "\r\n";
    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private static final DateTimeFormatter ISO_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public String export(List<PlaceDto> places) {
        String timestamp = LocalDateTime.now().format(FILE_DATE_FORMAT);
        String filename = "crossfit_gyms_" + timestamp + ".csv";

        File dir = new File(outputDirectory);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        File file = new File(dir, filename);
        String filePath = file.getAbsolutePath();

        try (FileOutputStream fos = new FileOutputStream(file);
             BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(fos, StandardCharsets.UTF_8))) {

            // UTF-8 BOM
            fos.write(UTF8_BOM);

            // 헤더
            writer.write(String.join(",", HEADERS));
            writer.write(CRLF);

            // 데이터
            for (PlaceDto place : places) {
                writer.write(toCsvRow(place));
                writer.write(CRLF);
            }

            writer.flush();
            log.info("CSV 파일 생성 완료 - 경로: {}, 행 수: {}건, 크기: {}KB",
                    filePath, places.size(), file.length() / 1024);

        } catch (Exception e) {
            log.error("CSV 파일 생성 실패 - 경로: {}", filePath, e);
            throw new RuntimeException("CSV 파일 생성 실패", e);
        }

        return filePath;
    }

    private String toCsvRow(PlaceDto place) {
        StringBuilder sb = new StringBuilder();
        sb.append(escapeCsv(place.getPlaceId()));
        sb.append(",");
        sb.append(escapeCsv(place.getName()));
        sb.append(",");
        sb.append(escapeCsv(place.getFormattedAddress()));
        sb.append(",");
        sb.append(escapeCsv(place.getPhoneNumber()));
        sb.append(",");
        sb.append(place.getLatitude() != null ? place.getLatitude() : "");
        sb.append(",");
        sb.append(place.getLongitude() != null ? place.getLongitude() : "");
        sb.append(",");
        sb.append(place.getRating() != null ? place.getRating() : "");
        sb.append(",");
        sb.append(place.getUserRatingsTotal() != null ? place.getUserRatingsTotal() : "");
        sb.append(",");
        sb.append(escapeCsv(place.getWebsite()));
        sb.append(",");
        sb.append(escapeCsv(place.getTypesAsString()));
        sb.append(",");
        sb.append(escapeCsv(place.getRegion()));
        sb.append(",");
        sb.append(place.getCollectedAt() != null ? place.getCollectedAt().format(ISO_FORMAT) : "");
        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
