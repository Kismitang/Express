package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.generator.entity.HzTask;
import org.example.generator.service.HzTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/hzTask")
public class HzTaskController {
    @Autowired
    private HzTaskService hzTaskService;

    // 新增互助取件任务
    @PostMapping("/add")
    public Map<String, Object> addTask(@RequestBody HzTask hzTask) {
        boolean isAdd = hzTaskService.save(hzTask);
        Map<String, Object> response = new HashMap<>();
        if(isAdd){
            HzTask hzTask1 = hzTaskService.getById(hzTask.getTaskId());
            response.put("code", 200);
            response.put("data", hzTask1);
        }else {
            response.put("code", 400);
            response.put("message","互助取件生成失败");
        }
        return response;
    }

    // 更新互助取件任务
    @PostMapping("/update")
    public boolean updateHzTask(@RequestBody HzTask hzTask) {
        System.out.println("状态:" + hzTask.getTaskStatus() + " 代取人电话:" + hzTask.getEmployerPhone());
        // 如果任务状态更新为2,则设置完成时间为当前时间
        if(hzTask.getTaskStatus() == 2) {
            hzTask.setCompleteTime(new Date());
            System.out.println("完成时间: " + hzTask.getCompleteTime());
        }
        // 如果任务状态更新为1,则设置预计完成时间为当前时间后的半小时
        if(hzTask.getTaskStatus() == 1 || hzTask.getTaskStatus() == 0) {
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(new Date());
            calendar.add(Calendar.MINUTE, 30);
            hzTask.setDeliveryAt(calendar.getTime());
//            hzTask.setEmployerPhone(hzTask.getEmployerPhone());
            System.out.println("预计到达时间: " + hzTask.getDeliveryAt());
        }
        return hzTaskService.updateById(hzTask);
    }

    // 删除互助取件任务
    @GetMapping("/delete")
    public boolean delete(@RequestParam("taskId") Integer hzTaskId) {
        System.out.println("删除任务ID:"+hzTaskId);
        return hzTaskService.removeById(hzTaskId);
    }

    // 根据用户电话号码查询所有互助取件信息
    @PostMapping("/taskByPhone")
    public Map<String, Object> getTaskByPhone(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String phone = request.get("courierPhone");
        try {
            LambdaQueryWrapper<HzTask> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(HzTask::getCourierPhone, phone);// 根据电话号码查询
            List<HzTask> hzTaskList = hzTaskService.list(queryWrapper);
            response.put("code", 200);
            response.put("data", hzTaskList);
        }catch (Exception e) {
            response.put("code", 400);
            response.put("message", "查询失败:" + e.getMessage());
        }
        return response;
    }

    // 获取状态为待接单的全部互助取件信息
    @GetMapping("/allTask")
    public List<HzTask> getAllTasks() {
//        LambdaQueryWrapper<HzTask> queryWrapper = new LambdaQueryWrapper<>();
//        queryWrapper.eq(HzTask::getTaskStatus, 0); // 状态为待接单
        return hzTaskService.list();
    }
}
