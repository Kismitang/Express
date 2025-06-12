package org.example.Controller;

//import org.example.entity.Admin;
//import org.example.service.AdminService;
import jakarta.annotation.Resource;
import org.example.generator.entity.Admin;
import org.example.generator.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("hello")
public class helloController {
    @GetMapping
    public String hello(){
        return "hello world";
    }
    @Resource
    private AdminService adminService;
    @ResponseBody
    @GetMapping("/list")
    public List<Admin> list(){
        return adminService.list();
    }
    @GetMapping("/1")
    public String sorry(){
        return "你好";
    }
}
