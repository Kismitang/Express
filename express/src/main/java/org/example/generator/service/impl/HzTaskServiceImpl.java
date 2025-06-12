package org.example.generator.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.example.generator.entity.Express;
import org.example.generator.entity.HzTask;
import org.example.generator.mapper.HzTaskMapper;
import org.example.generator.service.ExpressService;
import org.example.generator.service.HzTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
* @author 18959
* @description 针对表【hz_task】的数据库操作Service实现
* @createDate 2025-04-23 10:33:36
*/
@Service
public class HzTaskServiceImpl extends ServiceImpl<HzTaskMapper, HzTask>
    implements HzTaskService {
    @Autowired
    private ExpressService expressService; // 注入快递服务
    @Override
    @Transactional // 确保事务管理
    public void updateTimeoutTasks() {
        // 查询所有状态为“待接单”且截止时间已过的任务
        LambdaQueryWrapper<HzTask> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(HzTask::getTaskStatus, 0); // 假设0表示“待接单”
        queryWrapper.lt(HzTask::getDeadline, LocalDateTime.now());

        // 获取所有过期任务
        List<HzTask> timeoutTasks = this.list(queryWrapper);

        // 如果没有超时任务，则直接返回
        if (timeoutTasks.isEmpty()) {
            return;
        }

        // 更新任务状态为“超时”（假设3表示“超时”）
        LambdaUpdateWrapper<HzTask> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.set(HzTask::getTaskStatus, 3);
        updateWrapper.eq(HzTask::getTaskStatus, 0); // 只更新taskStatus等于0的记录
        updateWrapper.lt(HzTask::getDeadline, LocalDateTime.now());

        this.update(updateWrapper);

        // 根据过期任务的 expressId 更新快递表中的 isTask 为0，并复制 labelCode
        for (HzTask task : timeoutTasks) {
            Express express = expressService.getById(task.getExpressId()); // 获取快递记录
            if (express != null) {
                express.setIsTask(0); // 更新 isTask 为0
                express.setLabelCode(task.getLabelCode()); // 复制任务中的 labelCode 到快递
                expressService.updateById(express); // 更新快递表
            }
        }
    }
}




