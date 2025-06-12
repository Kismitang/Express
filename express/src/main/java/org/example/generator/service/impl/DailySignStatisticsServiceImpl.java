package org.example.generator.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import org.example.generator.entity.DailySignStatistics;
import org.example.generator.mapper.DailySignStatisticsMapper;
import org.example.generator.service.DailySignStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【daily_sign_statistics】的数据库操作Service实现
* @createDate 2025-03-28 20:10:53
*/
@Service
public class DailySignStatisticsServiceImpl extends ServiceImpl<DailySignStatisticsMapper, DailySignStatistics>
    implements DailySignStatisticsService {
    @Autowired
    private DailySignStatisticsMapper dailySignStatisticsMapper;
    @Override
    public List<DailySignStatistics> getSignCountByYearMonth(Integer year, Integer month) {
        return baseMapper.getSignCountByYearMonth(year, month);
    }

    @Override
    public List<DailySignStatistics> getDailySignAndPickupCountByYearMonth(Integer year, Integer month) {
// 调用Mapper层的方法获取该月有数据的日期对应的统计信息
        List<DailySignStatistics> statisticsList = baseMapper.getDailySignAndPickupCountByYearMonth(year, month);

        // 生成该年该月的所有日期
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<LocalDate> allDates = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            allDates.add(currentDate);
            currentDate = currentDate.plusDays(1);
        }

        // 将查询结果存入Map，方便后续查找
        Map<LocalDate, DailySignStatistics> statisticsMap = new HashMap<>();
        for (DailySignStatistics statistics : statisticsList) {
            LocalDate date = statistics.getDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            statisticsMap.put(date, statistics);
        }

        // 构建最终结果，填充缺失日期的数据为0
        List<DailySignStatistics> result = new ArrayList<>();
        for (LocalDate date : allDates) {
            DailySignStatistics statistics = statisticsMap.get(date);
            if (statistics != null) {
                result.add(statistics);
            } else {
                DailySignStatistics newStatistics = new DailySignStatistics();
                newStatistics.setDate(java.sql.Date.valueOf(date));
                newStatistics.setSignCount(0);
                newStatistics.setPickupCount(0);
                result.add(newStatistics           );
            }
        }

        return result;
    }

}




