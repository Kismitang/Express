package org.example.Controller;

import org.example.generator.entity.AdminFinancialAccess;
import org.example.generator.service.AdminFinancialAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("AFA")
public class AdminFinancialAccessController {
    @Autowired
    private AdminFinancialAccessService adminFinancialAccessService;

    // 1.新增查看记录
    @PostMapping("add")
    public boolean addAFA(@RequestBody AdminFinancialAccess adminFinancialAccess) {
//        System.out.println("adminId" + adminFinancialAccess.getAdminId());
        return adminFinancialAccessService.save(adminFinancialAccess);
    }

    // 2.获取所有查看财务表的管理员信息
    @GetMapping("/list")
    public List<AdminFinancialAccess> list(){
        return adminFinancialAccessService.list();
    }

}
