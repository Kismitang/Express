package org.example.generator.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.*;
import org.example.generator.entity.FinancialRecords;

import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【financial_records】的数据库操作Mapper
* @createDate 2025-04-20 21:56:57
* @Entity generator.entity.FinancialRecords
*/
@Mapper
public interface FinancialRecordsMapper extends BaseMapper<FinancialRecords> {
    /**
     * 统计不同类型下收入的总额
     * @return
     */
    @Select("SELECT income_type, SUM(amount) AS totalAmount FROM financial_records GROUP BY income_type")
    List<Map<String, Object>> countFinancialRecords();
    /**
     * 根据年月统计当月中每日的不同类型的收入总额
     * @param year 年
     * @param month 月
     * @return
     */
    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m-%d') AS date, income_type, SUM(amount) AS totalAmount " +
            "FROM financial_records " +
            "WHERE YEAR(create_time) = #{year} AND MONTH(create_time) = #{month} " +
            "GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d'), income_type " +
            "ORDER BY DATE_FORMAT(create_time, '%Y-%m-%d')")
    List<Map<String, Object>> countDailyIncomeByMonth(@Param("year") int year, @Param("month") int month);
    /**
    * 根据年月统计当月不同类型收入总额和单数
    * */
    @Select("SELECT " +
            "  income_type, " +
            "  SUM(amount) AS totalAmount, " +
            "  COUNT(*) AS count " +
            "FROM financial_records " +
            "WHERE YEAR(create_time) = #{year} AND MONTH(create_time) = #{month} " +
            "GROUP BY income_type")
    List<Map<String, Object>> countMonthlyIncomeAndTypes(@Param("year") int year, @Param("month") int month);
}




