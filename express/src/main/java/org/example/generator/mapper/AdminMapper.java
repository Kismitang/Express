package org.example.generator.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.example.generator.entity.Admin;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import java.util.List;

/**
* @author 18959
* @description 针对表【admin】的数据库操作Mapper
* @createDate 2025-02-24 17:36:07
* @Entity generator.entity.Admin
*/
@Mapper
public interface AdminMapper extends BaseMapper<Admin> {

//    int updateById(Admin admin);
    List<Admin> searchByStatus(@Param("status") Integer status);
    /**
     * 更新管理员头像
     * @param adminId 管理员ID
     * @param avatarUrl 头像URL
     */
    @Update("UPDATE admin SET avatar_url = #{avatarUrl} WHERE admin_id = #{adminId}")
    int updateAvatar(@Param("adminId") Integer adminId, @Param("avatarUrl") String avatarUrl);
}




