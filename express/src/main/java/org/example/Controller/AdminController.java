package org.example.Controller;

import ch.qos.logback.core.util.StringUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Lang;
import org.example.common.QueryPageParam;
import org.example.common.Result;
import org.example.generator.entity.Admin;
import org.example.generator.mapper.AdminMapper;
import org.example.generator.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private AdminService adminService;

    @Autowired
    private AdminMapper adminMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1.获取所有管理员信息
    @GetMapping("/list")
    public List<Admin> list() {
        return adminService.list();
    }

    //2.新增管理员
    @PostMapping("/add")
    public Map<String, Object> addAdmin(@RequestBody Admin admin) {
        return adminService.addAdmin(admin);
    }
    //3.修改信息
    @PostMapping("/update")
    public Map<String, Object> updateAdmin(@RequestBody Admin admin) {
        System.out.println("Updating admin:" + admin.toString());

        // 获取数据库中当前的管理员信息
        Admin existingAdmin = adminService.getById(admin.getAdminId());

        // 判断密码是否被修改
        if(admin.getPassword() != null && !passwordEncoder.matches(admin.getPassword(),existingAdmin.getPassword())){
            // 对新密码进行加密
            String encodedPassword = passwordEncoder.encode(admin.getPassword());
//            System.out.println("密码被修改");
            admin.setPassword(encodedPassword);
        }else {
//            System.out.println("密码保持未修改");
            // 如果密码未被修改，保持原密码不变
            admin.setPassword(existingAdmin.getPassword());
        }

        // 更新管理员信息
        boolean success = adminService.updateById(admin);
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        if (success) {
            // 重新从数据库获取最新数据
            Admin updateAdmin = adminService.getById(admin.getAdminId());
            response.put("data", updateAdmin);
        }
        return response;
    }

    // 4.删除管理员
    @GetMapping("/delete")
    public int deleteAdmin(@RequestParam("adminId") Long adminId) {
        return adminMapper.deleteById(adminId);
    }

    // 5.查询-名字)
    @PostMapping("/searchByName")
    public List<Admin> listByName(@RequestBody Admin admin) {
        return adminService.listByName(admin);
    }

    // 6.查询-账号状态
    @PostMapping("/searchByStatus")
    public List<Admin> listByStatus(@RequestBody Admin admin) {
        return adminService.listByStatus(admin);
    }

    // 7.查询-工作状态
    @PostMapping("/searchByWorkStatus")
    public List<Admin> listByWorkStatus(@RequestBody Admin admin) {
        return adminService.listByWorkStatus(admin);
    }
    // 8.分页
    @PostMapping("/listPage")
    public Map<String, Object> listPage(@RequestBody HashMap map) {

        // 获取页码和每页大小
        long pageNum = Long.parseLong(map.get("pageNum").toString());
        long pageSize = Long.parseLong(map.get("pageSize").toString());

        String field = map.get("field") != null ? map.get("field").toString() : "";
        String value = map.get("value") != null ? map.get("value").toString() : "";

        Page<Admin> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Admin> lambdaQueryWrapper = new LambdaQueryWrapper<>();


        if ("name".equals(field)) {
            lambdaQueryWrapper.like(Admin::getName, value); // 按姓名查询
        } else if ("phone".equals(field)) {
            lambdaQueryWrapper.like(Admin::getPhone, value); // 按电话号码查询
        }

        lambdaQueryWrapper.like(Admin::getRole,map.get("role"));
        lambdaQueryWrapper.like(Admin::getStatus,map.get("status"));
        lambdaQueryWrapper.like(Admin::getWorkStatus,map.get("workStatus"));

        // 按照员工角色和工作状态进行排序
        lambdaQueryWrapper.orderByDesc(Admin::getRole)
                .orderByDesc(Admin::getWorkStatus);
        IPage<Admin> result = adminService.page(page, lambdaQueryWrapper);
//        System.out.println("total = " + result.getTotal());

        // 返回包含总记录数和分页数据的 Map
        Map<String, Object> response = new HashMap<>();
        response.put("total", result.getTotal());
        response.put("list", result.getRecords());
        return response;
    }
    // 10.登录
    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody Admin admin){
        // 匹配手机号
        List<Admin> list = adminService.lambdaQuery()
                    .eq(Admin::getPhone,admin.getPhone())
                    .list();
        Map<String,Object> res = new HashMap<>();
        if(list.size()>0){
            // 获取匹配的Admin对象
            Admin matcheAdmin = list.get(0);
//            System.out.println(matcheAdmin.toString());
            // 验证密码
            if(passwordEncoder.matches(admin.getPassword(),matcheAdmin.getPassword())){
                if(matcheAdmin.getWorkStatus()==1){
                    res.put("code",400);
                    res.put("message","账号已经登录,不可重复登录");
                } else if (matcheAdmin.getStatus() == 0) {
                    res.put("code",300);
                    res.put("message", "账号被禁用");
                }else {
//                    matcheAdmin.setWorkStatus(1);
                    adminService.saveOrUpdate(matcheAdmin);
                    res.put("code",200);
                    res.put("data",matcheAdmin);
                    res.put("message","success");
                }
            }else {
                res.put("code",400);
                res.put("message","密码错误");
            }
        }else {
            res.put("code",400);
            res.put("message","用户不存在");
        }
        return res;
    }

}
