package org.example.Controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.generator.entity.User;
import org.example.generator.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("delete")
    public Map<String, Object> deleteUser(@RequestParam Integer userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 尝试删除用户
            boolean result = userService.removeById(userId);

            if (result) {
                // 删除成功
                response.put("code", 200);
                response.put("message", "用户删除成功");
                response.put("data", null);
            } else {
                // 用户不存在
                response.put("code", 404);
                response.put("message", "用户不存在");
                response.put("data", null);
            }
        } catch (DataIntegrityViolationException e) {
            // 处理外键约束异常
            response.put("code", 400);
            response.put("message", "当前手机号关联有其他信息，暂时无法删除");
            response.put("data", null);
        } catch (Exception e) {
            // 其他异常
            response.put("code", 500);
            response.put("message", "服务器错误，删除失败");
            response.put("data", null);
        }

        return response;
    }

    // 1.获取所有用户信息
    @GetMapping("/list")
    public List<User>list(){
        return userService.list();
    }
    // 2.新增用户
    @PostMapping("/add")
    public Map<String, Object> addUser(@RequestBody User user){
        return userService.addUser(user);
    }
    // 3.修改用户信息
    @PostMapping("/update")
    public Map<String,Object> updateUser(@RequestBody User user){
        // 获取数据库中当前用户的信息
        User existingUser = userService.getById(user.getUserId());
        // 判断密码是否被修改
        if(user.getPassword() != null && !passwordEncoder.matches(user.getPassword(),existingUser.getPassword())){
            // 对密码进行加密
            String encodePassword = passwordEncoder.encode(user.getPassword());
            System.out.println("用户密码被修改");
            user.setPassword(encodePassword);
        }else {
            System.out.println("密码保持未修改");
            user.setPassword(existingUser.getPassword());
        }
        // 更新员工信息
        boolean success = userService.updateById(user);
        Map<String,Object> response = new HashMap<>();
        response.put("success",success);
        if(success) {
            // 重新从数据库获取最新数据
            User updateUser = userService.getById(user.getUserId());
            response.put("data",updateUser);
        }
        return response;
    }
    // 4.查询-姓名【模糊】
    @PostMapping("/searchByName")
    public List<User> searchByUserName(@RequestBody User user){
        return userService.listByUserName(user);
    }
    // 5.查询-电话号码
    @PostMapping("/searchByPhone")
    public List<User> searchByUserPhone(@RequestBody User user){
        return userService.listByPhone(user);
    }
    // 6.查询-状态
    @PostMapping("/searchByStatus")
    public List<User> searchByUserStatus(@RequestBody User user){
        return userService.listByStatus(user);
    }
    // 7. 分页+查询
    @PostMapping("/listPage")
    public Map<String, Object> listPage(@RequestBody HashMap map) {

        // 获取页码和每页大小
        long pageNum = Long.parseLong(map.get("pageNum").toString());
        long pageSize = Long.parseLong(map.get("pageSize").toString());

        String field = map.get("field") != null ? map.get("field").toString() : "";
        String value = map.get("value") != null ? map.get("value").toString() : "";

        Page<User> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<User> lambdaQueryWrapper = new LambdaQueryWrapper<>();


        if ("name".equals(field)) {
            lambdaQueryWrapper.like(User::getName, value); // 按货架名查询
        } else if ("phone".equals(field)) {
            lambdaQueryWrapper.like(User::getPhone, value); // 按货架备注查询
        }

        lambdaQueryWrapper.like(User::getStatus,map.get("status"));
        IPage<User> result = userService.page(page, lambdaQueryWrapper);
        System.out.println("total = " + result.getTotal());

        // 返回包含总记录数和分页数据的 Map
        Map<String, Object> response = new HashMap<>();
        response.put("total", result.getTotal());
        response.put("list", result.getRecords());
        return response;
    }

    // 8.用户登录
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User user) {
        // 匹配手机号
        List<User> list = userService.lambdaQuery()
                .eq(User::getPhone, user.getPhone())
                .list();
        Map<String, Object> res = new HashMap<>();
        if(list.size() > 0){ // 手机号存在
            User matcheUser = list.get(0);
            // 验证密码
            if(passwordEncoder.matches(user.getPassword(),matcheUser.getPassword())){
                if(matcheUser.getStatus()==0){
                    res.put("code",400);
                    res.put("message","账号因违反平台规则被禁用");
                } else {
                    // 登录成功
                    res.put("code",200);
                    res.put("message","登录成功");
                    res.put("data",matcheUser);
                }
            }else {
                res.put("code",400);
                res.put("message","密码错误");
            }
        }else {
            res.put("code",400);
            res.put("message","手机号不存在");
        }
        return res;
    }

    // 9. 余额扣除
    @PostMapping("dedutBalance")
    public Map<String, Object> dedutBalance(@RequestBody Map<String, Object> request) {
        String phone = (String) request.get("phone");
        Object costObj = request.get("cost");
        Double cost;

        if (costObj instanceof Integer) {
            cost = ((Integer) costObj).doubleValue();
        } else if (costObj instanceof Double) {
            cost = (Double) costObj;
        } else {
            throw new IllegalArgumentException("Invalid cost format");
        }

//        System.out.println("Received phone: " + phone + ", cost: " + cost);
        return userService.dedutBalance(phone, cost);
    }

    // 10. 代取件收入
    @PostMapping("addBalance")
    public Map<String, Object> addBalance(@RequestBody Map<String, Object> request) {
        String phone = (String) request.get("phone");
        Object costObj = request.get("amount");
        Double amount;

        if (costObj instanceof Integer) {
            amount = ((Integer) costObj).doubleValue();
        } else if (costObj instanceof Double) {
            amount = (Double) costObj;
        } else {
            throw new IllegalArgumentException("Invalid cost format");
        }

//        System.out.println("employerPhone : " + phone + ", amount: " + amount);
        return userService.addBalance(phone, amount);
    }

    // 充值方法
    @PostMapping("/recharge")
    public Map<String, Object> recharge(@RequestBody Map<String, Object> request) {
        // 获取前端传递的用户id和充值金额
        Integer userId = (Integer) request.get("userId");
        Object amountObj = request.get("amount");
        Double amount;

        if (amountObj instanceof Integer) {
            amount = ((Integer) amountObj).doubleValue();
        } else if (amountObj instanceof Double) {
            amount = (Double) amountObj;
        } else {
            throw new IllegalArgumentException("Invalid amount format");
        }

        // 根据用户id查询用户
        User user = userService.getById(userId);
        if (user == null) {
            // 用户不存在
            Map<String, Object> res = new HashMap<>();
            res.put("code", 400);
            res.put("message", "用户不存在");
            return res;
        }

        // 计算新的余额并保留两位小数
        Double newBalance = user.getBalance() + amount;
        DecimalFormat df = new DecimalFormat("#.##");
        newBalance = Double.parseDouble(df.format(newBalance));

        // 更新用户余额
        user.setBalance(newBalance);

        // 更新用户信息
        boolean success = userService.updateById(user);

        // 返回响应
        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("code", 200);
            response.put("message", "充值成功");
            response.put("data", user);
        } else {
            response.put("code", 400);
            response.put("message", "充值失败");
        }
        return response;
    }
}
