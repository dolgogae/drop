package com.drop.domain.fee.controller;

import com.drop.domain.fee.dto.FeeCreateDto;
import com.drop.domain.fee.dto.FeeDto;
import com.drop.domain.fee.dto.FeeUpdateDto;
import com.drop.domain.fee.service.FeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.ArrayList;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/fee")
public class FeeController {
    private final FeeService feeService;

    @PostMapping
    public ResponseEntity<FeeDto> createFee(@RequestBody @Valid FeeCreateDto feeCreateDto){
        FeeDto result = feeService.createFee(feeCreateDto);
        ArrayList<Object> objects = new ArrayList<>();
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<FeeDto> updateFee(@RequestBody @Valid FeeUpdateDto feeUpdateDto){
        FeeDto result = feeService.updateFee(feeUpdateDto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
