package org.example.Controller;

import com.aliyun.oss.OSS;
import org.apache.logging.log4j.message.ReusableMessage;
import org.example.common.Result;
import org.example.generator.entity.Admin;
import org.example.generator.entity.User;
import org.example.generator.mapper.AdminMapper;
import org.example.generator.mapper.UserMapper;
import org.example.generator.service.AdminService;
import org.example.generator.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;
@RestController
@RequestMapping("/upload")
public class UploadController {
    @Autowired
    private OSS ossClient;

    @Autowired
    private AdminMapper adminMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    @Value("${oss.bucketName}")
    private String bucketName;

    @Value("${oss.endpoint}")
    private String endpoint;

    @PostMapping("/upload-avatar")
    @Transactional(rollbackFor = Exception.class)
    public Result uploadAvatar(@RequestParam("file") MultipartFile file,
                               @RequestParam("adminId") Integer adminId) {
        try {
            // 1.校验文件
            if(file.isEmpty()){
                return Result.fail("文件不能为空");
            }
            if(!file.getContentType().startsWith("image/")){
                return Result.fail("仅支持图片格式");
            }
            if(file.getSize()>5*1024*1024){
                return Result.fail("文件大小不能超过5MB");
            }
            // 2.生成唯一文件名
            String fileName = "avatar/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

            // 3.上传到OSS
            ossClient.putObject(bucketName, fileName, new ByteArrayInputStream(file.getBytes()));

            // 4.生成访问URL（根据实际需要选择是否使用签名URL）
            String url = "https://" + bucketName + "." + endpoint + "/" + fileName;

            System.out.println("adminId:" + adminId);
            Admin admin = adminService.getById(adminId);
            System.out.println("头像更新前的URL" + admin.getAvatarUrl());

            // 5.更新数据库
            adminMapper.updateAvatar(adminId, url);

            // 再次根据adminId查询数据库
            admin = adminService.getById(adminId);
            System.out.println("头像更新后的URL" + admin.getAvatarUrl());

            return Result.suc(url);
        } catch (IOException e) {
            return Result.fail("文件上传失败");
        }
    }

    /**
     * 用户头像更新
     * @param file
     * @param userId
     * @return
     */
    @PostMapping("/upload-avatar-user")
    @Transactional(rollbackFor = Exception.class)
    public Result uploadAvatarUser(@RequestParam("file") MultipartFile file,
                               @RequestParam("userId") Integer userId) {
        try {
            // 1.校验文件
            if(file.isEmpty()){
                return Result.fail("文件不能为空");
            }
            if(!file.getContentType().startsWith("image/")){
                return Result.fail("仅支持图片格式");
            }
            if(file.getSize()>5*1024*1024){
                return Result.fail("文件大小不能超过5MB");
            }
            // 2.生成唯一文件名
            String fileName = "avatar/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

            // 3.上传到OSS
            ossClient.putObject(bucketName, fileName, new ByteArrayInputStream(file.getBytes()));

            // 4.生成访问URL（根据实际需要选择是否使用签名URL）
            String url = "https://" + bucketName + "." + endpoint + "/" + fileName;

            System.out.println("adminId:" + userId);
            User user = userService.getById(userId);
            System.out.println("头像更新前的URL" + user.getAvatarUrl());

            // 5.更新数据库
            userMapper.updateAvatar(userId, url);

            // 再次根据adminId查询数据库
            user = userService.getById(userId);
            System.out.println("头像更新后的URL" + user.getAvatarUrl());

            return Result.suc(url);
        } catch (IOException e) {
            return Result.fail("文件上传失败");
        }
    }
}
