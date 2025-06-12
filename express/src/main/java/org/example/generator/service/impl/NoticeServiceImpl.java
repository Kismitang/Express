package org.example.generator.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.example.generator.entity.Notice;
import org.example.generator.mapper.NoticeMapper;
import org.example.generator.service.NoticeService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.List;

/**
* @author 18959
* @description 针对表【notice】的数据库操作Service实现
* @createDate 2025-03-09 15:07:57
*/
@Service
public class NoticeServiceImpl extends ServiceImpl<NoticeMapper, Notice>
    implements NoticeService {
    @Override
    public void updateTimeoutNotices() {
//        System.out.println("进入 updateTimeoutNotices 方法，开始更新公告状态");
        // 获取所有状态为发布的公告
        List<Notice> notices = list(new LambdaQueryWrapper<Notice>().eq(Notice::getStatus, 1));

        for (Notice notice : notices) {
            if (notice.getExpiryAt() != null) {
                Date expiryDate = notice.getExpiryAt();
                Instant expiryInstant = expiryDate.toInstant(); // 将Date转换为Instant
                Instant currentInstant = Instant.now();

//                System.out.println("当前处理公告:"+notice.getNoticeId()+",过期时间:"+expiryDate+",当前时间:"+currentInstant);
                if (expiryInstant.isBefore(currentInstant)) {
//                    System.out.println("公告:"+notice.getTitle()+"已过期,即将更新状态为过期");
                    notice.setStatus(3); // 设置为过期状态
                    updateById(notice); // 更新数据库
//                    System.out.println("公告:"+notice.getTitle()+"状态更新为过期成功。");
                }else {
//                    System.out.println("公告:"+notice.getTitle()+"尚未过期1");
                }
            }
        }
    }
}




