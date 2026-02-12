package com.drop.domain.gymsync.service;

import com.drop.domain.gymsync.dto.GymSyncExecutionResultDto;
import com.drop.domain.gymsync.dto.FilterStatsDto;
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

@Slf4j
@Service
public class GymSyncReportService {

    @Value("${output.report-directory:./reports}")
    private String reportDirectory;

    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private static final DateTimeFormatter DISPLAY_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public String generateReport(GymSyncExecutionResultDto result, FilterStatsDto filterStats) {
        String timestamp = LocalDateTime.now().format(FILE_DATE_FORMAT);
        String filename = "batch_summary_" + timestamp + ".txt";

        File dir = new File(reportDirectory);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        File file = new File(dir, filename);
        String filePath = file.getAbsolutePath();

        try (BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(new FileOutputStream(file), StandardCharsets.UTF_8))) {

            writer.write("================================================================================");
            writer.newLine();
            writer.write("CrossFit Gym Batch Execution Report");
            writer.newLine();
            writer.write("================================================================================");
            writer.newLine();

            writer.write(String.format("Batch ID       : %s", result.getBatchId()));
            writer.newLine();
            writer.write(String.format("Execution Type : %s", result.getExecutionType()));
            writer.newLine();
            writer.write(String.format("Started At     : %s",
                    result.getStartedAt() != null ? result.getStartedAt().format(DISPLAY_FORMAT) : "N/A"));
            writer.newLine();
            writer.write(String.format("Finished At    : %s",
                    result.getFinishedAt() != null ? result.getFinishedAt().format(DISPLAY_FORMAT) : "N/A"));
            writer.newLine();

            long minutes = result.getDurationSeconds() / 60;
            long seconds = result.getDurationSeconds() % 60;
            writer.write(String.format("Duration       : %d minutes %d seconds", minutes, seconds));
            writer.newLine();
            writer.write(String.format("Status         : %s", result.getStatus()));
            writer.newLine();

            writer.newLine();
            writer.write("--------------------------------------------------------------------------------");
            writer.newLine();
            writer.write("Execution Statistics");
            writer.newLine();
            writer.write("--------------------------------------------------------------------------------");
            writer.newLine();
            writer.write(String.format("Total Regions Searched  : %d", result.getTotalRegions()));
            writer.newLine();
            writer.write(String.format("Total API Calls         : %d", result.getTotalApiCalls()));
            writer.newLine();

            writer.newLine();
            writer.write("--------------------------------------------------------------------------------");
            writer.newLine();
            writer.write("Data Statistics");
            writer.newLine();
            writer.write("--------------------------------------------------------------------------------");
            writer.newLine();
            writer.write(String.format("Raw Results             : %d", result.getRawResultsCount()));
            writer.newLine();

            if (filterStats != null) {
                writer.write(String.format("After Keyword Filter    : %d", filterStats.getIncludedByKeyword()));
                writer.newLine();
                writer.write(String.format("Excluded by Keyword     : %d", filterStats.getExcludedByKeyword()));
                writer.newLine();
                writer.write(String.format("Excluded by Type        : %d", filterStats.getExcludedByType()));
                writer.newLine();
                writer.write(String.format("Duplicates Removed      : %d", filterStats.getDuplicatesRemoved()));
                writer.newLine();
            }

            writer.write(String.format("Final Output            : %d", result.getFinalCount()));
            writer.newLine();

            writer.newLine();
            writer.write("--------------------------------------------------------------------------------");
            writer.newLine();
            writer.write("Output");
            writer.newLine();
            writer.write("--------------------------------------------------------------------------------");
            writer.newLine();
            writer.write(String.format("CSV File : %s", result.getOutputFile() != null ? result.getOutputFile() : "N/A"));
            writer.newLine();

            writer.newLine();
            writer.write("--------------------------------------------------------------------------------");
            writer.newLine();
            writer.write(String.format("Errors (%d)", result.getErrors().size()));
            writer.newLine();
            writer.write("--------------------------------------------------------------------------------");
            writer.newLine();

            if (result.getErrors().isEmpty()) {
                writer.write("None");
                writer.newLine();
            } else {
                for (String error : result.getErrors()) {
                    writer.write("- " + error);
                    writer.newLine();
                }
            }

            writer.newLine();
            writer.write("================================================================================");
            writer.newLine();

            writer.flush();
            log.info("배치 리포트 생성 완료 - 경로: {}", filePath);

        } catch (Exception e) {
            log.error("배치 리포트 생성 실패 - 경로: {}", filePath, e);
        }

        return filePath;
    }
}
