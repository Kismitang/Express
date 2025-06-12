package org.example.generator.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.example.generator.entity.FinancialRecords;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【financial_records】的数据库操作Service
* @createDate 2025-04-20 21:56:57
*/
public interface FinancialRecordsService extends IService<FinancialRecords> {
    // 统计不同类型收入总额的方法
    Map<Integer, Double> countFinancialRecordsByType();
    //根据年月统计当月中每日的不同类型的收入总额
    Map<String, Map<String, Double>> countDailyIncomeByMonth(int year, int month);
    // 根据年月统计当月不同类型收入总额和单数
    List<Map<String, Object>> countMonthlyIncomeAndTypes(int year, int month);
}
