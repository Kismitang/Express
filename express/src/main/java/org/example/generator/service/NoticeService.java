package org.example.generator.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.example.generator.entity.Notice;

/**
* @author 18959
* @description 针对表【notice】的数据库操作Service
* @createDate 2025-03-09 15:07:57
*/
public interface NoticeService extends IService<Notice> {
    void updateTimeoutNotices();
}
