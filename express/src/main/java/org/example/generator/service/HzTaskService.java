package org.example.generator.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.example.generator.entity.HzTask;

/**
* @author 18959
* @description 针对表【hz_task】的数据库操作Service
* @createDate 2025-04-23 10:33:36
*/
public interface HzTaskService extends IService<HzTask> {
    void updateTimeoutTasks();
}
