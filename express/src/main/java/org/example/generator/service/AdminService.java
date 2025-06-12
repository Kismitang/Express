package org.example.generator.service;

import org.example.common.Result;
import org.example.generator.entity.Admin;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【admin】的数据库操作Service
* @createDate 2025-02-24 17:36:07
*/
public interface AdminService extends IService<Admin> {


    List<Admin> listByName(@RequestBody Admin admin);
    List<Admin> listByStatus(@RequestBody Admin admin);
    List<Admin> listByWorkStatus(@RequestBody Admin admin);
    Map<String,Object> addAdmin(Admin admin);
}
