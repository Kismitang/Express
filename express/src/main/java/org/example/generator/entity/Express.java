package org.example.generator.entity;

import com.baomidou.mybatisplus.annotation.*;

import java.util.Date;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

/**
 * @TableName express
 */
@TableName(value ="express")
@Data
public class Express {
    @TableId(type = IdType.AUTO)
    private Integer expressId;

    private String trackingNumber;

    private String senderName;

    private String senderPhone;

    private String receiverName;

    private String receiverPhone;

    private String address;

    private String expressDesribe;

    private Integer isTask;

    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private Integer shelfId;

    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private String labelCode;

    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private Date entryAt;

    private Date updatedAt;

    private Integer overstockDay;

    private Integer status;

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Date getEntryAt() {
        return entryAt;
    }

    public void setEntryAt(Date entryAt) {
        this.entryAt = entryAt;
    }

    public Integer getExpressId() {
        return expressId;
    }

    public void setExpressId(Integer expressId) {
        this.expressId = expressId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverPhone() {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone) {
        this.receiverPhone = receiverPhone;
    }

    public String getExpressDesribe() {
        return expressDesribe;
    }

    public void setExpressDesribe(String expressDesribe) {
        this.expressDesribe = expressDesribe;
    }

    public Integer getShelfId() {
        return shelfId;
    }

    public void setShelfId(Integer shelfId) {
        this.shelfId = shelfId;
    }

    public String getLabelCode() {
        return labelCode;
    }

    public void setLabelCode(String labelCode) {
        this.labelCode = labelCode;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getOverstockDay() {
        return overstockDay;
    }

    public void setOverstockDay(Integer overstockTime) {
//        System.out.println("Setting overstockDay to : " + overstockTime);
        this.overstockDay = overstockTime;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getSenderPhone() {
        return senderPhone;
    }

    public void setSenderPhone(String senderPhone) {
        this.senderPhone = senderPhone;
    }

    public Integer getIsTask() {
        return isTask;
    }

    public void setIsTask(Integer isTask) {
        this.isTask = isTask;
    }
}