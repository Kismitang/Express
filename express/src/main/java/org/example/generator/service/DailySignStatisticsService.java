package org.example.generator.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.example.generator.entity.DailySignStatistics;

import java.util.List;

/**
* @author 18959
* @description 针对表【daily_sign_statistics】的数据库操作Service
* @createDate 2025-03-28 20:10:53
*/
public interface DailySignStatisticsService extends IService<DailySignStatistics> {
    /**
     * 根据年月获取该月每日签收快递数量
     *
     * @param year  年份
     * @param month 月份
     * @return 该月每日签收快递数量列表
     */
    List<DailySignStatistics> getSignCountByYearMonth(Integer year, Integer month);
    List<DailySignStatistics> getDailySignAndPickupCountByYearMonth(Integer year, Integer month);
}
