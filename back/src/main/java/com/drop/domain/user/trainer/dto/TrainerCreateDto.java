package com.drop.domain.user.trainer.dto;

import com.drop.domain.user.userbase.dto.UserCreateDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Schema(description = "트레이너 생성 DTO")
public class TrainerCreateDto extends UserCreateDto {
    private String shortIntroduction;
    private String longIntroduction;
}
