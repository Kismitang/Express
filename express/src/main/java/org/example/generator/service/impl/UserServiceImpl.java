package org.example.generator.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.example.generator.entity.Admin;
import org.example.generator.entity.User;
import org.example.generator.mapper.UserMapper;
import org.example.generator.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.beans.PropertyEditorSupport;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
* @author 18959
* @description 针对表【user】的数据库操作Service实现
* @createDate 2025-02-27 09:31:53
*/
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User>
    implements UserService {
    @Autowired
    UserMapper userMapper;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Override
    // 1.查询-用户名-模糊
    public List<User> listByUserName(@RequestBody User user){
        LambdaQueryWrapper<User> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.like(User::getName,user.getName());
        return this.baseMapper.selectList(lambdaQueryWrapper);
    }
    @Override
    // 2.查询-电话号码-精准
    public List<User> listByPhone(@RequestBody User user){
        LambdaQueryWrapper<User> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(User::getPhone,user.getPhone());
        return this.baseMapper.selectList(lambdaQueryWrapper);
    }
    // 3.查询-状态
    public List<User> listByStatus(@RequestBody User user){
        LambdaQueryWrapper<User> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(User::getStatus,user.getStatus());
        return this.baseMapper.selectList(lambdaQueryWrapper);
    }

    // 4.添加-员工
    @Override
    public Map<String, Object> addUser(User user) {
        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 保存管理员信息
        boolean result = userMapper.insert(user) > 0;

        Map<String, Object> response = new HashMap<>();
        response.put("result",result);
        if(result) {
            // 重新从数据库获取最新数据
            User user1 = userMapper.selectById(user.getUserId());
            response.put("data", user1);
            response.put("message","success");
        }else {
            response.put("message","fail");
        }
        return response;
    }

    // 5. 余额扣除
    @Override
    public Map<String, Object> dedutBalance(String phone, Double cost) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, phone));
        Map<String, Object> response = new HashMap<>();

        if (user == null) {
            response.put("code", "404");
            response.put("message", "用户不存在");
            response.put("data", null);
        } else {
            // 使用 BigDecimal 保留两位小数
            BigDecimal costDecimal = new BigDecimal(cost).setScale(2, RoundingMode.HALF_UP);
            Double costFormatted = costDecimal.doubleValue();

            if (user.getBalance() >= costFormatted) {
                // 使用 BigDecimal 计算新的余额，并保留两位小数
                BigDecimal newBalance = new BigDecimal(user.getBalance() - costFormatted).setScale(2, RoundingMode.HALF_UP);
                user.setBalance(newBalance.doubleValue());
                userMapper.updateById(user);
                response.put("code", "200");
                response.put("message", "余额扣除成功");
                response.put("data", user);
            } else {
                response.put("code", "400");
                response.put("message", "余额不足");
                response.put("data", user);
            }
            // 打印余额时也使用 BigDecimal 保留两位小数
//            System.out.println("剩下的余额:" + new BigDecimal(user.getBalance()).setScale(2, RoundingMode.HALF_UP).doubleValue());
        }
        return response;
    }

    // 6.代取件收入
    @Override
    public Map<String, Object> addBalance(String phone, Double amount) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, phone));
        BigDecimal commission; // 驿站抽成
        Map<String, Object> response = new HashMap<>();

        if (user == null) {
            response.put("code", "404");
            response.put("message", "用户不存在");
            response.put("data", null);
        } else {
            // 判断用户代取件次数
            if (user.getPickupCount() <= 10) {
                // 平台提取10%的抽成，并保留两位小数
                commission = new BigDecimal(0.1 * amount).setScale(2, RoundingMode.HALF_UP);
                user.setPickupCount(user.getPickupCount() + 1);
            } else {
                // 平台提取5%的抽成，并保留两位小数
                commission = new BigDecimal(0.05 * amount).setScale(2, RoundingMode.HALF_UP);
                user.setPickupCount(user.getPickupCount() + 1);
            }
            // 计算实际收入（amount - commission）
            BigDecimal actualIncome = new BigDecimal(amount).subtract(commission).setScale(2, RoundingMode.HALF_UP);

            // 将用户余额和实际收入转换为 BigDecimal 并进行计算
            BigDecimal currentBalance = new BigDecimal(user.getBalance()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal newBalance = currentBalance.add(actualIncome).setScale(2, RoundingMode.HALF_UP);

            // 使用 BigDecimal 作为余额存储类型，避免精度问题
            user.setBalance(newBalance.doubleValue());

            userMapper.updateById(user);
            response.put("code", 200);
            response.put("commission", commission); // 平台抽成
            response.put("actualIncome", actualIncome); // 用户单笔实际收入
            response.put("newBalance", newBalance); // 用户当前余额

            // 打印相关信息
//            System.out.println("实际收入: " + actualIncome);
//            System.out.println("新的余额: " + newBalance);
        }
        return response;
    }

}




