package com.drop.domain.schedule.data;

import com.drop.domain.base.BaseEntity;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.global.enums.DayOfWeek;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@Getter
@Table(name = "CROSSFIT_BOX_SCHEDULE")
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CrossfitBoxSchedule extends BaseEntity {

    @Id
    @Column(name = "SCHEDULE_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CROSSFIT_BOX_ID", nullable = false)
    private CrossfitBox crossfitBox;

    @Enumerated(EnumType.STRING)
    @Column(name = "DAY_OF_WEEK", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "IS_CLOSED")
    @Builder.Default
    private Boolean isClosed = false;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<CrossfitBoxTimeSlot> timeSlots = new ArrayList<>();

    public static CrossfitBoxSchedule create(CrossfitBox crossfitBox, DayOfWeek dayOfWeek) {
        return CrossfitBoxSchedule.builder()
                .crossfitBox(crossfitBox)
                .dayOfWeek(dayOfWeek)
                .isClosed(false)
                .timeSlots(new ArrayList<>())
                .build();
    }

    public void updateIsClosed(Boolean isClosed) {
        this.isClosed = isClosed;
        if (Boolean.TRUE.equals(isClosed)) {
            this.timeSlots.clear();
        }
    }

    public void clearTimeSlots() {
        this.timeSlots.clear();
    }

    public void addTimeSlot(CrossfitBoxTimeSlot timeSlot) {
        this.timeSlots.add(timeSlot);
        timeSlot.setSchedule(this);
    }
}
