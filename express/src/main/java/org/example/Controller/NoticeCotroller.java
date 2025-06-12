package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.generator.entity.Admin;
import org.example.generator.entity.Notice;
import org.example.generator.entity.Shelf;
import org.example.generator.service.AdminService;
import org.example.generator.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.xml.crypto.Data;
import java.util.*;

@RestController
@RequestMapping("/notice")
public class NoticeCotroller {
    @Autowired
    private NoticeService noticeService;
    @Autowired
    private AdminService adminService;

    @PostMapping("/add")
    public Map<String, Object> add(@RequestBody Notice notice) {
        Map<String, Object> response = new HashMap<>();
        // 校验标题是否为空
        // 校验标题是否为空
        if (notice.getTitle() == null || notice.getTitle().trim().isEmpty()) {
            response.put("message", "公告标题不能为空");
            return response;
        }

        // 校验内容是否为空
        if (notice.getContent() == null || notice.getContent().trim().isEmpty()) {
            response.put("message", "公告内容不能为空");
            return response;
        }

        // 校验截止时间是否为空
        if (notice.getExpiryAt() == null) {
            response.put("message", "公告截止时间不能为空");
            return response;
        }


        boolean isAdd = noticeService.save(notice);
        if(isAdd){
            Notice notice1 = noticeService.getById(notice.getNoticeId());
            response.put("code",200);
            response.put("data",notice1);
            if(notice.getStatus() == 0){
                response.put("message","草稿保存成功");
            }else if(notice.getStatus() == 1){
                response.put("message","公告发布成功");
            }

        }else {
            response.put("message","草稿保存失败");
        }
        return response;
    }

    @PostMapping("/listPage")
    public Map<String, Object> listPage(@RequestBody HashMap map) {

        // 获取页码和每页大小
        long pageNum = Long.parseLong(map.get("pageNum").toString());
        long pageSize = Long.parseLong(map.get("pageSize").toString());

        String field = map.get("field") != null ? map.get("field").toString() : "";
        String value = map.get("value") != null ? map.get("value").toString() : "";

        Page<Notice> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Notice> lambdaQueryWrapper = new LambdaQueryWrapper<>();

        // 排除草稿状态的公告
        lambdaQueryWrapper.ne(Notice::getStatus, 0);

        if ("title".equals(field)) {
            lambdaQueryWrapper.like(Notice::getTitle, value); // 按标题模糊查询
        } else if ("author".equals(field)) {
            lambdaQueryWrapper.like(Notice::getAuthor, value); // 按货架备注查询
        }

        lambdaQueryWrapper.like(Notice::getStatus,map.get("status"));
        lambdaQueryWrapper.like(Notice::getType,map.get("type"));

        IPage<Notice> result = noticeService.page(page, lambdaQueryWrapper);

//        System.out.println("total = " + result.getTotal());

        // 返回包含总记录数和分页数据的 Map
        Map<String, Object> response = new HashMap<>();
        response.put("total", result.getTotal());
        response.put("list", result.getRecords());
        return response;
    }
    @PostMapping("/myDraftPage")
    public Map<String, Object> draftPage(@RequestBody HashMap map) {

        // 获取页码和每页大小
        long pageNum = Long.parseLong(map.get("pageNum").toString());
        long pageSize = Long.parseLong(map.get("pageSize").toString());

        String field = map.get("field") != null ? map.get("field").toString() : "";
        String value = map.get("value") != null ? map.get("value").toString() : "";

        Page<Notice> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Notice> lambdaQueryWrapper = new LambdaQueryWrapper<>();

        lambdaQueryWrapper.eq(Notice::getStatus, 0);
        lambdaQueryWrapper.eq(Notice::getAdminId, map.get("adminId"));


        IPage<Notice> result = noticeService.page(page, lambdaQueryWrapper);

        System.out.println("draft total = " + result.getTotal());

        // 返回包含总记录数和分页数据的 Map
        Map<String, Object> response = new HashMap<>();
        response.put("total", result.getTotal());
        response.put("list", result.getRecords());
        return response;
    }
    @PostMapping("/update")
    public Map<String, Object> updateNotice(@RequestBody Notice notice) {
        Map<String, Object> response = new HashMap<>();
        // 校验标题是否为空
        if (notice.getTitle() == null || notice.getTitle().trim().isEmpty()) {
            response.put("code",400);
            response.put("message", "公告标题不能为空");
            return response;
        }
        // 校验内容是否为空
        if (notice.getContent() == null || notice.getContent().trim().isEmpty()) {
            response.put("code",400);
            response.put("message", "公告内容不能为空");
            return response;
        }
        // 校验截止时间是否为空
        if (notice.getExpiryAt() == null) {
            response.put("code",400);
            response.put("message", "公告截止时间不能为空");
            return response;
        }
        boolean update = noticeService.updateById(notice);
        if(update){
            Notice notice1 = noticeService.getById(notice.getNoticeId());
//            response.put("code",201);
            response.put("data",notice1);
            if(notice.getStatus() == 1){
                response.put("code",201);
                response.put("message","公告发布成功");
            }else {
                response.put("code",202);
                response.put("message","公告保存成功");
            }
        }else {
            response.put("code",400);
            if(notice.getStatus() == 1){
                response.put("message","公告发布失败");
            }else {
                response.put("message","公告保存失败");
            }
        }
        return response;
    }
    @PostMapping("/updateNoticeStatus")
    public Map<String,Object> updateNoticeStatus(@RequestBody Notice notice){
        Map<String,Object> response = new HashMap<>();
        boolean update = noticeService.updateById(notice);
        if(update){
            Notice notice1 = noticeService.getById(notice.getNoticeId());
            response.put("code",200);
            response.put("data",notice1);
            response.put("message","公告已过期");
        }else {
            response.put("code",400);
            response.put("message","状态更新失败");
        }
        return response;
    }
    @GetMapping("/delete")
    public boolean deleteNotice(@RequestParam("noticeId") Integer noticeId){
        return noticeService.removeById(noticeId);
    }

    // 获取已经发布的公告
    @PostMapping("/getAllPublished")
    public Map<String, Object> getAllPublishedNotices() {
        Map<String, Object> response = new HashMap<>();

        // 查询所有已发布的公告（status = 1）
        LambdaQueryWrapper<Notice> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Notice::getStatus, 1);

        List<Notice> publishedNotices = noticeService.list(queryWrapper);

        if (!publishedNotices.isEmpty()) {
            response.put("code", 200);
            response.put("data", publishedNotices);
            response.put("message", "获取已发布公告成功");
        } else {
            response.put("code", 400);
            response.put("message", "暂无已发布公告");
        }

        return response;
    }

    @GetMapping("/getDetail/{id}")
    public Map<String, Object> getNoticeDetail(@PathVariable("id") Integer id) {
        Map<String, Object> response = new HashMap<>();

        // 查询公告详情
        Notice notice = noticeService.getById(id);
        if (notice != null) {
            // 增加阅读量
            notice.setPageViews(notice.getPageViews() + 1);
            noticeService.updateById(notice);

            response.put("code", 200);
            response.put("data", notice);
            response.put("message", "获取公告详情成功");
        } else {
            response.put("code", 400);
            response.put("message", "公告不存在");
        }

        return response;
    }

}
