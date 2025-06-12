package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.generator.entity.Express;
import org.example.generator.entity.ExpressLog;
import org.example.generator.entity.NoticeLog;
import org.example.generator.service.ExpressLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("logExpress")
public class ExpressLogController {
    @Autowired
    private ExpressLogService expressLogService;
    @PostMapping("/add")
    public boolean addLog(@RequestBody ExpressLog expressLog){
        // 设置操作时间
        expressLog.setActionTime(new Date());
        System.out.println("记录快递操作时间" + expressLog.getActionTime());
        return expressLogService.save(expressLog);
    }
    @GetMapping("/list")
    public List<ExpressLog> list(){
        return expressLogService.list();
    }

    @PostMapping("/search")
    public Map<String,Object> search(@RequestBody HashMap map){
        // 获取查询字段和值
        String field = map.get("field") != null ? map.get("field").toString() : "";
        String value = map.get("value") != null ? map.get("value").toString() : "";

        LambdaQueryWrapper<ExpressLog> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        if("expressId".equals(field)){
            lambdaQueryWrapper.like(ExpressLog::getExpressId,value);
        }else if("trackingNumber".equals(field)){
            lambdaQueryWrapper.like(ExpressLog::getTrackingNumber,value);
        }
        // 根据模糊查询结果执行查询
        List<ExpressLog> result = expressLogService.list(lambdaQueryWrapper);

        // 构造返回结果
        Map<String,Object> res = new HashMap<>();
        res.put("code",200);
        res.put("message","success");
        res.put("data",result);
        return res;
    }
}
