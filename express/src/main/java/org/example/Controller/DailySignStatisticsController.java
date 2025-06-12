package org.example.Controller;

import org.example.generator.entity.DailySignStatistics;
import org.example.generator.service.DailySignStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("dailySign")
public class DailySignStatisticsController {
    @Autowired
    private DailySignStatisticsService dailySignStatisticsService;

    @GetMapping("/list")
    public List<DailySignStatistics> list(){
        return dailySignStatisticsService.list();
    }
    // 根据年月返回每日快递签收数量
    @PostMapping("/dailySignAndPickupCount")
    public List<DailySignStatistics> getDailySignAndPickupCount(@RequestBody Map<String, Integer> params) {
        Integer year = params.get("year");
        Integer month = params.get("month");
        return dailySignStatisticsService.getDailySignAndPickupCountByYearMonth(year, month);
    }
}
