package org.example.generator.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.example.generator.entity.DailySignStatistics;

import java.util.List;

/**
* @author 18959
* @description 针对表【daily_sign_statistics】的数据库操作Mapper
* @createDate 2025-03-28 20:10:53
* @Entity generator.entity.DailySignStatistics
*/
@Mapper
public interface DailySignStatisticsMapper extends BaseMapper<DailySignStatistics> {
    @Select("SELECT * FROM daily_sign_statistics WHERE YEAR(date) = #{year} AND MONTH(date) = #{month}")
    List<DailySignStatistics> getSignCountByYearMonth(@Param("year") Integer year, @Param("month") Integer month);
    // 根据年月返回每日的签收和入库快递数量
    @Select("SELECT date, sign_count, pickup_count FROM daily_sign_statistics WHERE YEAR(date) = #{year} AND MONTH(date) = #{month}")
    List<DailySignStatistics> getDailySignAndPickupCountByYearMonth(@Param("year") Integer year, @Param("month") Integer month);
}




