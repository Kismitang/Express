package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.generator.entity.FinancialRecords;
import org.example.generator.entity.TotalIncome;
import org.example.generator.service.FinancialRecordsService;
import org.example.generator.service.TotalIncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("records")
public class FinancialRecordsController {
    @Autowired
    private FinancialRecordsService financialRecordsService;

    @Autowired
    private TotalIncomeService totalIncomeService;


    // 1.新增财务表
    @PostMapping("/add")
    public boolean addFinancialRecord(@RequestBody FinancialRecords record) {
        boolean result = false;
        try {
            // 确保 amount 字段只保留两位小数
            if (record.getAmount() != null) {
                BigDecimal amountDecimal = new BigDecimal(record.getAmount()).setScale(2, RoundingMode.HALF_UP);
                record.setAmount(amountDecimal.doubleValue());
            }
//            System.out.println("财务更新前的数据: " + record.getTotalIncome() + ", " + record.getAmount());
            // 1. 保存新的财务记录
            financialRecordsService.save(record);

            // 2. 等待触发器更新收入总表
            TotalIncome totalIncome = totalIncomeService.getById(1);
            // Thread.sleep(300);

            // 3. 将总收入表中最新数据更新到财务记录中
            if (totalIncome != null && totalIncome.getTotal() != null) {
                BigDecimal totalDecimal = new BigDecimal(totalIncome.getTotal()).setScale(2, RoundingMode.HALF_UP);
                record.setTotalIncome(totalDecimal.doubleValue());
                System.out.println("财务更新后的数据: " + record.getTotalIncome() + ", " + record.getAmount());
                financialRecordsService.updateById(record);
            }
            result = true;
        } catch (Exception e) {
            e.printStackTrace();
            // 回滚事务
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        }
        return result;
    }

    // 2. 获取财务表中的全部数据信息
    @PostMapping("/list")
    public Map<String, Object> list(@RequestBody HashMap map) {
        System.out.println("Type:" + map.get("incomeType") +" RelatedOrderId: " + map.get("relatedOrderId"));

        LambdaQueryWrapper<FinancialRecords> lambdaQueryWrapper = new LambdaQueryWrapper<>();

        lambdaQueryWrapper.like(FinancialRecords::getIncomeType, map.get("incomeType"));
        lambdaQueryWrapper.like(FinancialRecords::getRelatedOrderId,map.get("relatedOrderId"));

        // 根据模糊查询结果执行查询
        List<FinancialRecords> result = financialRecordsService.list(lambdaQueryWrapper);

        // 构造返回结果
        Map<String, Object> res = new HashMap<>();
        res.put("code", 200);
        res.put("data", result);
        return res;
    }
    // 3.根据收入类型获得各个类型下的收入总额
    @GetMapping("/countByType")
    public Map<Integer,Double> countFinancialRecordsByType() {
        // 调用 service 层的方法获取统计数据并返回
        return financialRecordsService.countFinancialRecordsByType();
    }

    // 4.根据年月统计当月中每日的不同类型的收入总额
    @PostMapping("/countDailyIncomeByMonth")
    public Map<String, Map<String, Double>> countDailyIncomeByMonth(@RequestBody Map<String, Integer> requestData) {
        int year = requestData.get("year");
        int month = requestData.get("month");
        return financialRecordsService.countDailyIncomeByMonth(year, month);
    }

    // 5.根据年月统计当月不同类型收入总额和单数
    @PostMapping("/monthlyIncomeTypes")
    public List<Map<String, Object>> getMonthlyIncomeAndTypes(@RequestBody Map<String, Object> requestParams) {
        int year = (Integer) requestParams.get("year");
        int month = (Integer) requestParams.get("month");
        return financialRecordsService.countMonthlyIncomeAndTypes(year, month);
    }
}
