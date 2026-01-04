package com.drop.domain.schedule.data;

import com.drop.domain.base.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalTime;

@Entity
@Builder
@Getter
@Table(name = "CROSSFIT_BOX_TIME_SLOT")
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CrossfitBoxTimeSlot extends BaseEntity {

    @Id
    @Column(name = "TIME_SLOT_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SCHEDULE_ID", nullable = false)
    private CrossfitBoxSchedule schedule;

    @Column(name = "START_TIME", nullable = false)
    private LocalTime startTime;

    @Column(name = "END_TIME")
    private LocalTime endTime;

    @Column(name = "CLASS_NAME", nullable = false)
    private String className;

    @Column(name = "COLOR")
    private String color;

    @Column(name = "DISPLAY_ORDER")
    @Builder.Default
    private Integer displayOrder = 0;

    public static CrossfitBoxTimeSlot create(LocalTime startTime, LocalTime endTime, String className, String color, Integer displayOrder) {
        return CrossfitBoxTimeSlot.builder()
                .startTime(startTime)
                .endTime(endTime)
                .className(className)
                .color(color)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .build();
    }

    public void setSchedule(CrossfitBoxSchedule schedule) {
        this.schedule = schedule;
    }

    public void update(LocalTime startTime, LocalTime endTime, String className, String color, Integer displayOrder) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.className = className;
        this.color = color;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }
}
