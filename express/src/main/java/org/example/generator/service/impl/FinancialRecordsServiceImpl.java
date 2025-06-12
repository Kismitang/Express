package org.example.generator.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;


import org.example.generator.entity.FinancialRecords;
import org.example.generator.mapper.FinancialRecordsMapper;
import org.example.generator.service.FinancialRecordsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;


/**
* @author 18959
* @description 针对表【financial_records】的数据库操作Service实现
* @createDate 2025-04-20 21:56:57
*/
@Service
public class FinancialRecordsServiceImpl extends ServiceImpl<FinancialRecordsMapper, FinancialRecords>
    implements FinancialRecordsService {
    @Autowired
    private FinancialRecordsMapper financialRecordsMapper;
    @Override
    public Map<Integer, Double> countFinancialRecordsByType() {
        List<Map<String, Object>> listMaps = this.baseMapper.countFinancialRecords();

        return listMaps.stream()
                .collect(Collectors.toMap(
                        map -> (Integer) map.get("income_type"),
                        map -> {
                            BigDecimal amount = new BigDecimal(map.get("totalAmount").toString());
                            return amount.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
                        }
                ));
    }
    @Override
    public Map<String, Map<String, Double>> countDailyIncomeByMonth(int year, int month) {
        // 调用mapper方法获取统计数据
        List<Map<String, Object>> listMaps = financialRecordsMapper.countDailyIncomeByMonth(year, month);

        Map<String, Map<String, Double>> result = new HashMap<>();

        for (Map<String, Object> map : listMaps) {
            String date = (String) map.get("date");
            Integer incomeType = (Integer) map.get("income_type");
            Double totalAmount = (Double) map.get("totalAmount");

            DecimalFormat decimalFormat = new DecimalFormat("#.00");
            String formattedTotalAmountStr = decimalFormat.format(totalAmount);
            Double formattedTotalAmount = Double.parseDouble(formattedTotalAmountStr);

            result.putIfAbsent(date, new HashMap<>());
            result.get(date).put(incomeType.toString(), formattedTotalAmount);
        }

        // 填充整个月的所有日期
        Calendar calendar = Calendar.getInstance();
        calendar.set(year, month - 1, 1);
        int daysInMonth = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
        for (int i = 1; i <= daysInMonth; i++) {
            calendar.set(year, month - 1, i);
            String dateStr = new SimpleDateFormat("yyyy-MM-dd").format(calendar.getTime());
            result.putIfAbsent(dateStr, new HashMap<>());
            // 确保每个日期都有 '0' 和 '1' 两个收入类型，默认值为 0.0
            result.get(dateStr).putIfAbsent("0", 0.0);
            result.get(dateStr).putIfAbsent("1", 0.0);
        }
        return result;
    }
    // 根据年月统计当月不同类型收入总额和单数
    @Override
    public List<Map<String, Object>> countMonthlyIncomeAndTypes(int year, int month) {
        // 调用mapper方法获取统计数据
        List<Map<String, Object>> listMaps = financialRecordsMapper.countMonthlyIncomeAndTypes(year, month);

        // 对金额进行格式化并保留两位小数
        return listMaps.stream()
                .map(map -> {
                    Integer incomeType = (Integer) map.get("income_type");
                    Double totalAmount = (Double) map.get("totalAmount");

                    // 使用BigDecimal进行金额格式化
                    BigDecimal amount = new BigDecimal(totalAmount.toString());
                    double formattedAmount = amount.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();

                    // 更新map中的amount值
                    map.put("totalAmount", formattedAmount);
                    return map;
                })
                .collect(Collectors.toList());
    }
}




