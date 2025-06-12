package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.generator.entity.Admin;
import org.example.generator.entity.AdminActionShelfLog;
import org.example.generator.entity.Express;
import org.example.generator.mapper.AdminActionShelfLogMapper;
import org.example.generator.service.AdminActionShelfLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/logShelf")
public class AdminActionShelfLogController {
    @Autowired
    private AdminActionShelfLogService adminActionShelfLogService;
    @Autowired
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired
    private AdminActionShelfLogMapper adminActionShelfLogMapper;

    // 新增一条操作记录
    @PostMapping("/add")
    public boolean addLog(@RequestBody AdminActionShelfLog log){
        // 设置操作时间
        log.setActionTime(new Date());
        return adminActionShelfLogService.save(log);
    }
    // 查询全部操作记录
    @GetMapping("/list")
    public List<AdminActionShelfLog> list(){
        return adminActionShelfLogService.list();
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


        LambdaQueryWrapper<AdminActionShelfLog> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        if("adminId".equals(field)){
            lambdaQueryWrapper.like(AdminActionShelfLog::getAdminId,value);
        }else if("actionType".equals(field)){
            lambdaQueryWrapper.like(AdminActionShelfLog::getActionType,value);
        }
        // 根据时间查询
        if (actionTime != null) {
            try {
                // 解析时间字符串为 Date 类型
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                Date startTime = dateFormat.parse(actionTime); // 当天的起始时间（00:00:00）
                Date endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000 - 1); // 当天的结束时间（23:59:59）

                // 添加时间范围查询条件
                lambdaQueryWrapper.between(AdminActionShelfLog::getActionTime, startTime, endTime);
            } catch (Exception e) {
                e.printStackTrace();
                Map<String, Object> errorRes = new HashMap<>();
                errorRes.put("code", 400);
                errorRes.put("message", "时间格式错误");
                return errorRes;
            }
        }
        // 根据模糊查询结果执行查询
        List<AdminActionShelfLog> result = adminActionShelfLogService.list(lambdaQueryWrapper);

        // 构造返回结果
        Map<String,Object> res = new HashMap<>();
        res.put("code",200);
        res.put("message","success");
        res.put("data",result);
        return res;
    }

    // 删除
    @GetMapping("/delete")
    public boolean delete(@RequestParam("logId") Integer logId){
        return adminActionShelfLogService.removeById(logId);
    }
//    @GetMapping("/delete")
//    public int deleteAdmin(@RequestParam("logId") Integer logId) {
//        return adminActionShelfLogMapper.deleteById(logId);
//    }

}
