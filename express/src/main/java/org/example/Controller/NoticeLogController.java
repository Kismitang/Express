package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.generator.entity.NoticeLog;
import org.example.generator.service.NoticeLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/logNotice")
public class NoticeLogController {
    @Autowired
    private NoticeLogService noticeLogService;
    @PostMapping("/add")
    public boolean addLog(@RequestBody NoticeLog log){
        // 设置操作时间
        log.setActionTime(new Date());
        System.out.println("记录操作记录");
        return noticeLogService.save(log);
    }
    // 查询全部操作记录
    @GetMapping("/list")
    public List<NoticeLog> list(){
        return noticeLogService.list();
    }
    // 搜索
    @PostMapping("/search")
    public Map<String,Object> search(@RequestBody HashMap map){
        // 获取查询字段和值
        String field = map.get("field") != null ? map.get("field").toString() : "";
        String value = map.get("value") != null ? map.get("value").toString() : "";

        // 获取时间参数
        String actionTime = map.get("actionTime") != null ? map.get("actionTime").toString() : null;
        System.out.println("Time:"+actionTime);


        LambdaQueryWrapper<NoticeLog> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        if("adminId".equals(field)){
            lambdaQueryWrapper.like(NoticeLog::getAdminId,value);
        }else if("actionType".equals(field)){
            lambdaQueryWrapper.like(NoticeLog::getActionType,value);
        }
        // 根据时间查询
        if (actionTime != null) {
            try {
                // 解析时间字符串为 Date 类型
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                Date startTime = dateFormat.parse(actionTime); // 当天的起始时间（00:00:00）
                Date endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000 - 1); // 当天的结束时间（23:59:59）

                // 添加时间范围查询条件
                lambdaQueryWrapper.between(NoticeLog::getActionTime, startTime, endTime);
            } catch (Exception e) {
                e.printStackTrace();
                Map<String, Object> errorRes = new HashMap<>();
                errorRes.put("code", 400);
                errorRes.put("message", "时间格式错误");
                return errorRes;
            }
        }
        // 根据模糊查询结果执行查询
        List<NoticeLog> result = noticeLogService.list(lambdaQueryWrapper);

        // 构造返回结果
        Map<String,Object> res = new HashMap<>();
        res.put("code",200);
        res.put("message","success");
        res.put("data",result);
        return res;
    }
}

