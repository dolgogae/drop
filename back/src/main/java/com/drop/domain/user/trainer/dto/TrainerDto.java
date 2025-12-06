package com.drop.domain.user.trainer.dto;

import com.drop.domain.user.userbase.dto.UserDto;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class TrainerDto extends UserDto {

    private String shortIntroduction;
    private String longIntroduction;
}
