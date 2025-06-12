package org.example.config;

import org.example.generator.entity.Notice;
import org.example.generator.service.ExpressService;
import org.example.generator.service.HzTaskService;
import org.example.generator.service.NoticeService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class TaskScheduler {

    private final HzTaskService hzTaskService;

    private final NoticeService noticeService;

    private final ExpressService expressService;

    public TaskScheduler(HzTaskService hzTaskService, NoticeService noticeService, ExpressService expressService) {
        this.hzTaskService = hzTaskService;
        this.noticeService = noticeService;
        this.expressService = expressService;
    }

    // 每分钟执行一次
    @Scheduled(cron = "0 * * * * ?")
    public void checkTaskTimeout() {
        hzTaskService.updateTimeoutTasks();
        expressService.updateOverdueExpress();
    }

    @Scheduled(cron = "0 */1 * * * ?")
    public void checkNoticeTimeout() {
        noticeService.updateTimeoutNotices();
    }

}