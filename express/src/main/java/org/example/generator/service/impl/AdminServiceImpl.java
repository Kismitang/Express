package org.example.generator.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import io.micrometer.common.util.StringUtils;
import org.example.common.Result;
import org.example.generator.entity.Admin;
import org.example.generator.service.AdminService;
import org.example.generator.mapper.AdminMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【admin】的数据库操作Service实现
* @createDate 2025-02-24 17:36:07
*/
@Service
public class AdminServiceImpl extends ServiceImpl<AdminMapper, Admin>
    implements AdminService{
    @Autowired
    AdminMapper adminMapper;
    @Autowired
    PasswordEncoder passwordEncoder;
    // 姓名查询（模糊）
    @Override
    public List<Admin> listByName(@RequestBody Admin admin){

        LambdaQueryWrapper<Admin> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.like(Admin::getName,admin.getName());
        return this.baseMapper.selectList(lambdaQueryWrapper);
    }
    // 账号状态查询
    @Override
    public List<Admin> listByStatus(@RequestBody Admin admin){
        System.out.println(admin.getStatus());
        LambdaQueryWrapper<Admin> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(Admin::getStatus,admin.getStatus());
        return this.baseMapper.selectList(lambdaQueryWrapper);
    }
    @Override
    public List<Admin> listByWorkStatus(@RequestBody Admin admin){
        LambdaQueryWrapper<Admin> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        System.out.println(admin.getWorkStatus());
        if(admin.getWorkStatus() == null){
            lambdaQueryWrapper.isNull(Admin::getWorkStatus);
        }else {
            // 精准查询
            lambdaQueryWrapper.eq(Admin::getWorkStatus, admin.getWorkStatus());
        }
        // 执行查询并返回结果
        return this.baseMapper.selectList(lambdaQueryWrapper);
    }

    /**
     * 添加管理员
     */
    @Override

    public Map<String, Object> addAdmin(Admin admin) {
        System.out.println("Add admin:" + admin.toString());

        // 加密密码
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));

        // 保存管理员信息
        boolean result = adminMapper.insert(admin) > 0;

        Map<String, Object> response = new HashMap<>();
        response.put("result", result);
        if (result) {
            // 重新从数据库获取最新数据
            Admin addAdmin = adminMapper.selectById(admin.getAdminId());
            response.put("data", addAdmin);
            response.put("message", "成功");
        } else {
            response.put("message", "失败");
        }
        return response;
    }

    /**
     * 更新admin信息
    */

}




