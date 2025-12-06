package com.drop.unit.domain.fee.controller;

import com.drop.domain.fee.controller.FeeController;
import com.drop.domain.fee.dto.GymFeeCreateDto;
import com.drop.domain.fee.dto.GymFeeDto;
import com.drop.domain.fee.dto.GymFeeUpdateDto;
import com.drop.domain.fee.service.FeeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class FeeControllerTest {
    @Mock
    private FeeService feeService;
    @InjectMocks
    private FeeController feeController;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(feeController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void createGymFee_정상() throws Exception {
        GymFeeCreateDto createDto = new GymFeeCreateDto();
        GymFeeDto resultDto = new GymFeeDto();
        when(feeService.createGymFee(any())).thenReturn(resultDto);
        mockMvc.perform(post("/fee")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated());
    }

    @Test
    void getGymFee_정상() throws Exception {
        GymFeeDto resultDto = new GymFeeDto();
        when(feeService.getGymFee(1L)).thenReturn(resultDto);
        mockMvc.perform(get("/fee/1"))
                .andExpect(status().isOk());
    }

    @Test
    void updateGymFee_정상() throws Exception {
        GymFeeUpdateDto updateDto = new GymFeeUpdateDto();
        GymFeeDto resultDto = new GymFeeDto();
        when(feeService.updateFee(any())).thenReturn(resultDto);
        mockMvc.perform(put("/fee")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk());
    }
} 