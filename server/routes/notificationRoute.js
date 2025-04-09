import express from 'express';
import mongoose from 'mongoose';
import Notification from '../model/notificationDB.js';

const router = express.Router();

// Get admin notifications (new vouchers)
router.get('/notifications/admin', async (req, res) => {
    try {
        const notifications = await Notification.find({
            type: 'new_voucher'
        })
        .sort({ createdAt: -1 })
        .limit(50);
        
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching admin notifications:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get staff notifications (approved vouchers and tasks)
router.get('/notifications/staff', async (req, res) => {
    try {
        const { staffEmail } = req.query;
        
        if (!staffEmail) {
            return res.status(400).json({ message: 'Staff email is required' });
        }

        // Find notifications where this staff is the target
        const notifications = await Notification.find({
            staffEmail: staffEmail,
            type: { $in: ['voucher_approved', 'task_assigned'] }
        })
        .sort({ createdAt: -1 })
        .limit(50);
            
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching staff notifications:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark notification as read
router.patch('/notifications/staff/:notificationId/read', async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { staffEmail } = req.body;

        if (!staffEmail) {
            return res.status(400).json({ message: 'Staff email is required' });
        }

        const notification = await Notification.findOne({
            _id: notificationId,
            staffEmail: staffEmail
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;